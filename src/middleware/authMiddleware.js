const jwt = require('jsonwebtoken'); 
const secret = 'secret';


exports.verifyToken = (req, res, next) => {
    const jwToken = req.body.jwToken;
    if(!jwToken) {
        return res.status(401).json({message: 'jwToken nu exista'})
    }
    jwt.verify(jwToken, secret, (err, decoded) => {
        if(err) {
            return res.status(401).json({message: 'jwToken este invalid'})
        } else {
            req.decoded = decoded;
            console.log("tokenul este valid")
            next()
        }
    })
};