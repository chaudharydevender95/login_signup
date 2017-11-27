var router = require('express').Router();
var User = require('../models/user');
var passport = require('passport');
var passportConf = require('../config/passport');

router.get('/login',function(req,res){
  if(req.user) return res.redirect('/');
  res.render('accounts/login',{
    message:req.flash('loginMessage')
  });
});

router.post('/login',passport.authenticate('local-login',{
  successRedirect:'/',
  failureRedirect: '/login',
  failureFlash:true
}));

router.get('/',function(req,res,next){
  res.render('./main/home',{
    errors:req.flash('errors')
  });
});

router.get('/profile',passportConf.isAuthenticated, function(req,res,next){
  User.findOne({_id:req.user._id},function(err,user){
    if(err) return next(err);
    res.render('accounts/profile')
  });
});

router.get('/signup',function(req,res,next){
  res.render('accounts/signup',{
    errors:req.flash('errors')
  });
});

router.get('/logout',function(req,res,next){
  req.logout();
  res.redirect('/login');
});

router.get('/edit-profile',function(req,res,next){
  res.render('accounts/edit-profile.ejs',{message: req.flash('success')});
});

router.post('/edit-profile',function(req,res,next){
  User.findOne({_id:req.user._id},function(err,user){
      if(err) return next(err);

      if(req.body.name) user.profile.name = req.body.name;
      if(req.body.address) user.address = req.body.address;

      user.save(function(err){
          return res.redirect('/profile');
      });
  });
});

router.post('/signup',function(req,res,next){
  var user = new User();

  user.profile.name = req.body.name;
  user.password = req.body.password;
  user.email = req.body.email;
  user.profile.picture = user.gravatar();

  valid = isFieldValid(user.profile.name) && isFieldValid(user.email) && isFieldValid(user.password)
  if(!valid){
    req.flash('errors','Please enter all fields !');
      return res.redirect('/signup');
  }

  User.findOne({email:req.body.email },function(err,existingUser){

    if(existingUser){
      req.flash('errors','User with this email already exist');
      return res.redirect('/signup');
    }else{
      user.save(function(err){
        if(err) return next(err);
        req.flash('errors','Successfully created new user !');
        
        req.logIn(user,function(err){
          if(err) return next(err);
          res.redirect('/profile');
        })
      });
    }
  });
});

isFieldValid = function(field){ return field.length > 0 }

module.exports = router;
