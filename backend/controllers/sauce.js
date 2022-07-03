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
            //Si l'id de la requête est le même que celui du propiétairev de la sauce, alors on autorise la suppression
           if (sauce.userId == req.body.userId) {
             //On récupère le nom du fichier
             const filename = sauce.imageUrl.split('/images/')[1];
             //On supprime le fichier
             fs.unlink(`images/${filename}`, () => {
                 Sauce.deleteOne({ _id: req.params.id })
                     .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
                     .catch(error => res.status(400).json({ error }));
             });
           } else {
            console.log("Suppression unauthorized");
            alert("Vous n'êtes pas autorisé à supprimer cette sauce !")
           }
        })
        .catch(error => res.status(500).json({ error }));
};

//Modification d'une sauce
exports.modifySauce = (req, res, next) => {
    console.log("42//", req.body);
    console.log("43//" , req.params);
    //On regarde si il y a un champ file dans l'objet requête
    const sauceObject = req.file ? {
        //Si c'est le cas, on parse la chaine de caractère
        ...JSON.parse(req.body.sauce),
        //Et on recrée l'url de l'image
        imageUrl : `${req.protocol}://${req.get("host")}/images/${req.file.filename}`, 
    }
    //Sinon, on récupère l'objet dans le corps de la requête
    : { ...req.body };
    console.log("54//", sauceObject);

    //On supprimme le userId de la requête
    delete sauceObject._userId;

    //On recherche l'objet concerné
    Sauce.findOne({ _id: req.params.id })
        
        .then((sauce) => {
            console.log("63//" , sauce);
            //On vérifie que l'userId de la requête est bien le propriétaire
            if (sauce.userId == req.body.userId) {
                console.log("66//", sauce.userId);
                console.log("67//", req.body.userId);
                const target = { _id: req.params.id };
                const newValues = {
                  $set : {
                    name: req.body.name,
                    manufacturer: req.body.manufacturer,
                    description: req.body.description,
                    mainPepper: req.body.mainPepper,
                    heat: req.body.heat,
                    },
                };
                Sauce.updateOne(target, newValues)
                  .then(() => res.status(200).json({ message: "Sauce modifiée !"}))
                  .catch((error) => res.status(401).json({ error }));
            } else {
                alert("Vous ne pouvez pas modifier cette sauce")
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
}; 

//Evaluation de la sauce
exports.evaluateSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if(sauce.usersLiked.indexOf(req.body.userId) == -1 && sauce.usersDisliked.indexOf(req.body.userId) == -1) {
                if(req.body.like == 1) {
                    sauce.usersLIked.push(req.body.userId);
                    sauce.likes += req.body.likes;
                } else if(req.body.like == -1) {
                    sauce.usersDisliked.push(req.body.userId);
                    sauce.disliked -= req.body.like;
                };
            };
            if(sauce.usersLiked.indexOf(req.body.userId) != -1) {
                const idxLike = sauce.usersLiked.findIndex(user => user == req.body.userId);
                sauce.usersLiked.splice(idxLike, 1);
                sauce.likes -= 1;
            };
            if(sauce.usersDisliked.indexOf(req.body.userId) != -1) {
                const idxDislike = sauce.usersDisliked.findIndex(user => user == req.body.userId);
                sauce.usersDisliked.splice(idxDislike, 1);
                sauce.disliked -= 1;
            };
            sauce.save()
            res.status(201).json({ message: "Note mise à jour"})
        })
        .catch(error => res.status(500).json({ error }));
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