const db = require('../database/db');

//Adauga mesaj in db
exports.adaugaMesaj = (req, res) => {
    try {
        const data = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        const query = 'INSERT INTO mesaje_primite (nume_client, data_adaugare, telefon, email, serviciu, mesaj, read_status) VALUES (?,?,?,?,?,?,0)';
        const { nume_client, telefon, email, serviciu, mesaj } = req.body;
        const stmt = db.prepare(query);
        const result = stmt.run(nume_client, data, telefon, email, serviciu, mesaj);

        // console.log('Mesaj adaugat');
        res.status(200).json({ message: 'Mesaj adaugat' });
    } catch (error) {
        console.error('Eroare:', error);
        res.status(500).json({ error: error.message });
    }
}


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
        const updateQuery = 'UPDATE mesaje_primite SET read_status = 0 WHERE id=?';
        const updateStatement = db.prepare(updateQuery);
        updateStatement.run(messageId);
        res.json({ success: true, message: 'Message marked as read successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};