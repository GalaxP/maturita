var express = require('express');
const { verifyAccessToken } = require('../helpers/jwt');
const { postActionSchema } = require('../helpers/validation')
const PostAction = require('../schemas/postAction')
const Post = require('../schemas/post');
var createError = require("http-errors");
var router = express.Router();

router.post("/action", verifyAccessToken, async (req, res, next) => {
    try {
        const result = await postActionSchema.validateAsync(req.body)
        .catch(()=>{
            throw createError.UnprocessableEntity()
        });
        if(result.type !== "vote") throw createError.UnprocessableEntity()

        const post = await Post.findById(result.postId)
        .catch(()=> {
            throw createError.UnprocessableEntity()
        })
        if(!post) return next(createError.UnprocessableEntity(`post with the id ${result.postId} doesn't exist`))

        const previousAction = await PostAction.findOne({userId: req.payload.aud, postId: result.postId})
        if(previousAction) {
            if(previousAction.type === result.type && previousAction.direction === result.direction) return next(createError.Conflict("already voted"))
            //previousAction.deleteOne().catch((err)=> {throw err})
            //await PostAction.deleteMany({userId: req.payload.aud, postId: result.postId}).catch((err)=> {}) //if you send requests too fast it will leave with 2 votes per user
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

module.exports = router;