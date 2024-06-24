const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Schéma de société
const societySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Le nom est requis"],
    },
    numberSiret: {
        type: String,
        required: [true, "Le numéro de SIRET est requis"]
    },
    email: {
        type: String,
        required: [true, "L'adresse e-mail est requise"]
    },
    leaderName: {
        type: String,
        required: [true, "Le nom du directeur est requis"]
    },
    password: {
        type: String,
        required: [true, "Le mot de passe est requis"]
    },
    employees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employees'
    }]
});

societySchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

const societyModel = mongoose.model('societies', societySchema);

module.exports = societyModel;
