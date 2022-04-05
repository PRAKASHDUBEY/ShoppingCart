const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcryptjs = require('bcryptjs');
const User = require('../models/user_model');
const auth = require('../middleware/jwt');
const Cart = require('../models/cart_model');


//REGISTER
router.post("/register", async (req, res) => {
    const {name, email, password} = req.body;
    try{
        let user_email_exist = await User.findOne({email:email});
        if(user_email_exist){
            res.status(409).json({
                msg:'User already exist'
            });
        }else{
            let user = new User();

            let cart = new Cart();
            cart.userId = user.id;
            await cart.save();

            user.cartId = cart.id;
            user.name = name;
            user.email = email;
            const salt = await bcryptjs.genSalt(10);
            user.password = await bcryptjs.hash(password, salt);

            await user.save();
            const payload ={
                user:{
                    id:user.id
                },
                cart:{
                    id:cart.id
                }
            }
            jwt.sign(payload, process.env.jwtUserSecret,{
                expiresIn:30000
            }, (err, token)=>{
                if (err) throw err;
                res.status(201).json({
                    msg:'Registered successfully',
                    token:token
                });
            })
        }
    }catch(err){
        res.status(500).json({
            msg:`Server Error`
        })
    }
});

//LOGIN
router.post("/login", async (req, res) => {
    const email= req.body.email;
    const password = req.body.password;
    try{
        let user = await User.findOne({
            email:email
        });
        console.log(user);
        if(!user){
            res.status(404).json({
                msg:'User does not exist, Resister to continue!'
            });
        }   
        const isMatch = await bcryptjs.compare(password, user.password);    
        if(!isMatch){
            return res.status(401).json({
                msg:'Inavalid Credentials'  
            })
        }   
        const payload = {
            user:{
                id:user.id
            },
            cart:{
                id:user.cartId
            }
        }   
        jwt.sign(payload, process.env.jwtUserSecret,{
            expiresIn:300000
        },(err, token)=>{
            if (err) throw err;
            res.status(200).json({
                token:token
            });
        })  
    }catch(err){
        res.status(500).json({
            msg:`Server Error`
        })
    }
});

//Reset password
router.put("/reset-password" , auth, async (req, res) => {
    try{
        const {oldpass, newpass} = req.body;
        const user = await User.findById(req.user.id);
        const isMatch = await bcryptjs.compare(oldpass, user.password);    
        if(!isMatch){
            return res.status(401).json({
                msg:'Inavalid Credentials'  
            })
        }
        const salt = await bcryptjs.genSalt(10);
        user.password = await bcryptjs.hash(newpass, salt);
        await user.save();
        res.status(200).json({
            msg:"Succesfully Password reset"
        });
    }catch(err){
        res.status(500).json({
            msg:"Server Error"
        })
    }
});

module.exports = router;