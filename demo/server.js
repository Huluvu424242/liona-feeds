const express = require('express');
const feeder = require('../dist/cjs');
const PORT = process.env.PORT || 5000;

const demoUrl = 'https://www.zdf.de/rss/zdf/nachrichten';
express()
    .use(feeder.addCORSHeader)
    .get('/', (req, res) => res.send(feeder.getFeedData(demoUrl)))
    .get('/feed/:feedurl', (req, res) => {
        res.send(feeder.getFeedData(req.params.feedurl, req.query.statistic));
    })
    .get('/feed/', (req, res) => {
        const uuid = req.query.uuid;
        if (uuid) {
            res.send(feeder.getFeedDataFor(uuid, req.query.url, req.query.period, req.query.statistic));
        } else {
            res.send(feeder.getFeedData(req.query.url, req.query.statistic));
        }
    })

    .listen(PORT, () => console.log(`Listening on ${PORT}`));



