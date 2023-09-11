var express = require('express');
var router = express.Router();
var createError = require("http-errors");
var { userSchema } = require('../helpers/validation')
var User  = require('../schemas/user')
const { HashPassword } = require('../helpers/hash')
const { v4 } = require('uuid');
const jwt = require('../helpers/jwt');
const Token = require('../schemas/token');
const pick = require('../helpers/pick')
const rateLimit = require('express-rate-limit');
const {OAuth2Client} = require('google-auth-library');
require('dotenv').config()

const rateLimiterUsingThirdParty = rateLimit({
    windowMs: 100, // 1 second
    max: 1,
    message: 'You have exceeded the 1 requests in 10 ms limit!', 
    standardHeaders: true,
    legacyHeaders: false,
});



router.post('/register', async function(req, res, next) {
    try {
    const result = await userSchema.validateAsync(req.body).catch((err) => {
        throw createError(400);
    });

    const doesExist = await User.findOne({ email: result.email });

    if (doesExist)
      return next(createError.Conflict(`${result.email} has already been registered`));

    const hashedPassword = await HashPassword(result.password)
    const _user = new User(
    {
        provider: "local",
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        password: hashedPassword,
        uid: v4()
    })

    _user.save().then(() => {
        res.send("success")
    }).catch((err)=>{
        console.log(err);
        next(createError.InternalServerError())
    });
    
    } catch(err) {
        next(createError(err))
    }
})

router.post('/login', async function(req, res, next) {
    const body = req.body;

    if(body.email == null || body.password == null) {
        return next(createError(400));
    }
    
    const user = await User.findOne({email: body.email})
    if(user === null)
        return next(createError.Unauthorized("Invalid Credentials"))

    const authResult  = await user.isValidPassword(body.password);
    if(authResult) {
        if(user.roles.length>0) console.log("user has roles")
        const accessToken = await jwt.signAccessToken(user.uid, "local")
        const refreshToken = await jwt.signRefreshToken(user.uid, "local")
        res.cookie("refreshToken", refreshToken, {httpOnly:true, sameSite:"lax", maxAge: 30 * 24 * 60 * 60 * 1000}) //30days
        res.send({
            message: "success",
            user: pick(user, "email", "uid"),
            provider: "local",
            accessToken: accessToken
        })
    }
    else {
        return next(createError.Unauthorized("Invalid Credentials"))
    }
})

router.post("/refresh-token"/*, rateLimiterUsingThirdParty*/, async function (req, res, next) {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) throw createError.BadRequest();
        const token = await jwt.verifyRefreshToken(refreshToken);
        const accessToken = await jwt.signAccessToken(token.aud, token.provider);
        const refreshToken_ = await jwt.signRefreshToken(token.aud, token.provider).catch((err)=>{next(createError.InternalServerError())});
        res.cookie("refreshToken", refreshToken_, {httpOnly:true, sameSite:"lax", maxAge: 30 * 24 * 60 * 60 * 1000})
        //res.cookie("accessToken", accessToken, {httpOnly:true, sameSite:"lax"})
        
        res.send({
            message: "success",
            accessToken: accessToken
        })
    } catch (err) {
        next(err);
    }
});

router.post("/logout", async function (req, res, next) {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) throw createError.BadRequest();
        const token = await jwt.verifyRefreshToken(refreshToken);
        Token.deleteMany({ uid: token.aud }).catch((err) => {
          console.log(err);
          throw createError.InternalServerError();
        });
        res.clearCookie("refreshToken")
        res.clearCookie("accessToken")
        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
})

router.get("/protected", jwt.verifyAccessToken, function (req, res, next) {
    res.send({ message: "You are authenticated", payload: req.payload });
});


const client = new OAuth2Client();
async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  return payload;
  // If request specified a G Suite domain:
  // const domain = payload['hd'];
}

/*
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/account/google/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
      
    userProfile=profile;
    const profile_json = profile._json
    const doesExist = await User.findOne({uid: profile_json.sub});
    if (doesExist) return done(null, userProfile);
    const google_user = new User({
        provider: "google",
        email: profile_json.email,
        firstName: profile_json.given_name,
        lastName: profile_json.family_name,
        uid: profile_json.sub,
        google: profile_json
    }) 

    google_user.save().then(() => {
        return done(null, userProfile);
    }).catch((err)=>{
        console.log(err)
        return done(err, null);
    });
  }
  
));*/
/*
router.get('/google', passport.authenticate('google', { scope:[ 'email', 'profile' ] }
));

router.get('/google/callback', passport.authenticate( 'google', {  failureRedirect: '/auth/google/failure', session:false }), async (req, res)=>
{
    //console.log(req)
    const accessToken = await jwt.signAccessToken(req.user._json.sub, "google").catch((err)=>{console.log(err)})
    const refreshToken = await jwt.signRefreshToken(req.user._json.sub, "google")
    const user = await User.findOne({uid: req.user._json.sub});
    
    res.cookie("refreshToken", refreshToken, {httpOnly:true, sameSite:"lax", maxAge: 30 * 24 * 60 * 60 * 1000}) //30days
    
    const user_json =JSON.stringify({user: pick(user, "email", "uid", "google")})
    res.redirect(process.env.CLIENT_DOMAIN +"?at="+ encodeURIComponent(accessToken) + "&u="+ encodeURIComponent(user_json))
});

router.get('/google/logout', function(req, res, next) {
    
});*/
router.post('/google/callback', async (req,res)=> {
    const payload = await verify(req.body.credential);
    //console.log(payload);
    

    const doesExist = await User.findOne({uid: payload.sub});
    if (!doesExist) {
        const google_user = new User({
            provider: "google",
            email: payload.email,
            firstName: payload.given_name,
            lastName: payload.family_name,
            uid: payload.sub,
            google: payload
        }) 

        await google_user.save().catch((err)=>{
            console.log(err)
            return redirect(process.env.CLIENT_DOMAIN)
        });
    }

    const user = await User.findOne({uid: payload.sub});
    const user_json = JSON.stringify({user: pick(user, "email", "uid"), provider:"google"})

    const accessToken = await jwt.signAccessToken(payload.sub, "google")
    const refreshToken = await jwt.signRefreshToken(payload.sub, "google").catch((err)=>{next(createError.InternalServerError())});
    
    res.cookie("refreshToken", refreshToken, {httpOnly:true, sameSite:"lax", maxAge: 30 * 24 * 60 * 60 * 1000})
    res.redirect(process.env.CLIENT_DOMAIN+"google/callback?user=" + encodeURIComponent(user_json) + "&token="+accessToken)
})

module.exports = router;