require('dotenv').config()
const jwt = require('jsonwebtoken')
const tokenModel = require('../schemas/token.js')
var createError = require("http-errors");
const queue = require('async/queue.js');
const User = require('../schemas/user.js');

var q = queue(async function (task, callback) {
    try {
        await task.token.save();
        callback();
    } catch (err) {
        callback(err);
    }
}, 1);

const signAccessToken = (userId, provider) => {
    return new Promise(async (resolve, reject)=>{
        const options = {
            expiresIn: "10m",
            issuer: "odporuc.sk",
            audience: userId
        };
        const user = await User.findOne({uid: userId})

        const payload = {
            provider: provider,
        }

        if(user.roles.length>0) payload.roles = user.roles
        
        jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, options, (err, token) => {
            if(err) 
                return reject(createError.InternalServerError());
            resolve(token);
        })
    })
}

const signRefreshToken = (userId, provider) => {
    return new Promise((resolve, reject)=>{
        const options = {
            expiresIn: "30d",
            issuer: "odporuc.sk",
            audience: userId,
        };
        
        jwt.sign({provider: provider}, process.env.REFRESH_TOKEN_SECRET, options, async (err, token) => {
            if(err) 
                return reject(createError.InternalServerError());

            const _token = new tokenModel({
                token: token,
                uid: userId,
                expireAt: Date.now() + 30 * 24 * 60 * 60 * 1000, //30 days
            })
            q.push({token: _token }, (err) => {if(err){ return reject(err); }})
            /*
            try {
                await _token.save();
            } catch (err) {
                return reject(err);
            }*/
            resolve(token);
        })
    })
}

const verifyAccessToken = (req, res, next) => {
    if(!req.headers["authorization"]) return next(createError.Unauthorized())
    const token = req.headers["authorization"].split(" ")[1]
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
            const message = err.name === "JsonWebTokenError" ? "" : err.message;
            return next(createError.Unauthorized(message));
        }
        req.payload = payload
        next()
    });
}

const verifyAccessTokenIfProvided = (req, res, next) => {
    req.payload = {};
    
    if(!req.headers["authorization"]) {req.payload.authenticated = false; return next()}
    const token = req.headers["authorization"].split(" ")[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
            const message = err.name === "JsonWebTokenError" ? "" : err.message;
            req.payload.authenticated = false
            return next(createError.Unauthorized(message));
        }
        req.payload = payload
        req.payload.authenticated = true
        next()
    });
}

const verifyRefreshToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
        jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET,
          async (err, payload) => {
            if (err) return reject(createError.Unauthorized());
            const userId = payload.aud;
  
            const refreshTokenDb = await tokenModel.findOne({ uid: userId }).catch(
              (err) => {
                //console.log(err);
                return reject(createError.InternalServerError());
              }
            );
            if (refreshTokenDb === null)
              return reject(createError.Unauthorized());
  
            if (refreshTokenDb.token === refreshToken) return resolve(payload);
            else return reject(createError.Unauthorized());
          }
        );
    });
}

const isAuthorized = (role) => {
    return (req, res, next) => {
        if(!req.payload || !req.payload.roles) return next(createError.Forbidden())
        console.log(req.payload.roles.indexOf(role))
        if(req.payload.roles.indexOf(role) === -1) return next(createError.Forbidden())
        return next()
    }
}

module.exports = {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyAccessTokenIfProvided,
    verifyRefreshToken,
    isAuthorized
}