var express = require('express');
var router = express.Router();
const { createCommunitySchema } = require("../helpers/validation")
const createError = require('http-errors');
const Community = require('../schemas/community');
const { verifyAccessToken } = require('../helpers/jwt');
const jwt = require('jsonwebtoken')
const pick = require('../helpers/pick');
const Post = require('../schemas/post');
const getPostById = require('../helpers/post');

router.post("/create", verifyAccessToken, async (req, res, next)=> {
    var err;
    const result = await createCommunitySchema.validateAsync(req.body).catch((_err)=>{err = _err})
    if(!result) return next(createError.BadRequest(err.details[0].message));
    const doesExist = await Community.findOne({name: result.name})
    if(doesExist) next(createError.Conflict("community with the name " + result.name +" already exists."))
    const community = new Community({
        createdBy: req.payload.aud,
        name: result.name,
        description: result.description,
        moderators: req.payload.aud
    })

    try {
        await community.save()
        res.send("success")
    }
    catch(err) {
        next(createError.InternalServerError())
    }
})

router.post("/search", async (req, res, next)=> {
    if(!req.body.query) return next(createError.BadRequest("No search query was provided"))
    var regexQuery = {
        name: new RegExp("^"+req.body.query)
    }
    const communities = await Community.find(regexQuery).limit(8)
    if(communities.length === 0) return res.send({})
    var communities_result = []
    communities.map((community, index)=>{
        communities_result[index] = pick(community, "name")
    })
    res.send(communities_result);
})

router.get('/:communityName/posts', async (req, res, next) => {
    if(!req.params.communityName) return next(createError.BadRequest())
    const community = await Community.findOne({name: req.params.communityName})
    if(!community) return next(createError.BadRequest("community does not exist"))

    var isAuth = false
    if(!req.headers["authorization"]) isAuth = false
    const token = req.headers["authorization"]?.split(" ")[1]
    var userId = ""
    var error = null
    if (token!=null) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
            error = err
            return next(createError.Unauthorized(err.name == "TokenExpiredError" ? err.message : "unauthorized"))
        } else {
            isAuth = true
            userId = payload.aud
        }
        })
    }
    if(error) return

    const posts = await Post.find({community: community.name})
    if(!posts) return res.send("No posts yet")
    var returns = []
    var index = 0
    for(const _post of posts) {
        const post = await getPostById(_post._id, isAuth, userId, false)
        if(!post) continue
        returns[index] = post
        index++
    }
    res.send({community:{description:community.description},post:returns})
})

module.exports = router