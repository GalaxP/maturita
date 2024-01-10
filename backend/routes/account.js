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
const Avatar = require('../schemas/avatar')
const path = require('node:path'); 
const { createDefaultAvatar } = require('../helpers/avatar')
require('dotenv').config()

const rateLimiterUsingThirdParty = rateLimit({
    windowMs: 100, // 1 second
    max: 1,
    message: 'You have exceeded the 1 requests in 10 ms limit!', 
    standardHeaders: true,
    legacyHeaders: false,
});


const multer = require('multer');
const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, process.env.AVATAR_PATH);
  },
  filename: function (req, file, callback) {
    callback(null, req.payload.aud+path.extname(file.originalname));
  }
});
const upload = multer({storage: storage, fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname).toLowerCase();
    if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
        return callback('Only images are allowed')
    }
    callback(null, true)
}, limits: {fileSize: 1024*1024}}).single('avatar')



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

    const uid = v4()
    await createDefaultAvatar(uid).catch((err)=>{return next(createError.InternalServerError(err.message))})
    const hashedPassword = await HashPassword(result.password)
    const _user = new User(
    {
        provider: "local",
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        displayName: result.displayName,
        password: hashedPassword,
        avatar: "/avatars/"+uid+".png",
        uid: uid,
        banned: false
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
    
    const user = await User.findOne({email: body.email, banned: false})
    if(user === null)
        return next(createError.Unauthorized("Invalid Credentials"))

    const authResult  = await user.isValidPassword(body.password);
    if(authResult) {
        const accessToken = await jwt.signAccessToken(user.uid, "local")
        const refreshToken = await jwt.signRefreshToken(user.uid, "local")
        res.cookie("refreshToken", refreshToken, {httpOnly:true, sameSite:"lax", maxAge: 30 * 24 * 60 * 60 * 1000}) //30days
        res.send({
            message: "success",
            user: pick(user, "email", "uid", "avatar", "displayName", "roles"),
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
        const token = await jwt.verifyRefreshToken(refreshToken).catch((err)=>{res.clearCookie("refreshToken");res.clearCookie("account");throw err});
        const accessToken = await jwt.signAccessToken(token.aud, token.provider);
        const refreshToken_ = await jwt.signRefreshToken(token.aud, token.provider).catch((err)=>{res.clearCookie("refreshToken");res.clearCookie("account");return next(res.redirect(process.env.CLIENT_DOMAIN))});
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
          //console.log(err);
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
            avatar: payload.picture,
            displayName: payload.given_name + " " + payload.family_name,
            banned: false
        })

        await google_user.save().catch((err)=>{
            console.log(err)
            return redirect(process.env.CLIENT_DOMAIN)
        });
    }

    const user = await User.findOne({uid: payload.sub});
    var user_pick = pick(user, "email", "uid", "displayName")
    user_pick.avatar = user.google.picture
    const user_json = JSON.stringify({user: user_pick, provider:"google"})

    const accessToken = await jwt.signAccessToken(payload.sub, "google")
    const refreshToken = await jwt.signRefreshToken(payload.sub, "google").catch((err)=>{next(createError.InternalServerError())});
    
    res.cookie("refreshToken", refreshToken, {httpOnly:true, sameSite:"lax", maxAge: 30 * 24 * 60 * 60 * 1000})
    res.redirect(process.env.CLIENT_DOMAIN + "google/callback?user=" + encodeURIComponent(user_json) + "&token="+accessToken)
})

router.post ('/upload', jwt.verifyAccessToken, async (req, res) => {
    const user = await User.findOne({uid:req.payload.aud});
    if(!user) return next(createError.BadRequest('User not found'))
    
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            if(err.code==='LIMIT_FILE_SIZE') return res.status(400).send("File must be under 1Mb")
            else res.status(400).send('unknown error')
        } else if (err) {
            return res.status(400).send(err)
        }


        if(!req.file) return res.status(400).send("No file was sent")
        let oldAvatar = await Avatar.findOne({filename:{$regex: req.payload.aud}, type: "user"})
        let avatar = new Avatar();
        if(oldAvatar) {
            oldAvatar.filename = req.file.filename,
            oldAvatar.path = req.file.path,
            oldAvatar.type = "user" 
        } else {
            avatar = new Avatar({
                filename: req.file.filename,
                path: req.file.path,
                type: "user"
            });
        }

        user.avatar = "/avatars/"+req.file.filename
        
        try {
            if(oldAvatar) await oldAvatar.save(); else await avatar.save();
            await user.save();
            res.send({msg: 'Image uploaded and saved successfully', avatar: "/avatars/"+req.file.filename});
        } catch (error) {
            res.status(500).send('Error saving image to the database');
            console.log(error)
        }
    })
    // You can perform additional operations with the uploaded image here.
});
module.exports = router;