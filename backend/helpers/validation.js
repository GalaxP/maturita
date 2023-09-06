const Joi = require('joi')

const postSchema = Joi.object({
    title: Joi.string().required().min(5),
    body: Joi.string().required(),
})

const userSchema = Joi.object({
    email: Joi.string().required().email().lowercase(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    password: Joi.string().required().min(6),
    uid: Joi.string()
})

const postActionSchema = Joi.object({
    postId: Joi.string().required(),
    type: Joi.string().required().lowercase(),
    direction: Joi.number().min(-1).max(1).required()
})

module.exports = {
    postSchema,
    userSchema,
    postActionSchema
}