var express = require('express');
const { verifyAccessToken } = require('../helpers/jwt');
const { postActionSchema } = require('../helpers/validation')
const PostAction = require('../schemas/postAction')
const Post = require('../schemas/post');
const Comment = require('../schemas/comment');
var createError = require("http-errors");
const verifyRecaptcha = require('../helpers/recaptcha');
const { IsUserBanned } = require('../helpers/account');
var router = express.Router();

router.post("/action", verifyAccessToken, verifyRecaptcha("action"), async (req, res, next) => {
    try {
        const result = await postActionSchema.validateAsync(req.body)
        .catch(()=>{
            throw createError.UnprocessableEntity()
        });
        if(result.type !== "vote" && result.type !== "comment") throw createError.UnprocessableEntity()

        var post;
        if(result.type === "comment") {
            post = await Comment.findById(result.postId)
            .catch(()=> {
                throw createError.UnprocessableEntity()
            })
        } else {
            post = await Post.findById(result.postId)
            .catch(()=> {
                throw createError.UnprocessableEntity()
            })
        }

        if(!post || await IsUserBanned(post.author)) return next(createError.UnprocessableEntity(`${result.type !== "vote" ? "comment" : "post"} with the id ${result.postId} doesn't exist`))

        const previousAction = await PostAction.findOne({userId: req.payload.aud, postId: result.postId})
        if(previousAction) {
            if(previousAction.type === result.type && previousAction.direction === result.direction) return next(createError.Conflict("already voted"))
            await PostAction.findByIdAndUpdate(previousAction._id, {direction: result.direction}).catch((err)=> {return next(createError.InternalServerError())})
            return res.send("success")
        }

        const postAction = new PostAction({
            postId: result.postId,
            userId: req.payload.aud,
            type: result.type,
            direction: result.direction
        })

        postAction.save()
        .then(() => {
            res.send("success")
        })
        .catch((err)=> {
            throw err
        })
    } catch(err) {
        console.log(err)
        if(err.status === 422) { return next(err) }
        return next(createError.InternalServerError())
    }
})

router.post('/:postId/comment', verifyAccessToken, verifyRecaptcha("comment"), async (req, res, next)=> {
    if(!req.body.body) return next(createError.BadRequest())
    const id = req.params.postId
    if(!id) return next(createError.BadRequest())
    const post = await Post.findById(id).catch(()=> {})
    if(!post || await IsUserBanned(post.author)) return next(createError.BadRequest("post with the id "+id+" does not exist"))
    
    const _comment = new Comment({
        author: req.payload.aud,
        body: req.body.body,
    })
    await _comment.save();
    post.comments.push(_comment)
    await post.save().catch((err)=>{console.log(err);return next(createError.InternalServerError())});

    res.send(_comment._id)
})

router.post('/:postId/comment/:commentId', verifyAccessToken, verifyRecaptcha("reply"), async (req, res, next)=> {
    if(!req.body.body) return next(createError.BadRequest())
    const postId = req.params.postId
    const commentId = req.params.commentId
    if(!postId || ! commentId) return next(createError.BadRequest())
    const post = await Post.findById(postId).catch(()=> {})
    const comment = await Comment.findById(commentId).catch(()=> {})

    if(!post || await IsUserBanned(post.author)) return next(createError.BadRequest("post with the id "+postId+" does not exist"))
    if(!commentId) return next(createError.BadRequest())
    if(!comment || await IsUserBanned(comment.author)) return next(createError.BadRequest("comment with the id "+commentId+" does not exist"))
    
    const _comment = new Comment({
        author: req.payload.aud,
        body: req.body.body,
    })
    await _comment.save();
    comment.comments.push(_comment)
    await comment.save().catch(()=>{return next(createError.InternalServerError())});
    await post.save().catch(()=>{return next(createError.InternalServerError())});

    res.send("success")
})

module.exports = router;