const express = require('express');
const feeder = require('../dist/cjs');
const path = require('path');
const PORT = process.env.PORT || 5000;

const demoUrl = 'https://www.zdf.de/rss/zdf/nachrichten';
express()
    // .use(express.static(path.join(__dirname, 'public')))
    .get('/', (req, res) => res.send(feeder.getFeedData(demoUrl)))
    .get('/feed/:feedurl', (req, res) => res.send(feeder.getFeedData(req.params.feedurl)))
    .get('/feed/', (req, res) => {
        res.send(feeder.getFeedData(req.query.url,req.query.period,req.query.nostatistic));
    })
    .listen(PORT, () => console.log(`Listening on ${PORT}`));



