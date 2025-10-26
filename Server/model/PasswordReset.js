const mongoose = require('mongoose');

const resetSchema = new mongoose.Schema({
    resetId:{
       type:String,
       required:true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    tokenHash:{
        type:String,
        required:true,
    },
    expiresAt: { 
        type: Date, 
        required: true, 
    },
    resetRequest:{
        type:Number,
        default:0
    },
    passChangeCount:{
        type:Number,
        default:0
    },
    
    // extra metadata
    ip: { type: String },
    userAgent: { type: String },

    createdAt: {
        type: Date, 
        default: Date.now, 
        expires:24*60*60
    },
});

module.exports = mongoose.model('Password_reset_token', resetSchema);