const express = require('express');
const bodyParser = require('body-parser');
const appRoutes = require('./app/routes');

const app = express();
app.set('view engine','ejs');
const port = 8000;
app.use(bodyParser.urlencoded({ extended: false }));

appRoutes(app);
app.listen(port, () => {
  console.log('Listening on ' + port);
});