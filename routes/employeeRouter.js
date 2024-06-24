const express = require('express');
const Employee = require('../models/employeeModels');
const EmployeeRouter = express.Router();
const authGuard = require('../middleware/authGuard');
const upload = require('../middleware/upload'); 
const societyModel = require('../models/societyModels');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

EmployeeRouter.post('/addEmployee', authGuard, upload.single('img'), async (req, res) => {
    try {
        const { name, fonction, blameCount } = req.body;
        const photo = req.file ? req.file.filename : null;

        const newEmployee = new Employee({
            name,
            fonction,
            blameCount,
            photo
        });

        const savedEmployee = await newEmployee.save();
        
        const societyId = req.session.user._id;
        await societyModel.findByIdAndUpdate(societyId, { $push: { employees: savedEmployee._id } });

        res.redirect('/dashboard');
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'employé :", error);
        res.render('pages/addEmployee.twig', { error: error.message });
    }
});

// Afficher le formulaire de modification d'un employé
EmployeeRouter.get('/editEmployee/:id', authGuard, async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            throw new Error('Employé non trouvé');
        }
        res.render('pages/modifyEmployee.twig', { employee });
    } catch (error) {
        console.error("Erreur lors de la récupération de l'employé pour modification :", error);
        res.render('pages/dashboard.twig', {
            errorMessage: "L'employé que vous souhaitez modifier n'existe pas",
            employee: req.session.employee,
            title: "Dashboard - Gestion des Employés"
        });
    }
});

// Enregistrer les modifications d'un employé
EmployeeRouter.post('/editEmployee/:employeeid', authGuard, upload.single('img'), async (req, res) => {
    try {
        const employeeId = req.params.employeeid;
        const updatedData = req.body;
        if (req.file) {
            updatedData.photo = req.file.filename;
        }
        const updatedEmployee = await Employee.findByIdAndUpdate(employeeId, updatedData, { new: true, runValidators: true });
        if (!updatedEmployee) {
            throw new Error('Employé non trouvé');
        }
        res.redirect('/dashboard');
    } catch (error) {
        console.error("Erreur lors de la modification de l'employé :", error);
        const employee = await Employee.findById(req.params.employeeid);
        res.render('pages/modifyEmployee.twig', {
            employee,
            error: error.message
        });
    }
});

// Supprimer un employé
EmployeeRouter.post('/deleteEmployee/:id', authGuard, async (req, res) => {
    try {
        const employeeId = req.params.id;
        await Employee.findByIdAndDelete(employeeId);
        const societyId = req.session.user._id;
        await societyModel.findByIdAndUpdate(societyId, { $pull: { employees: employeeId } });
        res.redirect("/dashboard");
    } catch (error) {
        console.error("Erreur lors de la suppression de l'employé :", error);
        res.status(500).json({ error: "Erreur lors de la suppression de l'employé" });
    }
});

EmployeeRouter.post('/addBlame/:id', authGuard, async (req, res) => {
    try {
        const employeeId = req.params.id;
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            throw new Error("Employé non trouvé");
        }
        // Ajouter le blâme à l'employé
        employee.blameCount += 1;
        await employee.save();
        res.redirect(`/editEmployee/${employeeId}`);
    } catch (error) {
        console.error("Erreur lors de l'ajout d'un blâme à l'employé :", error);
        res.status(500).json({ error: "Erreur lors de l'ajout d'un blâme à l'employé" });
    }
});



const employeeSchema = new Schema({
    name: { type: String, required: true },
    function: { type: String, required: true },
    blameCount: { type: Number, default: 0 },
    photo: { type: String }
});
module.exports = mongoose.model('Employee', employeeSchema);
module.exports = EmployeeRouter;
