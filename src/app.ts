import express from 'express';
import router from './routes/route';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);
const cors = require('cors');
app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

export default app;
