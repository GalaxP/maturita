const Joi = require('joi')

const postSchema = Joi.object({
    title: Joi.string().required().min(5),
    body: Joi.string().required(),
    community: Joi.string().required(),
    token: Joi.string().required()
})

const userSchema = Joi.object({
    email: Joi.string().required().email().lowercase(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    displayName: Joi.string().required().min(3),
    password: Joi.string().required().min(6),
    token: Joi.string(),
    uid: Joi.string()
})

const postActionSchema = Joi.object({
    postId: Joi.string(),
    commentId: Joi.string(),
    type: Joi.string().required().lowercase(),
    direction: Joi.number().min(-1).max(1).required(),
    token: Joi.string()
}).xor('postId', 'commentId')

const createCommunitySchema = Joi.object({
    name: Joi.string().required().max(40),
    description: Joi.string().required(),
})

const contactSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    title: Joi.string().required(),
    body: Joi.string().required(),
    email: Joi.string().email().required(),
    token: Joi.string()
})
const emailSchema = Joi.object({
    email: Joi.string().email().required()
})
const newsLetterSchema = Joi.object({
    message: Joi.string().required(),
    title: Joi.string().required()
})
module.exports = {
    postSchema,
    userSchema,
    postActionSchema,
    createCommunitySchema,
    contactSchema,
    emailSchema,
    newsLetterSchema
}