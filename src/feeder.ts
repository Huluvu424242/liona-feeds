import {Feed} from "feedme";
import {EMPTY, from, Observable, Subscription, timer} from "rxjs";
import * as objectHash from "object-hash";
import axios, {AxiosResponse} from "axios";
import {catchError, switchMap, tap} from "rxjs/operators";

interface UrlMetaData {
    url: string;
    period: number;
    withStatistic: boolean;
    data: Feed;
    subscription: Subscription;
}

class Feeder {

    protected feedUrls: Map<string, UrlMetaData> = new Map();


    public getFeedData = (url: string, period: number, withStatistic: boolean): Feed => {
        console.log("Anfrage: " + url);
        const urlHash = objectHash.sha1(url);
        if (this.feedUrls.has(urlHash)) {
            const feedData: UrlMetaData = this.feedUrls.get(urlHash) as UrlMetaData;
            return feedData?.data;
        } else {
            this.feedUrls.set(urlHash, {
                url: url,
                period: period,
                withStatistic: withStatistic,
                data: {} as Feed,
                subscription: this.getNewsFeed(url, urlHash, period, withStatistic)
            });
            return {} as Feed;
        }
    };

    getNewsFeed = (url: string, key: string, period: number, withStatistic: boolean): Subscription => {
        console.log("fetch begin für " + url + " mit key " + key);
        const feed$: Observable<AxiosResponse> = timer(0, period).pipe(
            tap(() => console.log("Neue Abfrage von " + url)),
            switchMap(() => from(axios.get(url)).pipe(catchError(() => EMPTY))),
        );

        const subscription: Subscription = feed$.subscribe(
            (feedResponse: AxiosResponse) => {
                console.log("Suche Metadaten zur Ablage der Responsedaten.");
                const metaData: UrlMetaData = this.feedUrls.get(key) as UrlMetaData;
                if (metaData) {
                    const data = feedResponse.data;
                    console.debug("Feed Data: " + data)
                    console.info("Data received for : " + metaData.url);
                    metaData.data = {type: "", items: data, key: ""};
                    this.feedUrls.set(key, metaData);
                } else {
                    console.debug("Keine Metadaten zur Anfrage gefunden");
                }
            }, (error) => {
                console.error("Response failed with: " + error);
            }, () => {
                console.debug("Feed complete for " + url + "(" + key + ")");
            }
        );
        return subscription;
    };

    speichereResponsedaten() {

    }
}


const feeder: Feeder = new Feeder();

export const getFeedData = (url: string, period: string, statistic: string): Feed => {
    const withPeriod: number = +period || 5000;
    const withStatistic: boolean = statistic === "off" || true;
    return feeder.getFeedData(url, withPeriod, withStatistic);
};





