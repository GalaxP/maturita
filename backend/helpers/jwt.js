require('dotenv').config()
const jwt = require('jsonwebtoken')
const tokenModel = require('../schemas/token.js')
var createError = require("http-errors");


const signAccessToken = (userId) => {
    return new Promise((resolve, reject)=>{
        const options = {
            expiresIn: "15s",
            issuer: "odporuc.sk",
            audience: userId,
        };

        jwt.sign({}, process.env.ACCESS_TOKEN_SECRET, options, (err, token) => {
            if(err) 
                return reject(createError.InternalServerError());
            resolve(token);
        })
    })
}

const signRefreshToken = (userId) => {
    return new Promise((resolve, reject)=>{
        const options = {
            expiresIn: "30d",
            issuer: "odporuc.sk",
            audience: userId,
        };

        jwt.sign({}, process.env.REFRESH_TOKEN_SECRET, options, async (err, token) => {
            if(err) 
                return reject(createError.InternalServerError());

            const _token = new tokenModel({
                token: token,
                uid: userId,
                expireAt: Date.now() + 30 * 24 * 60 * 60 * 1000, //30 days
            })

            try {
                await _token.save();
            } catch (err) {
                console.log(err);
                return reject(createError.InternalServerError());
            }
            resolve(token);
        })
    })
}

const verifyAccessToken = (req, res, next) => {
    if(!req.headers['authorization']) return next(createError.Unauthorized())
    const token = req.headers['authorization'].split(' ')[1]
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
            const message = err.name === "JsonWebTokenError" ? "" : err.message;
            return next(createError.Unauthorized(message));
        }
        req.payload = payload
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
                console.log(err);
                return reject(createError.InternalServerError());
              }
            );
            if (refreshTokenDb === null)
              return reject(createError.Unauthorized());
  
            if (refreshTokenDb.token === refreshToken) return resolve(userId);
            else return reject(createError.Unauthorized());
          }
        );
    });
}

module.exports = {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
}