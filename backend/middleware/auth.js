const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headeerq.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, 'RANDOM_SECRET_KEY');
        const userId = decodedToken.userId;
        if (req.body.userId && req.body.userId !== userId) {
            throw 'Invalid user ID';
        } else {
            next();
        }
    }
    catch{
        res.status(401).json({
            error: new Error('Invalid request!')
        });
    }
};