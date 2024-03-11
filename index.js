const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();


app.use(express.json())
app.use(cors());

app.use(express.static(path.join(__dirname, 'src', 'public')));

// Pentru a permite accesul la fisere statice din folderul img
app.use('/src/database/img', express.static(__dirname + '/src/database/img'));


const authController = require('./src/controllers/authController');
const angajatiController = require('./src/controllers/angajatiController');
const mesajController = require('./src/controllers/mesajController');
const authMiddleware = require('./src/middleware/authMiddleware');
const { upload } = require('./src/middleware/multerMiddleware')


app.post('/angajati/:functie', authMiddleware.verifyToken, angajatiController.angajatDupaFunctie);

app.post('/login', authController.login);

app.post('/angajati', angajatiController.totiAngajatii);

app.post('/angajatNou', authMiddleware.verifyToken, angajatiController.addAngajati);

app.put('/angajati/edit/:id', authMiddleware.verifyToken, angajatiController.editAngajati);

app.delete('/angajati/delete/:id', authMiddleware.verifyToken, angajatiController.deleteAngajati);

app.get('/src/database/img/:img', authMiddleware.verifyToken, angajatiController.serveImage);

//Adauga mesaj 
app.post('/adaugaMesaj', mesajController.adaugaMesaj);

//Arata mesajele
app.post('/mesaje', authMiddleware.verifyToken, mesajController.fetchMessages);

//Read status
app.post('/mesaje/:id', authMiddleware.verifyToken, mesajController.markAsRead);

// Img
app.post('/upload', upload.single('img'), angajatiController.addImg);



const PORT = 8080;
app.listen(PORT, () => {
  console.log(`App run on port: ${PORT}`)
});