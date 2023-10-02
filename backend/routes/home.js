var express = require('express');
var router = express.Router();
const User = require('../schemas/user')
var { postSchema } = require('../helpers/validation')
var createError = require("http-errors");
const Post = require('../schemas/post');
const { verifyAccessToken } = require('../helpers/jwt');
const getPostById = require('../helpers/post')
const jwt = require('jsonwebtoken');

//const { createAvatar } = require('@dicebear/core');
//const { identicon } = require('@dicebear/collection');

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

  const _post = await getPostById(req.params.postId, isAuth, userId)
  if(!_post) return next(createError(422))
  res.send(_post)
})

router.get('/postsList', async function(req, res, next){
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
  const returns = []
  var index = 0
  let posts = await Post.find({}).sort('-createdAt')
  for(const _post of posts) {
    returns[index] = await getPostById(_post._id, isAuth, userId)
    index++
  }
  res.send(returns)
});

router.get('/avatar', async function (req, res) {
  const createAvatar = await import('@dicebear/core');
  const identicon = await import('@dicebear/collection');

  const avatar = createAvatar.createAvatar(identicon.identicon, {
    seed:"felix",
  });
  const avatar_buffer = await avatar.png().toDataUri()
  res.send(avatar_buffer)
})
router.get('/avatar.png', async function(req, res) {
  const createAvatar = await import('@dicebear/core');
  const identicon = await import('@dicebear/collection');

  const avatar = createAvatar.createAvatar(identicon.identicon, {
    seed:"felix",
    size: 64,
    scale: 70
  });
  const avatar_buffer = await avatar.png().toArrayBuffer()
  res.setHeader('Content-type', 'image/png')
  
  res.send(Buffer.from(avatar_buffer))
})


module.exports = router;
