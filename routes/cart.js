const express = require("express");
const router = express.Router();
const Cart = require('../models/cart_model');
const Item = require('../models/item_model');
const auth = require('../middleware/jwt');

//add item
router.post("/add-item", async (req, res) => {
    try{
        const item = await Item.create(req.body);
        res.status(201).json({
            msg:'Item added',
            Item:item
        });
    }catch(err){
        res.status(500).json({
            msg:`Server Error`
        });
    }
});

//display cart
router.get("/display-cart",auth, async (req, res) => {
    try{
        const cart = await Cart.findById(req.cart.id);
        const item = await Item.find({_id:cart.items});
        res.status(200).json({
            msg:'Cart loaded successfull',
            Item:item,
            totalcost:cart.totalCost,
            pay:cart.pay
        })
    }catch(err){
        res.status(500).json({
            msg:'Server Error'
        })
    }
});

//add-to-cart
router.put("/add-to-cart/:itemId",auth, async (req, res) => {
    try{
        await Item.findByIdAndUpdate(req.params.itemId,{
            $set:{quantity:req.body.quantity}
        });
        const item = await Item.findById(req.params.itemId)
        const cart = await Cart.findById(req.cart.id);
        var totalCost = cart.totalCost + (item.quantity*item.MRP);
        var pay = cart.pay + (item.quantity*item.salePrice);
        await Cart.findByIdAndUpdate(req.cart.id,{
            $set:{totalCost:totalCost, pay:pay},
            $push:{items:req.params.itemId}
        });

        res.status(201).json({
            msg:'Item added'
        });
    }catch(err){
        res.status(500).json({
            msg:`Server Error`
        });
    }
});

//Update item
router.put("/update-item/:itemId",auth, async (req, res) => {
    const {name, quantity, MRP, salePrice} = req.body;
    try{
        //Old item quantity removed
        var item = await Item.findById(req.params.itemId);
        var cart = await Cart.findById(req.cart.id);
        var totalCost = cart.totalCost - (item.quantity*item.MRP);
        var pay = cart.pay - (item.quantity*item.salePrice);
        await Cart.findByIdAndUpdate(req.cart.id,{
            $set:{totalCost:totalCost, pay:pay}
        });
        await Item.findByIdAndUpdate(req.params.itemId,{
            $set:{quantity:req.body.quantity}
        });
        //new item quantity added
        var item = await Item.findById(req.params.itemId);
        var cart = await Cart.findById(req.cart.id);

        var totalCost = cart.totalCost + (item.quantity*item.MRP);
        var pay = cart.pay + (item.quantity*item.salePrice);
        cart = await Cart.findByIdAndUpdate(req.cart.id,{
            $set:{totalCost:totalCost, pay:pay}
        });
        res.status(200).json({
            msg:'Item Updated',
        });
    }catch(err){
        console.log(err);
        res.status(500).json({
            msg:`Server Error`
        });
    }
});

//delete item
router.delete("/delete-item/:itemId",auth, async (req, res) => {
    try{
        const item = await Item.findById(req.params.itemId)
        var cart = await Cart.findById(req.cart.id);
        var totalCost = cart.totalCost - (item.quantity*item.MRP);
        var pay = cart.pay - (item.quantity*item.salePrice);
        await Cart.findByIdAndUpdate(req.cart.id,{
            $pull:{items:req.params.itemId},
            $set:{totalCost:totalCost, pay:pay}
        });

        res.status(200).json({
            msg:'Item deleted',
        });
    }catch(err){
        console.log(err);
        res.status(500).json({
            msg:`Server Error`
        });
    }
});


//empty cart
router.delete("/empty-cart",auth, async (req, res) => {
    try{
        await Cart.findByIdAndUpdate(req.cart.id,{
            $set:{items:[],pay:0,totalCost:0}
        });
        res.status(200).json({
            msg:'All items removed',
        });
    }catch(err){
        res.status(500).json({
            msg:`Server Error`
        });
    }
});

module.exports = router;