const express = require('express');
const feeder = require('../dist/cjs');
const path = require('path');
const PORT = process.env.PORT || 5000;

express()
    .use(express.static(path.join(__dirname, 'public')))
    .get('/', (req, res) => res.send(feeder.getNewsFeed()))
    .get('/feed', (req, res) => res.send(feeder.getNewsFeed()))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));



