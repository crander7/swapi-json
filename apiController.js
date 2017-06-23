const Bluebird = require('bluebird');
const request = Bluebird.promisifyAll(require('request'));
const _ = require('lodash');

const baseUrl = 'http://swapi.co/api/';

const getAllData = (url) => new Promise(async (resolve) => {
    let tempArr = [];
    let resp = await pager(url, tempArr);
    while (resp.nextUrl) {
        resp = await pager(resp.nextUrl, resp.dataArr);
    }
    resolve(resp.dataArr);
});

const getCharById = async (req, res, next) => {
    if (req.params.id) {
        let response = await request.getAsync(`${baseUrl}people/${req.params.id}`);
        response = JSON.parse(response.body);
        if (response.detail) res.json({ error: `No Character found with id ${req.params.id}` });
        else res.render('index', response);
    } else res.json({ error: 'You must include an id number to search' });
};

const getCharacters = async (req, res, next) => {
    const sortBy = req.query.sort;
    if (sortBy === 'name' || sortBy === 'mass' || sortBy === 'height') {
        let tempArr = [];
        let resp = await pager(`${baseUrl}people`, tempArr);
        while (resp.dataArr.length < 50 && resp.nextUrl) {
            resp = await pager(resp.nextUrl, resp.dataArr);
        }
        const characters = resp.dataArr;
        if (sortBy) {
            const sortedArr = characters.sort((a, b) => {
                if (sortBy === 'name') return a.name.localeCompare(b.name);
                else {
                    a[sortBy] = a[sortBy].replace(/,/g, '');
                    b[sortBy] = b[sortBy].replace(/,/g, '');
                    if (a[sortBy] === 'unknown') a[sortBy] = Infinity;
                    else if (b[sortBy] === 'unknown') b[sortBy] = Infinity;
                    if (Number(a[sortBy]) < Number(b[sortBy])) {
                        if (a[sortBy] === Infinity) a[sortBy] = 'unknown';
                        if (b[sortBy] === Infinity) b[sortBy] = 'unknown';
                        return -1;
                    } else if (Number(a[sortBy]) > Number(b[sortBy])) {
                        if (a[sortBy] === Infinity) a[sortBy] = 'unknown';
                        if (b[sortBy] === Infinity) b[sortBy] = 'unknown';
                        return 1;
                    } else {
                        if (a[sortBy] === Infinity) a[sortBy] = 'unknown';
                        if (b[sortBy] === Infinity) b[sortBy] = 'unknown';
                        return 0;
                    }
                }
            });
            res.json(sortedArr);
        } else res.json(characters);
    } else res.json({ error: 'The you can only sort by name, mass, or height' });
};

const getPlanetResidents = async (req, res, next) => {
    const people = await getAllData(`${baseUrl}people`);
    const places = await getAllData(`${baseUrl}planets`);
    const planets = {};
    places.map(planet => {
        planets[planet.name] = [];
        people.map(char => {
            if (planet.url === char.homeworld) planets[planet.name].push(char.name);
        });
    });
    res.json(planets);
};

const pager = (url, arr) => new Promise(async (resolve) => {
    let response = await request.getAsync(url);
    response = JSON.parse(response.body);
    arr.push(response.results);
    arr = _.flatten(arr);
    resolve({ nextUrl: response.next, dataArr: arr });
});

module.exports = {
    getCharById,
    getCharacters,
    getPlanetResidents
};
