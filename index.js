import express from 'express'
import { checkNopol } from './recognize.js';

const app = express();

// Define a route handler for the default home page
app.get('/', async (req, res) => {
  res.send(`
    <form action="/api">
      <input name="nopol" placeholder="Nomor Kendaraan">
      <button>Cek</button>
    </form>
  `)
});

app.get('/api', async (req, res) => {
  try {
    const data = await checkNopol(req.query.nopol); // example async function
    res.send(data);
  } catch (error) {
    console.error(error);
    res.send({ success: false, message: 'try again' });
  }
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log('Server started on port 3000');
});