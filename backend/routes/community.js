var express = require('express');
var router = express.Router();
const { createCommunitySchema } = require("../helpers/validation")
const createError = require('http-errors');
const Community = require('../schemas/community');
const { verifyAccessToken } = require('../helpers/jwt');
const mongoose = require('mongoose')

router.post("/create", verifyAccessToken, async (req, res, next)=> {
    var err;
    const result = await createCommunitySchema.validateAsync(req.body).catch((_err)=>{err = _err})
    if(!result) return next(createError.BadRequest(err.details[0].message));
    const doesExist = await Community.findOne({name: result.name})
    if(doesExist) next(createError.Conflict("community with the name " + result.name +" already exists."))
    const community = new Community({
        createdBy: req.payload.aud,
        name: result.name,
        description: result.description,
        moderators: req.payload.aud
    })

    try {
        await community.save()
        res.send("success")
    }
    catch(err) {
        next(createError.InternalServerError())
    }
})

router.post("/search", async (req, res, next)=> {
    if(!req.body.query) return next(createError.BadRequest("No search query was provided"))
    var regexQuery = {
        name: new RegExp("^"+req.body.query)
    }
    const communities = await Community.find(regexQuery).limit(8)
    if(communities.length === 0) return res.send({})
    res.send(communities);
})
module.exports = router