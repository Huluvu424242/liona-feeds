import FeedMe, {Feed} from "feedme";
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

    protected isLogActive = true;

    protected feedUrls: Map<string, UrlMetaData> = new Map();

    protected logError(message: string) {
        if (this.isLogActive) console.error(message);
    }

    protected logDebug(message: string) {
        if (this.isLogActive) console.debug(message);
    }

    protected logInfo(message: string) {
        if (this.isLogActive) console.info(message);
    }

    protected logMetadata(titel: string, feedData: UrlMetaData) {
        this.logDebug(titel);
        this.logDebug("Url:" + feedData.url);
        this.logDebug("Period:" + feedData.period);
        this.logDebug("Statistik:" + feedData.withStatistic);
    }

    public getFeedData = (url: string, period: number, withStatistic: boolean): Feed => {
        this.logInfo("Eingehende Anfrage für " + url + " mit period: " + period + " und Statistik " + withStatistic);
        const key = objectHash.sha1(url);
        if (this.feedUrls.has(key)) {
            const feedData: UrlMetaData = this.feedUrls.get(key) as UrlMetaData;
            this.logMetadata("Metadaten Alt", feedData);
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
            this.logMetadata("Metadaten Neu", feedData);
            return feedData?.data;
        } else {
            const feedData: UrlMetaData = {
                url: url,
                period: period,
                withStatistic: withStatistic,
                data: {} as Feed,
                subscription: this.getNewsFeed(url, key, period, withStatistic)
            };
            this.logMetadata("Erstelle Metadaten", feedData);
            this.feedUrls.set(key, feedData);
            return {} as Feed;
        }
    };

    protected getNewsFeed = (url: string, key: string, period: number, withStatistic: boolean): Subscription => {
        this.logDebug("fetch begin für " + url + " mit key " + key);
        const feed$: Observable<AxiosResponse> = timer(0, period).pipe(
            tap(() => console.log("Neue Abfrage von " + url)),
            switchMap(() => from(axios.get(url)).pipe(catchError(() => EMPTY))),
        );

        const subscription: Subscription = feed$.subscribe(
            (feedResponse: AxiosResponse) => {
                // if (response.status != 200) {
                //     this.logError(new Error(`status code ${feedResponse.status}`));
                //     return;
                // }
                let parser = new FeedMe(true);
                parser.end(feedResponse.data);
                const feed = parser.done() as Feed;
                this.speichereResponsedaten(key, feed);
            }, (error) => {
                this.logError("Response failed with: " + error);
            }, () => {
                this.logDebug("Feed complete for " + url + "(" + key + ")");
            }
        );
        return subscription;
    };

    protected speichereResponsedaten(key: string, feed: Feed) {
        this.logDebug("Suche Metadaten zur Ablage der Responsedaten.");
        const metaData: UrlMetaData = this.feedUrls.get(key) as UrlMetaData;
        if (metaData) {
            this.logDebug("Feed Data: " + JSON.stringify(feed));
            this.logDebug("Data received for : " + metaData.url);
            metaData.data = feed;
        } else {
            this.logDebug("Keine Metadaten zur Anfrage gefunden");
        }
    }
}


const feeder: Feeder = new Feeder();

export const getFeedData = (url: string, period: string, nostatistic: string): Feed => {
    const withPeriod: number = +period || 5000;
    const withStatistic: boolean = !nostatistic;
    return feeder.getFeedData(url, withPeriod, withStatistic);
};





