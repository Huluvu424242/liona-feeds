import express from 'express'
import getFeed from '../dist/cjs/index'

// const init = ()=> {

express()
    .use(express.static(path.join(__dirname, 'public')))
    .get('/feed', (req, res) => res.send(getNewsFeed()))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));


const getNewsFeed = () => {
    return getFeed("https://www.zdf.de/rss/zdf/nachrichten").toPromise();
};

// }

// module.exports =  {init};
