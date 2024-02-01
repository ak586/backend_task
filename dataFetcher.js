// dataFetcher.js

const axios = require ('axios');

async function fetchData () {
  try {
    const response = await axios.get ('https://api.wazirx.com/api/v2/tickers');
    return response.data;
  } catch (error) {
    console.error ('Error fetching data:', error);
    throw error;
  }
}

module.exports = {fetchData};
