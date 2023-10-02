var express = require('express');
const { verifyAccessToken } = require('../helpers/jwt');
const Post = require('../schemas/post');
var createError = require("http-errors");
var router = express.Router();

router.post("/post/:postId", verifyAccessToken, async function(req, res, next) {
    const post_id = req.params.postId;
    const post = await Post.findById(post_id).catch(()=>{return next(createError.BadRequest())})
    if(!post) return next(createError.BadRequest())
    if(post.author !== req.payload.aud) return next(createError.Forbidden())
    await Post.findByIdAndDelete(post_id).catch(()=>{return next(createError.InternalServerError())})
    res.send("success")
})

module.exports = router;