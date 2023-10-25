var express = require('express');
var router = express.Router();
const User = require('../schemas/user')
const { postSchema } = require('../helpers/validation')
var createError = require("http-errors");
const Post = require('../schemas/post');
const { verifyAccessToken, verifyAccessTokenIfProvided } = require('../helpers/jwt');
const getPostById = require('../helpers/post')
const jwt = require('jsonwebtoken');
const verifyRecaptcha = require('../helpers/recaptcha');
const createDefaultAvatar = require('../helpers/avatar');
const Community = require('../schemas/community');
const pick = require('../helpers/pick');

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
    const community = await Community.findOne({name: result.community})
    if(!community) return next(createError.BadRequest("community does not exist or was not specified"))

    const _post = new Post({
      author: req.payload.aud,
      body: result.body,
      title: result.title,
      community: result.community
    })

    _post.save().then(()=>{
      res.send("success");
    }).catch((err)=>{
      if(err) {
        //console.log(err)
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

router.post('/search', /*verifyRecaptcha('search'),*/ verifyAccessTokenIfProvided, async function(req, res, next) {
  if(!req.body.query || !req.body.type) return next(createError.BadRequest("No search query was provided"))
  
  var result = []
  switch (req.body.type) {
    case "community":
      try {
      var regexQuery = {
        name: new RegExp("^"+req.body.query)
      } } catch(err) {return next(createError.BadRequest())}

      const communities = await Community.find(regexQuery).limit(8)
      if(communities.length === 0) return res.send({})
      communities.map((community, index)=>{
        result[index] = pick(community, "name", "description", "avatar")
        result[index].members = community.members.length
        if(req.payload.authenticated) result[index].isMember = community.members.findIndex((mem)=>mem===req.payload.aud) !== -1
      })

      return res.send(result)
      case "post":
        const posts = await Post.find({$text: {$search: req.body.query}}).limit(8)
        var returns = [];
        var index = 0;
        for(const _post of posts) {
          const post = await getPostById(_post._id, req.payload.authenticated, req.payload.aud, false)
          if(!post) continue
          returns[index] = post
          index++
        }
        return res.send(returns)
    case "user":
      try {
      var regexQuery = {
        displayName: new RegExp(req.body.query)
      } } catch(err) {return next(createError.BadRequest())}
      const users = await User.find(regexQuery).select('uid displayName avatar provider').limit(10)
      let results = []
      for (let index = 0; index < users.length; index++) {
        results[index] = {...users[index]._doc, posts: (await Post.find({author: users[index].uid})).length}
        
      }

      return res.send(results)
    default:
      return next(createError.BadRequest("No search type was provided"))
  }
})


module.exports = router;
