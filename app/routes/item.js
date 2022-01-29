const express = require('express')
const router = express.Router()
const { getItems, addItem, updateItem, deleteItem, getItemDetail} = require("./../controllers/item");

router.post('/addItem', addItem);
router.get('/getItems', getItems);
router.get('/getItemDetail', getItemDetail);
router.put('/updateItem', updateItem);
router.delete('/deleteItem', deleteItem);

module.exports = router