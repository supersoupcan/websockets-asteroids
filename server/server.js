const path = require('path');
const express = require('express');
const routes = require('./routes');

//CREATE//
var app = express();

//SERVE STATIC FILES//
app.use(express.static(path.join(__dirname, '../client/static')));

//ROUTES//

//GLOBAL ROUTE SINGLE PAGE APPLICATION
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'client', 'index.html'));
});

//SERVE API//
module.exports = app;