const { Schema, model, Types } = require('mongoose');

const itemSchema = new Schema({
    userId: { type: Types.ObjectId },
    name: { type: String },
})

module.exports = model("item", itemSchema);