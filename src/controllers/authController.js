const jwt = require('jsonwebtoken'); 
const db = require('../database/db');
const secret = 'secret';
const tokenLife = {
    expiresIn: 10000
}

exports.login = (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM admin_user WHERE login=? AND password=?';
    const user = db.prepare(query).get(username, password);

    if (user) {
        const jwToken = jwt.sign({ username, password }, secret, tokenLife)
        res.json({ success: true, message: 'Autentificare reusita', jwt: jwToken });
    } else {
        res.status(401).json({ success: false, message: 'Nume de utilizator sau parola incorecte' });
    }
};