const CronJob = require('cron').CronJob;
const utils = require('./utils');
const fs = require('fs');

const baseUrl = 'http://swapi.co/api/';

const dataCache = new CronJob({
    cronTime: '0 30 * * * *',
    onTick: async () => {
        console.log('cron started');
        const charData = await utils.getAllData(`${baseUrl}people`);
        const planetData = await utils.getAllData(`${baseUrl}planets`);
        const characters = {
            cacheTime: new Date().getTime(),
            data: charData
        };
        const planets = {
            cacheTime: new Date().getTime(),
            data: planetData
        };
        fs.writeFileSync('./cache/characters.json', JSON.stringify(characters));
        fs.writeFileSync('./cache/planets.json', JSON.stringify(planets));
        console.log('cron done');
    },
    runOnInit: false
});

module.exports = dataCache;