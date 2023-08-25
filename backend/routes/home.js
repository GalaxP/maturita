var express = require('express');
var router = express.Router();
const User = require('../schemas/user')
var { postSchema } = require('../helpers/validation')
var createError = require("http-errors");
const Post = require('../schemas/post');
const { verifyAccessToken } = require('../helpers/jwt');
const pick = require('../helpers/pick')

router.get('/', async function(req, res, next) {
  res.send("hello");
});

router.post('/post', verifyAccessToken, async function (req, res, next) {
  try{
    const result = await postSchema.validateAsync(req.body).catch((err) => {
      err.status = 422;
      throw err;
    });
    
    const _post = new Post({
      author: req.payload.aud,
      body: result.body,
      title: result.title,
    })

    _post.save().then(()=>{
      res.send("success");
    }).catch((err)=>{
      if(err) {
        err.status = 500;
        return next(createError.InternalServerError());
      }
    });
  } catch (error) {
    if (error.isJoi === true)
      return next(createError(422));
  }
})

router.get('/post/:postId', async function (req, res, next) {
  Post.findById(req.params.postId)
  .then((_post)=> {
    res.send(pick(_post, "id", "title", "body", "author", "createdAt"))
  })
  .catch(()=>{
    return next(createError(422))
  })
  
})

router.get('/postsList', async function(req, res, err){
  res.send((await Post.find({}).sort('-createdAt')));
});


module.exports = router;
