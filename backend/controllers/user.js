const bcrypt = require('bcrypt');

const User = require('../models/user');

exports.signup = (req, res, next) => {



    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            //console.log(hash)
            const user = new User({
                email: req.body.email,
                password: hash
            });
            
            console.log(res.status());
            user.save()

                .then(() => res.status(201).json({ message: 'Compte utilisateur créé !'}))
                .catch(error => res.status(400).json({ error }));

            })
};



exports.login = (req, res, next) => {

}