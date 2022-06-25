const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {

    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            console.log(res.status());
            user.save()
                .then(() => res.status(201).json({ message: 'Compte utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
};



exports.login = (req, res, next) => {

    //On recherche l'user par l'email renseigné:
    User.findOne({ email: req.body.email })
        .then(user => {
            //Si l'email n'existe pas, on revoie une erreur 401 Unauthorized
            if (!user) {
                return res.status(401).json({ error: 'Compte introuvable !'});
            }
            //on compare le mot de passe renseigné avec le hash enregistré dans la database
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    //Si les informations d'identifications sont incorrect, on renvoie une erreur 401 Unauthorized
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorect !'});
                    }
                    //Sinon, on envoie une réponse 200 avec un ID et un token
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
}