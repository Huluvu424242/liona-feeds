const express = require('express');
const feeder = require('../dist/cjs');
const PORT = process.env.PORT || 5000;

const demoUrl = 'https://www.zdf.de/rss/zdf/nachrichten';
express()
    .get('/', (req, res) => res.send(feeder.getFeedData(demoUrl)))
    .get('/feed/:feedurl', (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(feeder.getFeedData(req.params.feedurl, req.query.statistic));
    })
    .get('/feed/', (req, res) => {
        // const origin = req.get('host') ||  req.get('origin') || "*";
        const origin = req.get('origin') || "*";
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        const uuid = req.query.uuid;
        if (uuid) {
            res.send(feeder.getFeedDataFor(uuid, req.query.url, req.query.period, req.query.statistic));
        } else {
            res.send(feeder.getFeedData(req.query.url, req.query.statistic));
        }
    })

    .listen(PORT, () => console.log(`Listening on ${PORT}`));



