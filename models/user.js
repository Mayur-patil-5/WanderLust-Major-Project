const mongoose = require("mongoose");
const { default: passportLocalMongoose } = require("passport-local-mongoose");
const Schema = mongoose.Schema;
// const passportLocalMongoose=require(passportLocalMongoose);

const userSchema=new Schema({
    email:{
        type:String,
        required:true
    }
});
userSchema.plugin(passportLocalMongoose);  //automatically genrates username and password
module.exports=mongoose.model('User',userSchema);