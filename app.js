const express = require ('express');
const app = express ();
const axios = require ('axios');

const {Client} = require ('pg');

const client = new Client ({
  user: 'postgres',
  host: 'localhost',
  database: 'crypto',
  password: 'password',
  port: '5432',
});

client
  .connect ()
  .then (() => {
    console.log ('Connected to PostgreSQL database!');
  })
  .catch (err => {
    console.error ('Error connecting to the database:', err);
  });

app.get ('/', async (req, res) => {
  try {
    // Send a GET request to the WazirX API to fetch tickers data
    const response = await axios.get ('https://api.wazirx.com/api/v2/tickers');
    const data = response.data;
    const currencyPairsArray = [];
    let count = 0;
    for (const pair in data) {
      if (count === 10) break;
      if (data.hasOwnProperty (pair)) {
        const currencyPair = data[pair];
        const pairInfo = {
          name: currencyPair.name,
          last: currencyPair.last,
          buy: currencyPair.buy,
          sell: currencyPair.sell,
          volume: currencyPair.volume,
          base_unit: currencyPair.base_unit,
        };

        currencyPairsArray.push (pairInfo);

        count++;
      }
    }

    try {
      const insertQuery =
        'INSERT INTO crypto (name, last,buy, sell, volume, base_unit) VALUES ($1, $2, $3, $4, $5, $6)';

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
      res.send ('inserted');
    } catch (err) {
      console.log (err);
      res.end ('error');
    }
  } catch (error) {
    console.error (error);
    res.status (500).send ('Internal Server Error');
  }
});

app.listen (3000, err => {
  if (err) console.log (err);
  else console.log ('running');
});
