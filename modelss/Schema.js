const mongoose = require('mongoose');

const scoutSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    organization: { type: String, required: true },
    experience: { type: Number, required: true },
    location: { type: String, required: true },
    accountType: { type: String, default: 'scout' }
}, { timestamps: true });

const Scout = mongoose.model('Scout', scoutSchema, 'scouts'); // حدد اسم المجموعة 'scouts'

const playerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    birthdate: { type: Date, required: true },
    location: { type: String, required: true },
    accountType: { type: String, default: 'player' }
}, { timestamps: true });

const Player = mongoose.model('Player', playerSchema, 'players'); // حدد اسم المجموعة 'players'

module.exports = { Scout, Player };