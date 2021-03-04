import {Feed} from "feedme";
import {EMPTY, from, Observable, Subscription, timer} from "rxjs";
import * as objectHash from "object-hash";
import axios, {AxiosResponse} from "axios";
import {catchError, switchMap, tap} from "rxjs/operators";

interface UrlMetaData {
    url: string;
    data: Feed;
    subscription: Subscription;
}

class Feeder {

    protected feedUrls: Map<string, UrlMetaData> = new Map();


    public getFeedData = (url: string): Feed => {
        console.log("Anfrage: " + url);
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
        const feed$: Observable<AxiosResponse> = timer(0, 5000).pipe(
            tap(() => console.log("Neue Abfrage von " + url)),
            switchMap(() => from(axios.get(url)).pipe(catchError(() => EMPTY))),
        );

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





