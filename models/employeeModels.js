const mongoose = require('mongoose');

// Schéma de l'employé
const employeSchema = new mongoose.Schema({
    photo: {
        type: String,
        required: [true, "La photo est requise"],
    },
    name: {
        type: String,
        required: [true, "Le nom est requis"],
    },
    fonction: {
        type: String,
        required: [true, "La fonction est requise"],
    },
    blameCount: {
        type: Number,
        default: 0,
    }
});

const employeModel = mongoose.model('employees', employeSchema);

module.exports = employeModel;
