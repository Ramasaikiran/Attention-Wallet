const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    pin: {
        type: String, // Parent PIN
        required: true
    }
});

module.exports = mongoose.model('User', UserSchema);
