const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const GoogleStrategy = require('passport-google-oauth20');
const keys = require('../config/keys');
const User = require('../src/models/User');

module.exports = function(passport) {
    passport.use(
        new localStrategy({usernameField: 'email'}, (email, password, done) => {
            //Match user
            User.findOne({ email })
                .then(user => {
                    if(!user){
                        return done(null, false , { message: 'Email is not registered' });
                    }

                    //so if user exists we have to match the password

                    bcrypt.compare(password, user.password, (err,isMatch) => {
                        if (err) throw err;

                        if(isMatch){
                            return done(null,user);
                        }else{
                            return done(null,false, {message: 'Incorrect password!'});
                        }
                    })

                })
                .catch(err => console.log(err));
        })
    );
    passport.use(
        new GoogleStrategy({
            //option for google strategy
            clientID: keys.google.clientID,
            clientSecret: keys.google.clientSecret,
            callbackURL: '/users/google/callback'
        }, (accessToken,refreshToken,profile,done )=> {
            //passport callback function
            console.log("profile in passport",profile);
            
            User.findOne({googleId:profile.id})
                .then(currentUser => {
                    if(currentUser){
                        //already have a user
                        console.log('user is', currentUser);
                        done(null,currentUser);
                        
                    }else{
                        //create user in the db
                        const user = new User({
                            name:profile.displayName,
                            googleId:profile.id,
                        })
                        user.save()
                            .then(newUser => {
                                console.log('new user created',newUser);    
                                done(null,newUser);
                                //from here it will go to serialize user
                            })
                            .catch("error from passport",err => console.log(err));
                    }
                })   
        })
    )

    passport.serializeUser((user, done) => {
        done(null, user.id);
      });
      
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user)=> {
          done(err, user);
        });
    });
}

