const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');

//Load Users Model
require('../models/Users');
const user = mongoose.model('users');


router.get('/',(req,res)=>{
    res.render('./users/login',{layout: 'auth.handlebars'});
});

router.post('/',(req,res,next) =>{
    passport.authenticate('local',{
        successRedirect:'./sensors/home',
        failureRedirect:'/users',
        failureFlash: true
    })(req,res,next);
});

router.get('/register',(req,res)=>{
    res.render('users/registration', {layout: 'auth.handlebars'});
});

router.post('/register',(req,res)=>{
    let errors = [];

    if(req.body.password != req.body.password2){
        errors.push({text: 'Password do not match'});
    }

    if(req.body.password.length < 6){
        errors.push({text: 'Password must be at least 6 characters'});
    }

    if(errors.length >0){
        res.render('./users/registration',{
            layout: 'auth.handlebars',
            errors: errors,
            name : req.body.username,
            email: req.body.email
        })
    }

    else {
        user.findOne({email:req.body.email})
            .then(user =>{
                if(user){
                    req.flash('error_msg', "Email Already Registered");
                    res.redirect('/');
                }
            })
        const newUser = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        }
        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(newUser.password,salt,(err,hash)=>{
                if(err) throw err;
                newUser.password = hash;
                new user(newUser)
                    .save()
                    .then(users =>{
                       res.redirect('/');
                    })
                    .catch(err => {
                        console.log(err);
                        return;
                    })
            })
        })
       // res.render('login');
    }
});

router.get('/logout',(req,res)=>{
    req.logout(); 
    req.flash('success_msg', 'Logged Out Successfully');
    res.redirect('/users');
})

module.exports = router;