const Sauce = require('../models/sauce');
const fs = require('fs');
const auth = require('../middleware/auth');

//Création d'un sauce
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    //On enlève le champ id auto dans la requête
    delete sauceObject._id;
    //On crée une nouvelle instance
    const sauce = new Sauce({
        //Résumé des champs requis pour la requête
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    //On envoie les infos dans la base de données
    sauce.save()
        //On renvoie une réponse à la requête
        .then(() => res.status(201).json({ message: 'Nouvelle sauce enregistrée !'}))
        .catch(error => res.status(400).json({ message : error }));
        
};

//Suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
    //On utilise l'id reçu en paramètre pour accéder à la sauce correspondante
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            //On récupère le nom du fichier
            const filename = sauce.imageUrl.split('/images/')[1];
            //On supprime le fichier
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

exports.modifySAUCE = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete sauceObject._userId;
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message : 'Vous ne pouvez pas modifier cette sauce !'});
            } else {
                Sauce.updateOne({ _id: req.params.id}, { ...thingObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Sauce modifiée !'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
 };


//Récupération des sauces
exports.getSauces = (req, res, next) => {
    Sauce.find()
        .then( sauces => res.status(200).json(sauces))
        .catch( error => res.status(400).json({ error }));
};

//Récupération d'une sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }));
};