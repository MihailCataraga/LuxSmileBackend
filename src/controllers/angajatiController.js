const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database/db');

//Andajati dupa functie
exports.angajatDupaFunctie = (req, res) => {
    try {
        const query = 'SELECT * FROM angajati WHERE functie=?';
        const angajati = db.prepare(query);
        const results = angajati.all(req.params.functie);
        if (results.length > 0) {
            res.json({ success: true, results });
        } else {
            res.json({ success: true, message: 'Nu s-au gasit rezultate' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

//Preluarea pozei
exports.serveImage = (req, res) => {
    try {
        const numeImagine = '/src/database/img/' +  req.params.img;
        res.sendFile(__dirname + numeImagine);
        
        res.sendFile(imagePath);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

//Toti angajatii
exports.totiAngajatii = (req, res) => {
    try {
        const query = 'SELECT * FROM angajati';
        const angajati = db.prepare(query);
        const results = angajati.all();
        res.json(results);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

//Configurare multer disk storage
const storage = multer.diskStorage({
    
    //Destinatia in care vor fi stocate fisierele incarcate
    destination: 'src/public/uploads',
    filename: (req, file, callback) => {
        console.log('req.body:', req.body);
        const { nume, functie } = req.body;
        const fileName = `${nume.toUpperCase()}_${functie.toUpperCase()}.jpg`;
        callback(null, fileName);
    },
});

//Validare fisiere pentru upload
const fileFilter = (req, file, callback) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
        callback(null, true);
    } else {
        callback(new Error('Sunt permise doar fișiere JPG'), false);
    }
};

//Config multer pentru file upload
const upload = multer({
    storage,
    fileFilter,
});

//Adauga angajati
exports.addAngajati = (req, res) => {
    try {
        const { nume, specialitate, functie } = req.body;
        const imgPath = req.file ? req.file.path : null;

        if (!imgPath) {
            return res.status(400).json({ success: false, message: 'Nu este furnizat niciun fișier imagine' });
        }
        console.log(nume, specialitate, functie);
  
        const query = 'INSERT INTO angajati (nume, specialitate, img, functie) VALUES (?, ?, ?, ?)';
        const statement = db.prepare(query);
        const result = statement.run(nume, specialitate, imgPath.replace('public/', ''), functie);
  
        res.json({ success: true, insertedId: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

//Editeaza detalii angajat
exports.editAngajati = (req, res) => {
    try {
        const angajatId = req.params.id;
        const updatedFields = req.body.newData;

        const setClause = Object.keys(updatedFields).map(field => `${field} = :${field}`).join(', ');
        const query = `UPDATE angajati SET ${setClause} WHERE id = :id`;
        db.prepare(query).run({ ...updatedFields, id: angajatId });
    
        res.json({ message: `Campurile au fost actualizate pentru ID ${angajatId}` });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

//Sterge angajat
exports.deleteAngajati = (req, res) => {
    const id = req.params.id;
  
    try {
        const selectStmt = db.prepare('SELECT img FROM angajati WHERE id=?');
        const imgPath = path.join(__dirname, 'src', 'public', selectStmt.get(id)?.img);
  
        if (!imgPath) {
            return res.status(404).json({ error: 'Angajatul nu a fost gasit' });
        }
  
        const deleteStmt = db.prepare('DELETE FROM angajati WHERE id=?');
        const result = deleteStmt.run(id);
  
        if (result.changes === 0) {
            return res.status_404.json({ error: 'Angajatul nu a fost gasit' });
        }

        try {
            fs.unlinkSync(imgPath);
            return res.status(200).json({ message: 'Angajat și imaginea asociată a fost ștearsă cu succes' });

        } catch (unlinkError) {
            console.error(`Eroare la ștergerea fișierului imagine: ${unlinkError.message}`);
            return res.status(500).json({ error: unlinkError.message });
        }
  
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};