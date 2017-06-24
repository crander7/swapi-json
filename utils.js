const Bluebird = require('bluebird');
const request = Bluebird.promisifyAll(require('request'));
const _ = require('lodash');

const pager = (url, arr) => new Promise(async (resolve) => {
    let response = await request.getAsync(url);
    response = JSON.parse(response.body);
    arr.push(response.results);
    arr = _.flatten(arr);
    resolve({ nextUrl: response.next, dataArr: arr });
});

const normalizeStr = (str) => {
    let firstName = 0;
    if (str.indexOf('-') !== -1) {
        firstName = str.substring(0, str.indexOf('-')).length;
        str = str.split('-').join('').toLowerCase();
    } else if (str.indexOf('_') !== -1) {
        firstName = str.substring(0, str.indexOf('_')).length;
        str = str.split('_').join('').toLowerCase();
    } else if (str.indexOf(' ') !== -1) {
        firstName = str.substring(0, str.indexOf(' ')).length;
        str = str.split(' ').join('').toLowerCase();
    } else {
        str = str.toLowerCase();
    }
    return {
        str,
        firstName
    };
};

const getAllData = (url) => new Promise(async (resolve) => {
    let tempArr = [];
    let resp = await pager(url, tempArr);
    while (resp.nextUrl) {
        resp = await pager(resp.nextUrl, resp.dataArr);
    }
    resolve(resp.dataArr);
});

const cacheCurrent = (time) => {
    const now = new Date().getTime();
    if ((now - time) <= 3600000) return true;
    else return false;
};

const clearModule = (mod) => {
    delete require.cache[require.resolve(mod)];
    return;
};

module.exports = {
    normalizeStr,
    getAllData,
    request,
    cacheCurrent,
    clearModule
};
