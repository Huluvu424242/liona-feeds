import FeedMe, {Feed} from "feedme";
import {from, Observable} from "rxjs";


/**
 * @Method: Returns the plural form of any noun.
 * @Param {string}
 * @Return {string}
 */
export const getFeed = (queryUrl: string): Observable<Feed> => {
    return from(loadFeedData(queryUrl));
}

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
}
