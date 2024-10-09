const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');
const routeV1 = require('./routes/route');
require('dotenv').config();
const cors = require("cors")

const app = express();

app.use(bodyParser.json());
app.use(cors())
app.use(cors({
  origin: '*'
}))
app.use(express.text())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(routeV1);


sequelize.authenticate()
  .then(() => {
    console.log('Database connected.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
