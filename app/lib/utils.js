const jwt = require("jsonwebtoken");
const { UNAUTHORIZED } = require("./error-message.json");

module.exports = {
    httpStatusCode: require('http-status-codes'),
    responseGenerators: (responseData, responseStatusCode, responseStatusMsg, responseErrors, token) => {
        const responseJson = {}
        responseJson['data'] = responseData
        responseJson['status_code'] = responseStatusCode
        responseJson['status_message'] = responseStatusMsg

        // errors
        if (responseErrors) {
            responseJson['response_error'] = responseErrors
        }

        if (token) {
            responseJson['token'] = token
        }
        return responseJson;
    },

    encryptPassword: function (password) {
        try {
            const crypto = require('crypto');
            return crypto.createHash('md5').update(password).digest('hex');
        } catch (error) {
            console.error(error);
        }
    },

    //Create JWT
    createJWT: (parsedBody) => {
        var date = new Date();
        date.setMonth(date.getMonth() + 1);
        parsedBody.exp = Math.round(date.getTime() / 1000);
        return jwt.sign(JSON.stringify(parsedBody), process.env.JWT_SECRET);
    },

    //Verify TOKEN
    verifyJWT: (token) => {
        if (token) {
            return jwt.verify(token, process.env.JWT_SECRET);
        } else {
            throw { status_code: 401, message: UNAUTHORIZED };
        }
    },
}