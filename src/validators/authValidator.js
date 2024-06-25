const joi = require('joi')

const signupValidation = async (req, res, next) => {
    try {
        const bodyofRequest = req.body;
        const signupSchema = joi.object({
            email: joi.string().email().required(),
            firstName: joi.string().required(),
            lastName: joi.string().required(),
            password: joi.string().pattern(new RegExp('^[a-zA-Z0-9@#]{6,30}$')).required(),
            role: Joi.string().valid("USER", "ADMIN"),
            token: joi.array().items(joi.string().valid('x', 'y', 'z'))
        })

        await signupSchema.validateAsync(bodyofRequest, { abortEarly: true })

        next()
    } catch (error) {
        return res.status(422).json({
            message: error.message,
            success: false
        })
    }
}


const loginValidation = async (req, res, next) => {
    try {
        const loginSchema = joi.object({
            password: joi.string().required(),
            email: joi.string().email().required(),
        })

        await loginSchema.validateAsync(req.body, { abortEarly: true })
    
        next()
    } catch (error) {
        return res.status(422).json({
            message: error.message,
            success: false
        })
    }
}


module.exports = {
    signupValidation,
    loginValidation
}