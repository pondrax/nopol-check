import express from 'express'
import { checkNopol } from './recognize.js';
// Create a new express application
const app = express();

// Define a route handler for the default home page
app.get('/', async(req, res) => {
  try {
    // const data ='test'
    const data = await checkNopol(req.query.nopol); // example async function
    res.send(data);
  } catch (error) {
    // console.error(error);
    res.sendStatus(500);
  }
  // const result = await checkNopol('W 3240 LC');
  // res.send(result);
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log('Server started on port 3000');
});