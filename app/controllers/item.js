const Item = require("../models/item");
const Joi = require('joi');
const { ITEM_DETAIL_FETCHED, ITEM_LIST_FETCHED, ITEM_ADDED, ITEM_UPDATED, ITEM_DELETED } = require("../lib/success-message.json");
const { INTERNAL_SERVER_ERROR, ITEM_NOT_FOUND } = require("../lib/error-message.json");
const { responseGenerators, httpStatusCode, verifyJWT } = require('./../lib/utils');

module.exports = {
    getItemDetail: async (req, res) => {
        try {
            await verifyJWT(req.headers.authorization);
            const schema = Joi.object().keys({
                itemId: Joi.string().required()
            });
            let validatedResult = schema.validate(req.query);
            if (validatedResult.error) {
                statusCode = 400;
                throw validatedResult.error.details[0];
            }
            const reqData = validatedResult.value;
            let itemDetail = await Item.findOne({ _id: reqData.itemId });
            return res.status(httpStatusCode.OK).send(responseGenerators({ itemDetail }, httpStatusCode.OK, ITEM_DETAIL_FETCHED, false))
        } catch (error) {
            console.error(`error in Get Item Detail => , ${error}`);
            return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).send(responseGenerators({}, httpStatusCode.INTERNAL_SERVER_ERROR, error.message || error.error || INTERNAL_SERVER_ERROR, true))
        }
    },
    getItems: async (req, res) => {
        console.log("getItems")
        try {
            await verifyJWT(req.headers.authorization);
            const itemList = await Item.find().select({ __v: 0 }).sort({ in: 1 });
            return res.status(httpStatusCode.OK).send(responseGenerators({ itemList }, httpStatusCode.OK, ITEM_LIST_FETCHED, false))
        } catch (error) {
            console.error(`error in Get Items => , ${error}`);
            return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).send(responseGenerators({}, httpStatusCode.INTERNAL_SERVER_ERROR, error.message || error.error || INTERNAL_SERVER_ERROR, true))
        }
    },
    addItem: async (req, res) => {
        try {
            let user = await verifyJWT(req.headers.authorization);
            const schema = Joi.object().keys({
                name: Joi.string().required()
            });
            let validatedResult = schema.validate(req.body);
            if (validatedResult.error) {
                statusCode = 400;
                throw validatedResult.error.details[0];
            }
            const reqData = validatedResult.value;
            const newItem = new Item({
                name: reqData.name,
                userId: user.userId
            });
            console.log("newItem : ", newItem);
            await newItem.save();

            return res.status(httpStatusCode.OK).send(responseGenerators({ newItem }, httpStatusCode.OK, ITEM_ADDED, false))
        } catch (error) {
            console.error(`error in Add Item => , ${error}`);
            return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).send(responseGenerators({}, httpStatusCode.INTERNAL_SERVER_ERROR, error.message || error.error || INTERNAL_SERVER_ERROR, true))
        }
    },
    updateItem: async (req, res) => {
        try {
            let user = await verifyJWT(req.headers.authorization);

            const schema = Joi.object().keys({
                itemId: Joi.string().required()
            });
            let validatedResult = schema.validate(req.query);
            if (validatedResult.error) {
                statusCode = 400;
                throw validatedResult.error.details[0];
            }
            const reqData = validatedResult.value;

            const schema2 = Joi.object().keys({
                name: Joi.string().required()
            });
            let validatedResult2 = schema2.validate(req.body);
            if (validatedResult2.error) {
                statusCode = 400;
                throw validatedResult2.error.details[0];
            }
            const reqData2 = validatedResult2.value;

            let item = await Item.findOne({ _id: reqData.itemId, userId: user.userId });
            if (item) {
                if (reqData2.name) {
                    item.name = reqData2.name;
                }
                await item.save();
                return res.status(httpStatusCode.OK).send(responseGenerators({}, httpStatusCode.OK, ITEM_UPDATED, false))
            } else {
                return res.status(httpStatusCode.OK).send(responseGenerators({}, httpStatusCode.OK, ITEM_NOT_FOUND, true))
            }
        } catch (error) {
            console.error(`error in Update Item => , ${error}`);
            return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).send(responseGenerators({}, httpStatusCode.INTERNAL_SERVER_ERROR, error.message || error.error || INTERNAL_SERVER_ERROR, true))
        }
    },
    deleteItem: async (req, res) => {
        try {
            let user = await verifyJWT(req.headers.authorization);
            const schema = Joi.object().keys({
                itemId: Joi.string().required()
            });
            let validatedResult = schema.validate(req.query);
            if (validatedResult.error) {
                statusCode = 400;
                throw validatedResult.error.details[0];
            }
            const reqData = validatedResult.value;
            const { deletedCount } = await Item.deleteOne({ _id: reqData.itemId, userId: user.userId });
            if (deletedCount) {
                return res.status(httpStatusCode.OK).send(responseGenerators({}, httpStatusCode.OK, ITEM_DELETED, false))
            } else {
                return res.status(httpStatusCode.OK).send(responseGenerators({}, httpStatusCode.OK, ITEM_NOT_FOUND, true))
            }
        } catch (error) {
            console.error(`error in Delete Item => , ${error}`);
            return res.status(httpStatusCode.INTERNAL_SERVER_ERROR).send(responseGenerators({}, httpStatusCode.INTERNAL_SERVER_ERROR, error.message || error.error || INTERNAL_SERVER_ERROR, true))
        }
    }
}