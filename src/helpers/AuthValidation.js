const Joi = require('joi');
//  phoneNumber, confirmationCode, deviceId, deviceName, region, os, browser, ip 
const userValidationSchema = Joi.object({
    phoneNumber: Joi.string().pattern(/^\d{9}$/).required(),
    role: Joi.string().valid('JobSeeker', 'Employer', 'Service', 'Admin').required(),
    mobileToken: Joi.string().min(1).required(),
    deviceId: Joi.string().allow("", null),
    deviceName: Joi.string().allow("", null),
    region: Joi.string().allow("", null),
    os: Joi.string().allow("", null),
    browser: Joi.string().allow("", null),
    ip: Joi.string().allow("", null),
}).options({ abortEarly: false });

const userValidationConfirmSchema = Joi.object({
    confirmationCode: Joi.string().min(6).required(),
    phoneNumber: Joi.string().pattern(/^\d{9}$/).required(),
}).options({ abortEarly: false });

const loginValidationSchema = Joi.object({
    // password: Joi.string().min(6).required(),
    phoneNumber: Joi.string().pattern(/^\d{9}$/).required(),
    mobileToken: Joi.string().min(1).required(),

});
const logOutValidationSchema = Joi.object({
    mobileToken: Joi.string().min(1).required(),
});
const RegisterValidation = (body) => {
    return userValidationSchema.validate(body);
};
const RegisterValidationConfirm = (body) => {
    return userValidationConfirmSchema.validate(body);
};
const validateLogin = (body) => {
    return loginValidationSchema.validate(body);
};

const logOutValidation = (body) => {
    return logOutValidationSchema.validate(body);
};
module.exports = { RegisterValidation, validateLogin, logOutValidation, RegisterValidationConfirm };

