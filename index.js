const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./models'); 
const routeV1 = require('./routes/route');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());


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
