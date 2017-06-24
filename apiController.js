const utils = require('./utils');

const baseUrl = 'http://swapi.co/api/';

const getCharByName = async (req, res, next) => {
    const characters = require('./cache/characters.json');
    let chars = null;
    const origParam = req.params.name;
    const useCache = utils.cacheCurrent(characters.cacheTime);
    console.log('use cache', useCache);
    if (useCache) chars = characters.data;
    else chars = await utils.getAllData(`${baseUrl}people`);
    if (origParam) {
        if (isNaN(Number(origParam))) {
            let sent = false;
            const resObj = utils.normalizeStr(origParam);
            const param = resObj.str;
            for (let i = 0; i < chars.length; i++) {
                const { str, firstName } = utils.normalizeStr(chars[i].name);
                if (str === param || str.substring(0, firstName) === param || str.substring(firstName, str.length) === param) {
                    res.render('index', chars[i]);
                    sent = true;
                    return;
                }
            }
            if (!sent) res.json({ error: `No Character found with name/id ${origParam}` });
        } else {
            let response = await utils.request.getAsync(`${baseUrl}people/${origParam}`);
            response = JSON.parse(response.body);
            if (response.detail) res.json({ error: `No Character found with name/id ${origParam}` });
            else res.render('index', response);
        }
    } else res.json({ error: 'You must include an id number or name to search' });
};

const getCharacters = async (req, res, next) => {
    const characters = require('./cache/characters.json');
    let chars = null;
    const sortBy = req.query.sort;
    const useCache = utils.cacheCurrent(characters.cacheTime);
    console.log('use cache', useCache);
    if (useCache) chars = characters.data;
    else chars = await utils.getAllData(`${baseUrl}people`);
    chars.splice(50, chars.length - 50);
    if (sortBy) {
        if (sortBy === 'name' || sortBy === 'mass' || sortBy === 'height') {
            const sortedArr = chars.sort((a, b) => {
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
        } else res.json({ error: 'You can only sort by name, mass, or height' });
    } else res.json(chars);
};

const getPlanetResidents = async (req, res, next) => {
    const planets = require('./cache/planets.json');
    const characters = require('./cache/characters.json');
    const planetsObj = {};
    let people = null;
    let places = null;
    const useCharCache = utils.cacheCurrent(characters.cacheTime);
    const usePlanetCache = utils.cacheCurrent(planets.cacheTime);
    console.log('use char cache', useCharCache, 'use planet cache', usePlanetCache);
    if (useCharCache) people = characters.data;
    else people = await utils.getAllData(`${baseUrl}people`);
    if (usePlanetCache) places = planets.data;
    else places = await utils.getAllData(`${baseUrl}planets`);
    places.map(planet => {
        planetsObj[planet.name] = [];
        people.map(char => {
            if (planet.url === char.homeworld) planetsObj[planet.name].push(char.name);
        });
    });
    res.json(planetsObj);
};

module.exports = {
    getCharByName,
    getCharacters,
    getPlanetResidents
};
