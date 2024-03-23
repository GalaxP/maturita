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
const {OAuth2Client} = require('google-auth-library');
const verifyRecaptcha = require('../helpers/recaptcha');
const Avatar = require('../schemas/avatar')
const path = require('node:path'); 
const { createDefaultAvatar } = require('../helpers/avatar')
require('dotenv').config()


const multer = require('multer');
const Community = require('../schemas/community');
const Log = require('../schemas/log');
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
    if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.heic') {
        return callback('Only images are allowed')
    }
    callback(null, true)
}, limits: {fileSize: 1024*1024}}).single('avatar')



router.post('/register', verifyRecaptcha("register"), async function(req, res, next) {
    try {
    const result = await userSchema.validateAsync(req.body).catch((err) => {
        throw createError.BadRequest(err.message);
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
    
    const user = await User.findOne({email: body.email, banned: false, provider: "local"})
    if(user === null)
        return next(createError.Unauthorized("Invalid Credentials"))

    const authResult  = await user.isValidPassword(body.password);
    if(authResult) {
        const accessToken = await jwt.signAccessToken(user.uid, "local")
        const refreshToken = await jwt.signRefreshToken(user.uid, "local", req)
        res.cookie("refreshToken", refreshToken, {httpOnly:true, sameSite:"lax", maxAge: 30 * 24 * 60 * 60 * 1000}) //30days
        res.send({
            message: "success",
            user: pick(user, "email", "uid", "avatar", "displayName", "roles"),
            provider: "local",
            accessToken: accessToken
        })
        const userAgent = req.headers['user-agent'];
        const remoteIP =  req.headers['x-forwarded-for'] || req.socket.remoteAddress 

        const _log = new Log({
            type: "login",
            data: {
                uid: user.uid,
                remoteIP: remoteIP,
                userAgent: userAgent
            }
        })
        try {
            _log.save()
        } catch {console.error(Date.now().toLocaleString()+" failed to log!")}
    }
    else {
        return next(createError.Unauthorized("Invalid Credentials"))
    }
})

router.post("/refresh-token"/*, rateLimiterUsingThirdParty*/, async function (req, res, next) {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {res.clearCookie("refreshToken");res.clearCookie("account");res.redirect(process.env.CLIENT_DOMAIN+"account/logout")}
        const token = await jwt.verifyRefreshToken(refreshToken, req).catch((err)=>{res.clearCookie("refreshToken");res.clearCookie("account");throw err});
        const accessToken = await jwt.signAccessToken(token.aud, token.provider);
        const refreshToken_ = await jwt.signRefreshToken(token.aud, token.provider, req).catch((err)=>{res.clearCookie("refreshToken");res.clearCookie("account");return next(res.redirect(process.env.CLIENT_DOMAIN))});
        res.cookie("refreshToken", refreshToken_, {httpOnly:true, sameSite:"lax", maxAge: 30 * 24 * 60 * 60 * 1000})
        //res.cookie("accessToken", accessToken, {httpOnly:true, sameSite:"lax"})
        
        res.send({
            message: "success",
            accessToken: accessToken
        })

        const userAgent = req.headers['user-agent'];
        const remoteIP =  req.headers['x-forwarded-for'] || req.socket.remoteAddress 

        const _log = new Log({
            type: "refreshToken",
            data: {
                uid: token.aud,
                remoteIP: remoteIP,
                userAgent: userAgent
            }
        })
        try {
            _log.save()
        } catch {console.error(Date.now().toLocaleString()+" failed to log!")}
    } catch (err) {
        next(err);
    }
});

router.post("/logout", async function (req, res, next) {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) throw createError.BadRequest();
        const token = await jwt.verifyRefreshToken(refreshToken, req);
        Token.deleteMany({ uid: token.aud }).catch((err) => {
          throw createError.InternalServerError();
        });
        res.clearCookie("refreshToken")
        res.clearCookie("accessToken")
        res.sendStatus(204);

        const userAgent = req.headers['user-agent'];
        const remoteIP =  req.headers['x-forwarded-for'] || req.socket.remoteAddress 

        const _log = new Log({
            type: "logout",
            data: {
                uid: token.aud,
                remoteIP: remoteIP,
                userAgent: userAgent
            }
        })
        try {
            _log.save()
        } catch {console.error(Date.now().toLocaleString()+" failed to log!")}
    } catch (error) {
        next(error);
    }
})

router.post("/change-email", verifyRecaptcha("email"), jwt.verifyAccessToken, async function (req, res, next) {
    const email = req.body.email;
    if(!email) return next(createError.BadRequest())

    const emailExists = await User.findOne({email: email})
    if(emailExists) return next(createError.Conflict(`email ${email} has already been registered`));

    const userId = req.payload.aud
    const user = await User.findOne({uid: userId, banned: false})
    if(!user) return next(createError.NotFound("user not found"))

    user.email = email

    try {
        await user.save()
        res.send("success")
    }
    catch {
        return next(createError.InternalServerError())
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
  });
  const payload = ticket.getPayload();
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
            return res.redirect(process.env.CLIENT_DOMAIN)
        });
    }

    const user = await User.findOne({uid: payload.sub});
    var user_pick = pick(user, "email", "uid", "displayName")
    user_pick.avatar = user.google.picture
    const user_json = JSON.stringify({user: user_pick, provider:"google"})

    const accessToken = await jwt.signAccessToken(payload.sub, "google")
    const refreshToken = await jwt.signRefreshToken(payload.sub, "google", req).catch((err)=>{next(createError.InternalServerError())});
    
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
});

router.get('/communities', jwt.verifyAccessToken, async (req,res,next) => {
    const usr = req.payload.aud
    const membered_communities = await Community.find({members: {$all: [usr]}}, 'name description avatar members tags')
    for(let i = 0; i < membered_communities.length; i++) {
        membered_communities[i].members = membered_communities[i].members.length
    }
    
    res.send(membered_communities)
})
module.exports = router;