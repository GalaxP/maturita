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
const rateLimit = require('express-rate-limit')

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
        const accessToken = await jwt.signAccessToken(user.uid)
        const refreshToken = await jwt.signRefreshToken(user.uid)
        res.cookie("refreshToken", refreshToken, {httpOnly:true, sameSite:"lax", maxAge: 30 * 24 * 60 * 60 * 1000}) //30days
        res.send({
            message: "success",
            user: pick(user, "email", "uid"),
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
        const userId = await jwt.verifyRefreshToken(refreshToken);
        
        const accessToken = await jwt.signAccessToken(userId);
        const refreshToken_ = await jwt.signRefreshToken(userId).catch((err)=>{next(createError.InternalServerError())});
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
        const userId = await jwt.verifyRefreshToken(refreshToken);
        Token.deleteMany({ uid: userId }).catch((err) => {
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
  
module.exports = router;