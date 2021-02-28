import express from 'express';
import * as feeder from '../dist/lib/index'

const path = require('path');
const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.static(path.join(__dirname, 'public')))
    .get('/feed', (req, res) => res.send(getNewsFeed()))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

app.listen(5000);

const getNewsFeed = () => {
    return feeder.getFeed("https://www.zdf.de/rss/zdf/nachrichten").toPromise();
};

//
// const init = ()=> {
//
//     express()
//         .use(express.static(path.join(__dirname, 'public')))
//         .get('/feed', (req, res) => res.send(getNewsFeed()))
//         .listen(PORT, () => console.log(`Listening on ${PORT}`));
//
//
//     const getNewsFeed = () => {
//         return feeder.getFeed("https://www.zdf.de/rss/zdf/nachrichten").toPromise();
//     };
// }
//
// module.exports =  {init};
