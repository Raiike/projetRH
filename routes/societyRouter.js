const express = require('express');
const societyModel = require('../models/societyModels');
const bcrypt = require('bcrypt');
const societyRouter = express.Router();
const authGuard = require('../middleware/authGuard');

societyRouter.get('/register', (req, res) => {
    res.render('pages/register.twig');
});

societyRouter.get('/login', (req, res) => {
    res.render('pages/login.twig');
});

societyRouter.get('/addEmployee', authGuard, async (req, res) => {
    res.render('pages/addEmployee.twig');
});

societyRouter.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

societyRouter.get('/dashboard', authGuard, async (req, res) => {
    try {
        const societyId = req.session.user._id;
        const searchQuery = req.query.search || '';

        let society = await societyModel.findById(societyId).populate('employees');
        console.log("Society:", society);

        let employees = society.employees || [];
        if (searchQuery) {
            const regex = new RegExp(searchQuery, 'i');
            employees = employees.filter(employee => regex.test(employee.name));
        }

        console.log("Employees:", employees);

        res.render('pages/dashboard.twig', {
            user: req.session.user,
            employees: employees,
            searchQuery: searchQuery
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des employés :", error);
        res.json({ error: "Erreur lors de la récupération des employés" });
    }
});

societyRouter.post('/register', async (req, res) => {
    try {
        let newSociety = new societyModel(req.body);
        await newSociety.validate();
        await newSociety.save();
        res.redirect('/login');
    } catch (error) {
        res.json(error.message);
    }
});

societyRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await societyModel.findOne({ email });
        if (user) {
            if (bcrypt.compareSync(password, user.password)) {
                req.session.user = user;
                return res.redirect("/dashboard");
            } else {
                throw new Error("Le mot de passe ne correspond pas");
            }
        } else {
            throw new Error("Utilisateur non enregistré");
        }
    } catch (error) {
        return res.render('pages/login.twig', {
            error: error.message
        });
    }
});

module.exports = societyRouter;
