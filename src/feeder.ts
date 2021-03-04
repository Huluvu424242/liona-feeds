import FeedMe, {Feed} from "feedme";
import {from, Observable, Subscription} from "rxjs";
import * as objectHash from "object-hash";
import axios, {AxiosResponse} from "axios";

interface UrlMetaData {
    url: string;
    data: Feed;
    subscription: Subscription;
}

class Feeder {

    protected feedUrls: Map<string, UrlMetaData> = new Map();


    public getFeedData = (url: string): Feed => {
        const urlHash = objectHash.sha1(url);
        if (this.feedUrls.has(urlHash)) {
            const feedData: UrlMetaData = this.feedUrls.get(urlHash) as UrlMetaData;
            return feedData?.data;
        } else {
            this.feedUrls.set(urlHash, {
                url: url,
                data: {} as Feed,
                subscription: this.getNewsFeed(url, urlHash)
            });
            return {} as Feed;
        }
    };

    getNewsFeed = (url: string, key: string): Subscription => {
        console.log("fetch begin für " + url + " mit key " + key);
        const feed$: Observable<AxiosResponse> = from(axios.get(url));
        const subscription: Subscription = feed$.subscribe(
            feedResponse => {
                console.log("fetch begin");
                const metaData: UrlMetaData = this.feedUrls.get(key) as UrlMetaData;
                if (metaData) {
                    const data = feedResponse.data;
                    console.log("Data: " + data);
                    metaData.data = {type: "", items: data, key: ""};
                    this.feedUrls.set(key, metaData);
                }
            }
        );
        return subscription;
    };
}


const feeder: Feeder = new Feeder();

export const getFeedData = (url: string): Feed => {
    return feeder.getFeedData(url);
};


/**
 * @Method: Returns the plural form of any noun.
 * @Param {string}
 * @Return {string}
 */
// const getFeed = (queryUrl: string): Observable<Feed> => {
//     console.info('###url: ' + queryUrl);
//     return from(loadFeedData(queryUrl));
// }

const loadFeedData = (url: string): Promise<Feed> => {
    return new Promise<Feed>((resolve, reject) => {
        fetch(url).then((response: Response) => {
            if (response.status != 200) {
                const error = new Error(`status code ${response.status}`);
                console.error(error);
                reject(error);
            } else {
                let parser = new FeedMe(true);
                parser.on('finish', () => {
                    try {
                        const data: Feed = parser.done() as Feed;
                        resolve(data);
                    } catch (ex) {
                        // expect to failed if no body
                        console.warn("Error during read data of response " + ex);
                        reject(ex);
                    }

                });
                response.text().then((txt) => parser.end(txt));
            }
        });
    });
};



