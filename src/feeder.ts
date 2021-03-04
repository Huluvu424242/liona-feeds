import FeedMe, {Feed} from "feedme";
import {from, Observable} from "rxjs";
import axios from "axios";


export const getNewsFeed = (): string => {
    console.log("fech begin");
    axios.get('https://www.zdf.de/rss/zdf/nachrichten')
        .then((response) => {
            console.log(response.data);
        })
        .catch((error) => {
            console.error(error);
        });

    // let observable$ = new Observable((observer) => {
    //     axios.get('https://www.zdf.de/rss/zdf/nachrichten')
    //         .then((response) => {
    //             observer.next(response.data);
    //             observer.complete();
    //         })
    //         .catch((error) => {
    //             observer.error(error);
    //         });
    // });
    // let subscription = observable$.subscribe({
    //     next: data => {
    //         console.log('[data] => ', data)
    //     },
    //     complete: data => console.log('[complete]'),
    // });
    // return observable$.toPromise();
    return "test";
    // return feeder.getFeed("https://www.zdf.de/rss/zdf/nachrichten").subscribe(
    //     value => console.log(value)
    // );
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



