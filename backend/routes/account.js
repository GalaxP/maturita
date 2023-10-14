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
const verifyRecaptcha = require('../helpers/recaptcha');
const { default: axios } = require('axios');
require('dotenv').config()

const rateLimiterUsingThirdParty = rateLimit({
    windowMs: 100, // 1 second
    max: 1,
    message: 'You have exceeded the 1 requests in 10 ms limit!', 
    standardHeaders: true,
    legacyHeaders: false,
});



router.post('/register', verifyRecaptcha("register"), async function(req, res, next) {
    try {
    const result = await userSchema.validateAsync(req.body).catch((err) => {
        throw createError(400);
    });
    if(!req.body.token) return next(createError.BadRequest())
    const doesExist = await User.findOne({ email: result.email });

    if (doesExist)
      return next(createError.Conflict(`email ${result.email} has already been registered`));

    const doesDisplayNameExist = await User.findOne({displayName: result.displayName})
    if (doesDisplayNameExist)
        return next(createError.Conflict(`username ${result.displayName} has already been registered`));

    const hashedPassword = await HashPassword(result.password)
    const _user = new User(
    {
        provider: "local",
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        displayName: result.displayName,
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

router.post('/login', verifyRecaptcha("login"), async function(req, res, next) {
    const body = req.body;

    if(body.email == null || body.password == null) {
        return next(createError(400));
    }
    
    const user = await User.findOne({email: body.email})
    if(user === null)
        return next(createError.Unauthorized("Invalid Credentials"))

    const authResult  = await user.isValidPassword(body.password);
    if(authResult) {
        const accessToken = await jwt.signAccessToken(user.uid, "local")
        const refreshToken = await jwt.signRefreshToken(user.uid, "local")
        res.cookie("refreshToken", refreshToken, {httpOnly:true, sameSite:"lax", maxAge: 30 * 24 * 60 * 60 * 1000}) //30days
        res.send({
            message: "success",
            user: pick(user, "email", "uid", "avatar"),
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

router.get("/protected", jwt.verifyAccessToken, jwt.isAuthorized('admin'), function (req, res, next) {
    res.send({ message: "You are authenticated and authorized", payload: req.payload });
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
}



router.post('/google/callback', async (req,res)=> {
    if(!req.body.credential) return res.redirect(process.env.CLIENT_DOMAIN)
    const payload = await verify(req.body.credential);

    const doesExist = await User.findOne({uid: payload.sub});
    if (!doesExist) {
        const google_user = new User({
            provider: "google",
            email: payload.email,
            firstName: payload.given_name,
            lastName: payload.family_name,
            uid: payload.sub,
            google: payload,
            displayName: payload.given_name + " " + payload.family_name
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
    res.redirect(process.env.CLIENT_DOMAIN + "google/callback?user=" + encodeURIComponent(user_json) + "&token="+accessToken)
})

module.exports = router;