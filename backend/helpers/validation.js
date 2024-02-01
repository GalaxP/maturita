const Joi = require('joi')

const postSchema = Joi.object({
    title: Joi.string().required().min(5).max(100),
    body: Joi.string().required().max(700),
    community: Joi.string().required(),
    tag: Joi.string().optional(),
    token: Joi.string().required()
})

const userSchema = Joi.object({
    email: Joi.string().required().email().lowercase(),
    firstName: Joi.string().required().max(50),
    lastName: Joi.string().required().max(50),
    displayName: Joi.string().required().min(3).max(25).regex(/^[a-zA-Z0-9_]+$/),
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
    description: Joi.string().required().max(200),
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

const tagSchema = Joi.object({
    name: Joi.string().required().max(15),
    color: Joi.string().required().max(30)
})
module.exports = {
    postSchema,
    userSchema,
    postActionSchema,
    createCommunitySchema,
    contactSchema,
    emailSchema,
    newsLetterSchema,
    tagSchema
}