var express = require('express');
var router = express.Router();
const User = require('../schemas/user')
const { postSchema, contactSchema, emailSchema, newsLetterSchema } = require('../helpers/validation')
var createError = require("http-errors");
const Post = require('../schemas/post');
const { verifyAccessToken, verifyAccessTokenIfProvided, isAuthorized } = require('../helpers/jwt');
const getPostById = require('../helpers/post')
const jwt = require('jsonwebtoken');
const verifyRecaptcha = require('../helpers/recaptcha');
const createDefaultAvatar = require('../helpers/avatar');
const Community = require('../schemas/community');
const pick = require('../helpers/pick');
const Contact = require('../schemas/contact');
const Subscriber = require('../schemas/subscriber');
const crypto = require('crypto');
const { emailTransporter, getConfirmEmailBody, getNewsletterBody } = require('../helpers/email');

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

    if(!result.tag) result.tag=null
    const _post = new Post({
      author: req.payload.aud,
      body: result.body,
      title: result.title,
      community: result.community,
      tag: result.tag
    })

    _post.save().then(()=>{
      res.send("success");
    }).catch((err)=>{
      if(err) {
        //console.log(err)
        console.log(err)
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

router.post('/search', verifyRecaptcha('search'), verifyAccessTokenIfProvided, async function(req, res, next) {
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
      const users = await User.find({displayName: {$regex: new RegExp(req.body.query), $options: 'i'}}).select('uid displayName avatar provider').limit(10)
      let results = []
      for (let index = 0; index < users.length; index++) {
        results[index] = {...users[index]._doc, posts: (await Post.find({author: users[index].uid})).length}
      }

      return res.send(results)
    default:
      return next(createError.BadRequest("No search type was provided"))
  }
})

router.post('/contact', verifyRecaptcha("contact"), async (req, res, next) => {
  const result = await contactSchema.validateAsync(req.body).catch((err)=>{
    return next(createError.BadRequest(err.message))
  })
  if(!result) return;
  const userAgent = req.headers['user-agent'];
  const remoteIP =  req.headers['x-forwarded-for'] || req.socket.remoteAddress 

  const contact = new Contact({
    firstName: result.firstName,
    lastName: result.lastName,
    body: result.body,
    email: result.email,
    title: result.title,
    remoteIP: remoteIP,
    userAgent: userAgent
  })

  await contact.save().then(()=> {
    return res.send("success")
  })
  .catch((err)=> { 
    return next(createError.InternalServerError())
  })
})

router.post('/subscribe', async (req, res, next) => {  
  const result = await emailSchema.validateAsync(req.body).catch((err)=>{
    return next(createError.BadRequest(err.message))
  })
  if(!result) return;

  const email = result.email
  const doesExist = await Subscriber.findOne({email: email})
  if(doesExist) return next(createError.Conflict(`email ${result.email} has already subscribed to our newsletter`))
  const token = crypto.randomUUID().toString()
  const sub = new Subscriber({
    verified: false,
    token: token,
    email: email
  })

  var mailOptions = {
    from: 'alex.petras@outlook.com',
    to: email,
    subject: 'Please confirm your email',
    html: getConfirmEmailBody(token)
  };
  
  emailTransporter.sendMail(mailOptions, function(error, info){
    if(error) {return next(createError.InternalServerError());console.log(error)}
  });

  await sub.save().then(()=> {
    res.send("success")
  })
  .catch((err)=> { 
    return next(createError.InternalServerError())
  })
})

router.get('/unsubscribe', async (req, res, next) => {
  const token = req.query.token
  if(!token) return next(createError.BadRequest())

  const subscriber = await Subscriber.findOne({token: token})
  if(!subscriber) return next(createError.BadRequest())

  try {
    await subscriber.deleteOne();
    res.send("success")
  }
  catch{
    return next(createError.InternalServerError())
  }
})

router.get('/verify', async(req, res, next) => {
  const token = req.query.token
  if(!token) return next(createError.BadRequest())
  const sub = await Subscriber.findOne({token: token})
  if(!sub) return next(createError.BadRequest())

  if(sub.verified) return next(createError.BadRequest("already verified"))

  var differenceValue =(Date.now() - sub.createdAt) / 1000;
  differenceValue /= 60;

  if(differenceValue > 30) {await sub.deleteOne(); return next(createError.BadRequest("expired. sign up again"))}
  
  sub.verified = true
  await sub.save().then(()=> {
    res.send("successfully verified your email address")
  })
  .catch(()=>{
    return next(createError.InternalServerError())
  })
})

router.post('/sendNewsletter', verifyAccessToken, isAuthorized('admin'), async (req, res, next) => {
  const result = await newsLetterSchema.validateAsync(req.body).catch((err)=>{
    return next(createError.BadRequest(err.message))
  })

  const subscribers = await Subscriber.find({verified: true})
  for(let subscriber of subscribers) {
    var mailOptions = {
      from: 'alex.petras@outlook.com',
      to: subscriber.email,
      subject: 'NewsLetter',
      BroadcastChannel: '',
      html: getNewsletterBody(result.message, result.title, subscriber.token)
    };
    
    await emailTransporter.sendMail(mailOptions).catch((err)=>{});
  }
  res.send("success");
})

router.get('/messages', verifyAccessToken, isAuthorized('admin'), async (req, res, next) => {
  const messages = await Contact.find({read: false}).sort({createdAt: 'asc'})
  res.send(messages)
})
router.post('/message/:messageId/read', verifyAccessToken, isAuthorized('admin'), async(req,res,next)=>{
  const messageId = req.params.messageId
  const message = await Contact.findById(messageId)
  if(!message) return next(createError.NotFound("messsage does note exist"))
  message.read = true
  try {
    message.save()
    res.send("success")
  }
  catch{return next(createError.InternalServerError())}
})
module.exports = router;
