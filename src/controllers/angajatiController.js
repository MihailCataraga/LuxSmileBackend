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
        const numeImagine = '/src/database/img/' + req.params.img;
        res.sendFile(__dirname + numeImagine);

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

//Add Img
exports.addImg = (req, res) => {
    res.json({ message: 'Imagine încărcată cu succes' });
}

//Adauga angajati
exports.addAngajati = (req, res) => {
    try {
        const { nume, specialitate, functie } = req.body;

        if (!nume || !specialitate || !functie) {
            return res.status(400).json({ success: false, message: 'Toate campurile sunt obligatorii' });
        }

        const imgPath = specialitate.toUpperCase() + ' ' + nume.toUpperCase() + '_' + functie + '.jpg';

        const query = 'INSERT INTO angajati (nume, specialitate, img, functie) VALUES (?, ?, ?, ?)';
        const statement = db.prepare(query);

        const result = statement.run(nume, specialitate, imgPath, functie);

        if (result.changes > 0) {
            res.json({ success: true, insertedId: result.lastInsertRowid });
        } else {
            res.status(500).json({ success: false, message: 'Nu s-au putut introduce date in baza de date' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

//Editeaza detalii angajat
exports.editAngajati = (req, res) => {
    try {
        const angajatId = req.params.id;
        const updatedFields = req.body.newData;

        const isNumeUpdated = updatedFields.hasOwnProperty('nume');
        const isSpecialitateUpdated = updatedFields.hasOwnProperty('specialitate');
        const isFunctieUpdated = updatedFields.hasOwnProperty('functie');

        if (isNumeUpdated || isFunctieUpdated || isSpecialitateUpdated) {
            const setClause = Object.keys(updatedFields).map(field => `${field} = :${field}`).join(', ');
            const query = `UPDATE angajati SET ${setClause} WHERE id = :id`;
            const result = db.prepare(query).run({ ...updatedFields, id: angajatId });

            if (isNumeUpdated || isFunctieUpdated) {
                const angajat = db.prepare('SELECT img, nume, functie FROM angajati WHERE id=?').get(angajatId);

                if (angajat) {
                    const basePath = path.join(__dirname, '../database/img/');
                    const relativeImagePath = path.basename(angajat.img);
                    const imagePath = path.join(basePath, relativeImagePath);

                    if (fs.existsSync(imagePath)) {
                        const nume = (isNumeUpdated ? updatedFields.nume : angajat.nume || '').toUpperCase();
                        const functie = (isFunctieUpdated ? updatedFields.functie : angajat.functie || '').toUpperCase();

                        const newImageName = `${nume}_${functie}.jpg`;
                        const newImagePath = path.join(basePath, newImageName);

                        fs.renameSync(imagePath, newImagePath);
                        db.prepare('UPDATE angajati SET img=? WHERE id=?').run(newImageName, angajatId);
                    } else {
                        console.error('Imaginea nu exista', imagePath);
                    }
                } else {
                    console.error({ error: error.message });
                }
            }

            res.json({ message: `Campurile au fost actualizate pentru ID ${angajatId}` });
        } else {
            res.status(400).json({ success: false, error: error.message });
        }

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

//Sterge angajat
exports.deleteAngajati = (req, res) => {
    const id = req.params.id;

    try {
        const selectStmt = db.prepare('SELECT img FROM angajati WHERE id=?');
        const selectedEmployee = selectStmt.get(id);

        if (!selectedEmployee) {
            return res.status(404).json({ error: 'Angajatul nu a fost gasit' });
        }

        const imgPath = path.join(__dirname, '..', 'database', 'img', selectedEmployee.img);

        const deleteStmt = db.prepare('DELETE FROM angajati WHERE id=?');
        const result = deleteStmt.run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Angajatul nu a fost gasit' });
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

//Arata mesajele
exports.fetchMessages = (req, res) => {
    try {
        const query = 'SELECT * FROM mesaje_primite';
        const mesaje = db.prepare(query);
        const results = mesaje.all();
        res.json(results);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

//Schimba read status
exports.markAsRead = (req, res) => {
    try {
        const messageId = req.params.id;
        const updateQuery = 'UPDATE mesaje_primite SET read_status = 1 WHERE id=?';
        const updateStatement = db.prepare(updateQuery);
        updateStatement.run(messageId);
        res.json({ success: true, message: 'Message marked as read successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
