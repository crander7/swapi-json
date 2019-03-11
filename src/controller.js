const axios = require('axios');
const config = require('../config.json');

const getApiData = async (url) => {
    const dataValues = [];
    let next = url;
    while (next) {
        let res;
        try {
            res = await axios({
                method: 'GET',
                url: next
            });
            if (res.data) {
                dataValues.push(...res.data.results);
                ({ next } = res.data);
            }
        } catch (e) {
            next = null;
        }
    }
    return dataValues;
};

const stdSort = (a, b, sortBy) => {
    let left = a[sortBy].replace(/[^\d\.]/g, ''); // eslint-disable-line
    let right = b[sortBy].replace(/[^\d\.]/g, ''); // eslint-disable-line

    if (left === '') left = null;
    else left = Number(left);

    if (right === '') right = null;
    else right = Number(right);
    if (left < right) {
        return -1;
    }
    if (left > right) {
        return 1;
    }
    return 0;
};

const getCharacters = async (req, res) => {
    let { sortBy } = req.query;
    sortBy = sortBy.replace(/\W/g, '');
    if (sortBy && config.validSorts.indexOf(sortBy) === -1) {
        return res.json({
            error: `invalid sortBy: "${sortBy}".`,
            validInputs: config.validSorts
        });
    }
    const chars = await getApiData(`${config.baseUrl}people`);
    if (sortBy) {
        chars.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            return stdSort(a, b, sortBy);
        });
    }
    return res.json(chars);
};

const getPlanetResidents = async (req, res) => {
    try {
        const dataFetch = [
            getApiData(`${config.baseUrl}people`, 1),
            getApiData(`${config.baseUrl}planets`, 2)
        ];
        const [people, planets] = await Promise.all(dataFetch);
        planets.forEach((planet) => {
            people.forEach((person) => {
                if (planet.url === person.homeworld) {
                    planet.residents.push(person.name);
                }
            });
            planet.residents.splice(0, parseInt((planet.residents.length / 2), 10));
        });
        res.json(planets);
    } catch (e) {
        res.status(500).json({ error: e.toString() });
    }
};

module.exports = {
    getCharacters,
    getPlanetResidents
};
