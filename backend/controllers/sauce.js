const Sauce = require('../models/sauce');
const fs = require('fs');
const auth = require('../middleware/auth');
const sauce = require('../models/sauce');

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
        .then(() => res.status(201).json({ message: 'Nouvelle sauce enregistrée !' }))
        .catch(error => res.status(400).json({ message: error }));

};

//Suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
    }
        : { ...req.body };
    console.log(req.body);

    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet supprimé' }))
                    .catch(error => res.status(400).json({ error }));
            })
        })
        .catch(error => res.status(500).json({ error }))
};

//Modification d'une sauce
exports.modifySauce = (req, res, next) => {
    console.log("42//", req.body);
    console.log("43//", req.params);
    //On regarde si il y a un champ file dans l'objet requête
    const sauceObject = req.file ? {
        //Si c'est le cas, on parse la chaine de caractère
        ...JSON.parse(req.body.sauce),
        //Et on recrée l'url de l'image
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
    }
        //Sinon, on récupère l'objet dans le corps de la requête
        : { ...req.body };
    console.log("54//", sauceObject);

    //On supprimme le userId de la requête
    delete sauceObject._userId;

    //On recherche l'objet concerné
    Sauce.findOne({ _id: req.params.id })

        .then((sauce) => {
            console.log("63//", sauce);
            //On vérifie que l'userId de la requête est bien le propriétaire
            if (sauce.userId == req.body.userId) {
                console.log("66//", sauce.userId);
                console.log("67//", req.body.userId);
                const target = { _id: req.params.id };
                const newValues = {
                    $set: {
                        ...sauceObject
                    },
                };
                Sauce.updateOne(target, newValues)
                    .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
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
exports.likeAndDislike = (req, res, next) => {
    // On récupère la sauce
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {



            //Si l'user dislike la sauce 
            if (req.body.like == -1) {
                Sauce.updateOne({ _id: req.params.id }, {
                    $inc: { dislikes: 1 },
                    $push: { usersDisliked: req.body.userId },
                    _id: req.params.id
                })
                    .then(() => res.status(201).json({ message: 'Dislike pris en compte !' }))
                    .catch(error => res.status(400).json({ error }))
            }



            //Si l'user a déjà noté la sauce
            if (req.body.like == 0) {

                //Si la sauce est déjà liké
                if (sauce.usersLiked.find(user => user === req.body.userId)) {
                    Sauce.updateOne({ _id: req.params.id }, {
                        $inc: { likes: -1 },
                        $pull: { usersLiked: req.body.userId },
                        _id: req.params.id
                    })
                        .then(() => res.status(201).json({ message: ' Avis mis à jour !' }))
                        .catch(error => res.status(400).json({ error }))
                }

                //Si la sauce est déjà disliké 
                if (sauce.usersDisliked.find(user => user === req.body.userId)) {
                    Sauce.updateOne({ _id: req.params.id }, {
                        $inc: { dislikes: -1 },
                        $pull: { usersDisliked: req.body.userId },
                        _id: req.params.id
                    })
                        .then(() => res.status(201).json({ message: ' Avis mis à jour !' }))
                        .catch(error => res.status(400).json({ error }));
                }
            }

            //Si l'user like la sauce
            if (req.body.like == 1) {
                Sauce.updateOne({ _id: req.params.id }, {
                    $inc: { likes: 1 },
                    $push: { usersLiked: req.body.userId },
                    _id: req.params.id
                })
                    .then(() => res.status(201).json({ message: 'Like pris en compte !' }))
                    .catch(error => res.status(400).json({ error }));
            }
        })
        .catch(error => res.status(500).json({ error }))
}


//Récupération des sauces
exports.getSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

//Récupération d'une sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }));
};
