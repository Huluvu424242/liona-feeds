const express = require('express');
const feeder = require('../dist/cjs');
const path = require('path');
const PORT = process.env.PORT || 5000;


express()
    .use(express.static(path.join(__dirname, 'public')))
    .get('/', (req, res) => res.send(getNewsFeed()))
    .get('/feed', (req, res) => res.send(getNewsFeed()))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));


const getNewsFeed = () => {
    return feeder.getFeed("https://www.zdf.de/rss/zdf/nachrichten").toPromise();
};
