// app.js

const express = require ('express');
const {fetchData} = require ('./dataFetcher');
const {connectToDatabase, insertData, client} = require ('./database'); // Import the new module

const app = express ();
app.set ('view engine', 'ejs');
app.use (express.static (__dirname + '/public'));

async function startServer () {
  try {
    await connectToDatabase (); // Connect to the database
    app.listen (3000, err => {
      if (err) console.log (err);
      else console.log ('Server is running on port 3000');
    });
  } catch (error) {
    console.error ('Error starting the server:', error);
  }
}

function processRawData (rawData) {
  const currencyPairsArray = [];
  let count = 0;

  for (const pair in rawData) {
    if (count === 10) break;
    if (rawData.hasOwnProperty (pair)) {
      const currencyPair = rawData[pair];
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
  return currencyPairsArray;
}

app.get ('/', async (req, res) => {
  try {
    const data = await fetchData ();
    const currencyPairsArray = processRawData (data);

    await insertData (currencyPairsArray);
    const latestRows = await getLatestRowsFromDatabase (10);
    res.render ('home', {data: latestRows});
  } catch (error) {
    console.error (error);
    res.status (500).send ('Internal Server Error');
  }
});

async function getLatestRowsFromDatabase (count) {
  try {
    const query = 'SELECT * FROM crypto ORDER BY id DESC LIMIT $1';
    const result = await client.query (query, [count]);
    return result.rows;
  } catch (err) {
    console.error ('Error fetching data from the database:', err);
    throw err;
  }
}

startServer ();
