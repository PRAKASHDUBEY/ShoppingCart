const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    items:{
        type:Array,
        default:[]
    },
    totalCost:{
        type:Number,
        default:0
    },
    pay:{
        type:Number,
        default:0
    },
});

module.exports = mongoose.model('Cart',cartSchema);