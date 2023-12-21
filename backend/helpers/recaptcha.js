var createError = require("http-errors");
require('dotenv').config()
const axios = require('axios')

const verifyRecaptcha = (action) => {
    return async (req, res, next) => {
        if(!req.body.token) next(createError.BadRequest())
        const requestBody = ({secret: process.env.GOOGLE_RECAPTCHA_SECRET, response: req.body.token})

        axios.post("https://www.google.com/recaptcha/api/siteverify", requestBody, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
        .then((res)=>{
            var result = res.data
            if(result.success !== true || result.score <= 0.5) { console.log(result.score); return next(createError.BadRequest("failed captcha")) }
            if(result.action !== action) {return next(createError.BadRequest("captcha action is incorrect"));}
            next()
        })
        .catch((err)=>{return next(createError.InternalServerError())})        
    }
}

module.exports = verifyRecaptcha