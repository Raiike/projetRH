const societyModel = require('../models/societyModels')

const authGuard = async (req, res, next) => {
    try {
        if (req.session.user) {
            const userFinded = await societyModel.findOne({ _id: req.session.user._id })
            if (userFinded) {
                next()
            } else {
                res.redirect('/login')
            }
        }else{
            res.redirect('/login')
        }

    } catch (error) {
        res.send(error.message)
    }
}

module.exports = authGuard


