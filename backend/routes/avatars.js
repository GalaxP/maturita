var express = require('express');
var createError = require("http-errors");
var router = express.Router();
const Avatar = require('../schemas/avatar')
const path = require('path');

router.get("/:avatar", async function(req, res, next) {
    const avatar = req.params.avatar;
    if(!avatar) return next(createError.BadRequest())
    const avatarPath = await Avatar.findOne({filename: avatar})
    if(!avatarPath) return next(createError.BadRequest("Avatar does not exist"))

    const options = {
        root: path.dirname(require.main.filename)
    };
    res.sendFile(avatarPath.path, options, function (err) {
        if (err) {
            next(createError.InternalServerError());
        }
    });
    //res.send("success")
})

router.get("/community/:name", async function(req, res, next) {
    const name = req.params.name;
    if(!name) return next(createError.BadRequest())
    const avatarPath = await Avatar.findOne({filename: name})
    if(!avatarPath) return next(createError.BadRequest("Avatar does not exist"))

    const options = {
        root: path.dirname(require.main.filename)
    };
    res.sendFile(avatarPath.path, options, function (err) {
        if (err) {
            next(createError.InternalServerError());
        }
    });
    //res.send("success")
})

module.exports = router;