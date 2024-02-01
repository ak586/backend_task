// database.js

const {Client} = require ('pg');

const client = new Client ({
  user: 'postgres',
  host: 'localhost',
  database: 'crypto',
  password: 'password',
  port: '5432',
});

async function connectToDatabase () {
  try {
    await client.connect ();
    console.log ('Connected to PostgreSQL database!');
  } catch (err) {
    console.error ('Error connecting to the database:', err);
    throw err;
  }
}

async function insertData (currencyPairsArray) {
  try {
    const insertQuery =
      'INSERT INTO crypto (name, last, buy, sell, volume, base_unit) VALUES ($1, $2, $3, $4, $5, $6)';

    for (const pairInfo of currencyPairsArray) {
      const values = [
        pairInfo.name,
        pairInfo.last,
        pairInfo.buy,
        pairInfo.sell,
        pairInfo.volume,
        pairInfo.base_unit,
      ];
      await client.query (insertQuery, values);
    }

    console.log ('Data inserted successfully');
  } catch (err) {
    console.error ('Error inserting data:', err);
    throw err;
  }
}

module.exports = {connectToDatabase, insertData, client};
