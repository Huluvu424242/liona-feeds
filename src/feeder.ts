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

    protected logMetadata(feedData: UrlMetaData) {
        console.debug("Url:" + feedData.url);
        console.debug("Period:" + feedData.period);
        console.debug("Statistik:" + feedData.withStatistic);
    }

    public getFeedData = (url: string, period: number, withStatistic: boolean): Feed => {
        console.log("Anfrage: " + url);
        const key = objectHash.sha1(url);
        if (this.feedUrls.has(key)) {
            const feedData: UrlMetaData = this.feedUrls.get(key) as UrlMetaData;
            this.logMetadata(feedData);
            // Wechsel Statistik schreiben
            if (withStatistic !== feedData.withStatistic) {
                feedData.withStatistic = withStatistic;
            }
            // Wechsel Abfrageperiode
            if (period !== feedData.period) {
                feedData.period = period;
                feedData.subscription.unsubscribe();
                feedData.subscription = this.getNewsFeed(url, key, period, withStatistic);
            }
            this.logMetadata(feedData);
            return feedData?.data;
        } else {
            const feedData: UrlMetaData = {
                url: url,
                period: period,
                withStatistic: withStatistic,
                data: {} as Feed,
                subscription: this.getNewsFeed(url, key, period, withStatistic)
            };
            this.logMetadata(feedData);
            this.feedUrls.set(key, feedData);
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
                    // console.debug("Feed Data: " + data)
                    console.debug("Data received for : " + metaData.url);
                    metaData.data = {type: "", items: data, key: ""};
                    // this.feedUrls.set(key, metaData);
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

export const getFeedData = (url: string, period: string, nostatistic: string): Feed => {
    const withPeriod: number = +period || 5000;
    const withStatistic: boolean = !nostatistic;
    return feeder.getFeedData(url, withPeriod, withStatistic);
};





