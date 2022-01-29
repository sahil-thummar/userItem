const Joi = require("joi");
const User = require('../models/user')
const { responseGenerators, httpStatusCode, createJWT, encryptPassword, verifyJWT } = require('./../lib/utils')
const {
    USER_LOGGED_IN,
    USER_REGISTERED,
} = require('../lib/success-message.json');
const {
    INTERNAL_SERVER_ERROR,
    USER_ALREADY_REGISTERED,
    NO_USER_FOUND
} = require('../lib/error-message.json');

module.exports = {

    userLogin: async (req, res) => {
        try {
            const schema = Joi.object().keys({
                username: Joi.string().required(),
                password: Joi.string().required(),
            });
            const joiValue = await schema.validate(req.body);
            if (joiValue.error) {
                throw joiValue.error.details[0];
            }
            const requestData = joiValue.value;
            const password = await encryptPassword(requestData.password);
            const userData = await User.findOne({ username: requestData.username, password });
            if (userData) {
                const jwtToken = await createJWT({ userId: userData._id, username: userData.username });
                return res.status(httpStatusCode.OK).send(responseGenerators({}, httpStatusCode.OK, USER_LOGGED_IN, false, jwtToken))
            } else {
                return res.status(httpStatusCode.OK).send(responseGenerators({}, httpStatusCode.OK, NO_USER_FOUND, true))
            }
        } catch (error) {
            console.error(`error in Login User => , ${error}`);
            return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).send(responseGenerators({}, httpStatusCode.INTERNAL_SERVER_ERROR, error.message || error.error || INTERNAL_SERVER_ERROR, true))
        }
    },

    registerUser: async (req, res) => {
        try {
            const schema = Joi.object().keys({
                username: Joi.string().required(),
                password: Joi.string().required(),
            });
            const joiValue = await schema.validate(req.body);
            if (joiValue.error) {
                throw joiValue.error.details[0].message;
            }
            const requestData = joiValue.value;
            let userDetail = await User.count({ username: requestData.username });
            if (userDetail) {
                return res.status(httpStatusCode.OK).send(responseGenerators({}, httpStatusCode.OK, USER_ALREADY_REGISTERED, true))
            } else {
                const user_detail = new User(requestData);
                user_detail.password = await encryptPassword(requestData.password);
                await user_detail.save();
                const jwtToken = await createJWT({ userId: user_detail._id, username: user_detail.username });
                return res.status(httpStatusCode.OK).send(responseGenerators({}, httpStatusCode.OK, USER_REGISTERED, false, jwtToken))
            }
        } catch (error) {
            console.error(`error in Register User => , ${error}`);
            return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).send(responseGenerators({}, httpStatusCode.INTERNAL_SERVER_ERROR, error.message || error.error || INTERNAL_SERVER_ERROR, true))
        }
    },
}