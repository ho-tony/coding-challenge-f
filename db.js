const Database = require('better-sqlite3'); //I use this for synchronous operations (although we are only using one user)
const path = require('path')

const db = new Database(path.resolve(__dirname, "server.db"), {

}); //creates sqlite db if it does not exist

const createTableQuery = 
`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY,
    payer TEXT NOT NULL,
    points INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`;

db.exec(createTableQuery);

module.exports = db;