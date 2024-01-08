var express = require('express');
var router = express.Router();
var createError = require("http-errors");
const { verifyAccessTokenIfProvided } = require('../helpers/jwt');
const Post = require('../schemas/post')
const User = require('../schemas/user')
const getPostById = require('../helpers/post')

router.get('/:displayName', verifyAccessTokenIfProvided, async function(req, res, next) {
    const displayName = req.params.displayName
    if(!displayName) return next(createError.BadRequest("displayName was not provided"))

    const user = await User.findOne({displayName: { $regex: '^'+displayName+'$', $options: 'i'}});
    if(!user) return next(createError.NotFound("User not found"))
    var isAuth = req.payload.authenticated
    const returns = []
    var index = 0
    let posts = await Post.find({author: user.uid}).sort('-createdAt')
    for(const _post of posts) {
        const post = await getPostById(_post._id, isAuth, req.payload.aud, false)
        if(!post) continue
        returns[index] = post
        index++
    }
    res.send({author: {
        id: user.uid,
        displayName: user.displayName,
        avatar: user.avatar
    },posts_length: posts.length, posts:returns})
})
module.exports = router;