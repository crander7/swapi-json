const express = require('express');
const cors = require('cors');
const path = require('path');
const apiController = require('./apiController');

const app = express();

app.use(cors());

app.use("/views",express.static(__dirname + "/views"));

app.set('view engine', 'ejs');

app.get('/', (req, res, next) => {
    res.sendFile(path.resolve(__dirname, 'views/index.html'));
});

app.get('/characters', apiController.getCharacters);
app.get('/character/:id', apiController.getCharByName);
app.get('/planetresidents', apiController.getPlanetResidents);

app.listen(8085, () => {
    console.log('Server listening on port 8085');
});