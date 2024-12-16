const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true,
        unique : true
    }
});

userSchema.plugin(passportLocalMongoose); //adds username, hash, salt fields for storing username,hashed password and salt value.

const userModel = mongoose.model('User',userSchema);

module.exports = userModel;