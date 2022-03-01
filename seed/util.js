const jwt = require('jsonwebtoken');

function randomRange(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function checkPercentage(percent) {
    return Math.random() * 100 < percent;
}

function takeRandomEleInArray(arr, n) {
    let len = arr.length;
    let result = new Array(n);
    let taken = new Array(len);
    if (n > len) throw new RangeError('getRandom: more elements taken than available');
    while (n--) {
        const x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

async function promisePool(items, concurrency, transformer) {
    const _items = [...items];
    const result = [];

    while (_items.length > 0) {
        const slice = _items.splice(0, concurrency);
        const ps = await Promise.all(slice.map(transformer));
        result.push(...ps);
    }
    return result;
}

function parseTokens(tokens) {
    return tokens.map((token) => jwt.decode(token));
}

function dateDiff(from, to) {
    const diffTime = Math.abs(to - from);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function dateAdd(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function randomDateFrom(day) {
    const timestamp = randomRange(dateAdd(Date.now(), -day).getTime(), Date.now());
    return new Date(timestamp);
}

module.exports = {
    randomDateFrom,
    dateAdd,
    dateDiff,
    parseTokens,
    promisePool,
    randomRange,
    checkPercentage,
    takeRandomEleInArray,
};
