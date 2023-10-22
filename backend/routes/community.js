var express = require('express');
var router = express.Router();
const { createCommunitySchema } = require("../helpers/validation")
const createError = require('http-errors');
const Community = require('../schemas/community');
const { verifyAccessToken, verifyAccessTokenIfProvided } = require('../helpers/jwt');
const jwt = require('jsonwebtoken')
const pick = require('../helpers/pick');
const Post = require('../schemas/post');
const getPostById = require('../helpers/post');
const { createDefaultCommunityAvatar } = require('../helpers/avatar')

router.post("/create", verifyAccessToken, async (req, res, next)=> {
    var err;
    const result = await createCommunitySchema.validateAsync(req.body).catch((_err)=>{err = _err})
    if(!result) return next(createError.BadRequest(err.details[0].message));
    const doesExist = await Community.findOne({name: result.name})
    if(doesExist) return next(createError.Conflict("community with the name " + result.name +" already exists."))
    let regex = /^(?!_)[A-Za-z0-9_]+$/g
    if(!regex.test(result.name)) return next(createError.BadRequest("Name must only contain numbers and letters or underscores and must not start with an underscore."))
    const avatarPath = await createDefaultCommunityAvatar(result.name).catch((err)=>{return next(createError.InternalServerError(err.message))})

    const community = new Community({
        createdBy: req.payload.aud,
        name: result.name,
        description: result.description,
        moderators: req.payload.aud,
        avatar: "/avatars/community/"+result.name+".png",
    })

    try {
        await community.save()
        res.send("success")
    }
    catch(err) {
        next(createError.InternalServerError())
    }
})

router.post("/search", verifyAccessTokenIfProvided, async (req, res, next)=> {
    if(!req.body.query) return next(createError.BadRequest("No search query was provided"))
    var regexQuery = {
        name: new RegExp("^"+req.body.query)
    }
    const communities = await Community.find(regexQuery).limit(8)
    if(communities.length === 0) return res.send({})
    var communities_result = []
    communities.map((community, index)=>{
        communities_result[index] = pick(community, "name", "avatar")
        if(req.payload.authenticated) communities_result[index].isMember = community.members.findIndex((mem)=>mem===req.payload.aud) !== -1
    })
    res.send(communities_result);
})
function getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
    return new Date(d.setDate(diff)).setHours(0,0,0,0);
}
  
router.get('/:communityName/posts', verifyAccessTokenIfProvided, async (req, res, next) => {
    if(!req.params.communityName) return next(createError.BadRequest())
    const community = await Community.findOne({name: req.params.communityName})
    if(!community) return next(createError.BadRequest("community does not exist"))

    var posts = [{}];
    const _date = new Date()
    //_date.setFullYear(_date.getFullYear(), _date.getMonth(), 1)

    if(req.query.sort==="newest" || req.query.sort==="best") {
        if(req.query.sort === "best") {
            if(req.query.t==="alltime") { posts = await Post.find({community: community.name})}
            else if(req.query.t==="day") { posts = await Post.find({community: community.name, createdAt: {$gte: new Date(_date.setHours(0,0,0,0)) }})}
            else if(req.query.t==="week") { posts = await Post.find({community: community.name, createdAt: {$gte: new Date(getMonday(_date)) }})}
            else if(req.query.t==="month") { posts = await Post.find({community: community.name, createdAt: {$gte: new Date(_date.getFullYear(), _date.getMonth(), 1) }})}
            else if(req.query.t==="year") { posts = await Post.find({community: community.name, createdAt: {$gte: _date.setFullYear(_date.getFullYear(), 0, 1) }})}
            else return next(createError.BadRequest("incorrect sort"))
        } else {posts = await Post.find({community: community.name}).sort({createdAt: 'desc'})}
    } else {return next(createError.BadRequest("incorrect sort"))}
    if(!posts) return res.send("No posts yet")
    var returns = []
    var index = 0
    for(const _post of posts) {
        const post = await getPostById(_post._id, req.payload.authenticated, req.payload.aud, false)
        if(!post) continue
        returns[index] = post
        index++
    }
    if(req.query.sort=== "best") returns.sort((firstItem, secondItem) => secondItem.votes_likes - firstItem.votes_likes)
    if(req.payload.authenticated) return res.send({community:{description:community.description, members: community.members.length, avatar: community.avatar, isMember: community.members.findIndex((mem)=>mem===req.payload.aud)!==-1},post:returns})
    res.send({community:{description:community.description, members: community.members.length},post:returns})
})

router.get('/:communityName', verifyAccessTokenIfProvided, async (req, res, next) => {
    if(!req.params.communityName) return next(createError.BadRequest())
    const community = await Community.findOne({name: req.params.communityName})
    if(!community) return next(createError.BadRequest("community does not exist"))
    if(req.payload.authenticated) return res.send({name: community.name, description: community.description, members: community.members.length, isMember: community.members.findIndex(req.payload.aud)!==-1})
    res.send({name: community.name, description:community.description, avatar: community.avatar, members: community.members.length})
})

router.post('/:communityName/join', verifyAccessToken, async (req, res, next) => {
    if(!req.params.communityName) return next(createError.BadRequest())
    const community = await Community.findOne({name: req.params.communityName})
    if(!community) return next(createError.BadRequest("community does not exist"))

    if(community.members.findIndex((mem)=>mem===req.payload.aud) !== -1) return next(createError.BadRequest("already a member"))
    community.members.push(req.payload.aud);
    try {
        community.save()
        res.send("success")
    }
    catch{
        return next(createError.InternalServerError())
    }
})

router.post('/:communityName/leave', verifyAccessToken, async (req, res, next) => {
    if(!req.params.communityName) return next(createError.BadRequest())
    const community = await Community.findOne({name: req.params.communityName})
    if(!community) return next(createError.BadRequest("community does not exist"))

    const index = community.members.findIndex((mem)=>mem===req.payload.aud)
    //console.log(index)
    if(index === -1) return next(createError.BadRequest("not a member"))
    community.members.splice(index, 1)
    try {
        community.save()
        res.send("success")
    }
    catch{
        return next(createError.InternalServerError())
    }
})

module.exports = router