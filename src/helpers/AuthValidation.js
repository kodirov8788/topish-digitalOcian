const Joi = require('joi');

const userValidationSchema = Joi.object({
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    role: Joi.string().valid('JobSeeker', 'Employer', 'Service', 'Admin').required(),
    phoneNumber: Joi.string().pattern(/^\d{9}$/).required(),
    mobileToken: Joi.string().min(1).required(),
}).keys({
    jobSeeker: Joi.object({
        fullName: Joi.string().required()
    }),
    employer: Joi.object({
        companyName: Joi.string().required()
    }),
    service: Joi.object({
        serviceName: Joi.string().required()
    }),
    admin: Joi.object({
        adminName: Joi.string().required()
    })
}).options({ abortEarly: false });

const loginValidationSchema = Joi.object({
    password: Joi.string().min(6).required(),
    phoneNumber: Joi.string().pattern(/^\d{9}$/).required(),
    mobileToken: Joi.string().min(1).required(),
});
const logOutValidationSchema = Joi.object({
    mobileToken: Joi.string().min(1).required(),
});
const RegisterValidation = (body) => {
    return userValidationSchema.validate(body);
};
const validateLogin = (body) => {
    return loginValidationSchema.validate(body);
};

const logOutValidation = (body) => {
    return logOutValidationSchema.validate(body);
};
module.exports = { RegisterValidation, validateLogin, logOutValidation };

