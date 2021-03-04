const express = require('express');
const feeder = require('../dist/cjs');
const path = require('path');
const PORT = process.env.PORT || 5000;

const url = 'https://www.zdf.de/rss/zdf/nachrichten';
express()
    .use(express.static(path.join(__dirname, 'public')))
    .get('/', (req, res) => res.send(feeder.getFeedData(url)))
    .get('/feed', (req, res) => res.send(feeder.getFeedData(url)))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));



