const mongoose = require('mongoose')
const User = require('./User')
const Product = require('./Product')
const Order = require('./Order')
const Schema = mongoose.Schema
const orderItemSchema = Schema({
    orderId: {type:mongoose.ObjectId, ref:Order},
    productId:{type:mongoose.ObjectId,ref:Product},
    size:{type:String,required:true},
    qty:{type:Number,required:true},
    price:{type:Number,required:true}
},{timestamps:true})
orderItemSchema.methods.toJSON = function() {
    const obj = this._doc
    delete obj.updateAt
    return obj
}
const OrderItem = mongoose.model('OrderItem',orderItemSchema)
module.exports = OrderItem