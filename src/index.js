const express = require('express');
const path = require('path');
const compression = require('compression');
const ctrl = require('./controller');
const config = require('../config.json');

const app = express();

app.use(compression());

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

app.get('/people', ctrl.getCharacters);
app.get('/planets', ctrl.getPlanetResidents);

app.get('/*', (req, res) => {
    res.redirect('/');
});

app.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
});
