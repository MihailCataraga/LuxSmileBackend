const Database = require('better-sqlite3');
const DB = './src/database/luxsmile.db';
const db = new Database(DB);

module.exports = db;