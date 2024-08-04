import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 4000;

// console.log('PORT from .env:', process.env.PORT);

// Middlewares
app.use(express.json());
app.use(cors());



const server = () => {
  app.listen(PORT, () => {
    console.log('Listening to port', PORT);
  }).on('error', (err) => {
    console.error('Server error:', err.message);
  });
};

server();
