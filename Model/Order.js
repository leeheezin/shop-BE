const mongoose = require('mongoose')
const User = require('./User')
const Product = require('./Product')
const Schema = mongoose.Schema
const orderSchema = Schema({
    shipTo:{type:Object,required:true},
    contact:{type:String,required:true},
    totalPrice:{type:Number,required:true,default:0},
    userId:{type: mongoose.ObjectId, ref:User},
    status:{type:String,default:"active"},
    items:[{
        productId:{type:mongoose.ObjectId,ref:Product},
        size:{type:String,required:true},
        qty:{type:Number,default:1,required:true},
        price:{type:Number,required:true}
    }]
},{timestamps:true})
orderSchema.methods.toJSON = function() {
    const obj = this._doc
    delete obj.updateAt
    return obj
}

const Order = mongoose.model('Order',orderSchema)
module.exports = Order