import express from 'express';
import router from './routes/api';
import db from './utils/database';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

async function init() {
  try {
    const result = await db();
    console.log('Database status: ', result);
    console.log('Connected to: ', mongoose.connection.name);

    const app = express();

    app.use(cors());

    app.use(bodyParser.json());

    const PORT = 3000;

    app.get('/', (req, res) => {
      res.status(200).json({
        message: 'Server is running',
        data: null,
      });
    });

    app.use('/api', router);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

init();
