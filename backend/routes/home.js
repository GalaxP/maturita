var express = require('express');
var router = express.Router();
const User = require('../schemas/user')
const { postSchema } = require('../helpers/validation')
var createError = require("http-errors");
const Post = require('../schemas/post');
const { verifyAccessToken } = require('../helpers/jwt');
const getPostById = require('../helpers/post')
const jwt = require('jsonwebtoken');
const verifyRecaptcha = require('../helpers/recaptcha');
const createDefaultAvatar = require('../helpers/avatar')

//const { createAvatar } = require('@dicebear/core');
//const { identicon } = require('@dicebear/collection');

router.get('/', async function(req, res, next) {
  res.send("hello");
});
router.post('/post', verifyAccessToken, verifyRecaptcha("post"), async function (req, res, next) {
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

  const _post = await getPostById(req.params.postId, isAuth, userId, true)
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
    const post = await getPostById(_post._id, isAuth, userId, false)
    if(!post) continue
    returns[index] = post
    index++
  }
  res.send(returns)
});

router.get('/avatar/:uid', async function (req, res) {
  try {
    await createDefaultAvatar(req, res, req.params.uid)
    res.send("ok")
  } catch(err){
    res.status(500).send(err.message)
  }
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
