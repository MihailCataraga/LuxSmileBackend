const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(express.json())
app.use(cors());

app.use(express.static(path.join(__dirname, 'src', 'public')));
// app.use('/uploads', express.static(path.join(__dirname, 'src/public/uploads')));

// Pentru a permite accesul la fisere statice din folderul img
app.use('/src/database/img', express.static(__dirname + '/src/database/img'));


const authController = require('./src/controllers/authController');
const angajatiController = require('./src/controllers/angajatiController');
const authMiddleware = require('./src/middleware/authMiddleware');

app.post('/angajati/:functie', authMiddleware.verifyToken, angajatiController.angajatDupaFunctie);

app.post('/login', authController.login);

app.post('/angajati', authMiddleware.verifyToken, angajatiController.totiAngajatii);

app.post('angajati/add', authMiddleware.verifyToken, angajatiController.addAngajati);

app.put('/angajati/edit/:id', authMiddleware.verifyToken, angajatiController.editAngajati);

app.delete('/angajati/delete/:id', authMiddleware.verifyToken, angajatiController.deleteAngajati);

app.get('src/database/img/:img', angajatiController.serveImage);


const PORT = 8080;
app.listen(PORT, () => {
    console.log(`App run on port: ${PORT}`)
});