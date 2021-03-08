import FeedMe, {Feed} from "feedme";
import {EMPTY, from, Observable, Subscription, timer} from "rxjs";
import * as objectHash from "object-hash";
import axios, {AxiosResponse} from "axios";
import {catchError, switchMap, tap} from "rxjs/operators";
import {Logger} from "./logger";

interface UrlMetaData {
    url: string;
    period: number;
    withStatistic: boolean;
    data: Feed;
    subscription: Subscription;
}

class Feeder {

    protected LOG:Logger = new Logger();

    protected feedUrls: Map<string, UrlMetaData> = new Map();

    protected logMetadata(titel: string, feedData: UrlMetaData) {
        this.LOG.logDebug(titel);
        this.LOG.logDebug("Url:" + feedData.url);
        this.LOG.logDebug("Period:" + feedData.period);
        this.LOG.logDebug("Statistik:" + feedData.withStatistic);
    }

    public getFeedData = (url: string, withStatistic: boolean): Feed => {
        this.LOG.logInfo("Eingehende Anfrage an " + url + " und Statistik " + withStatistic);
        const key = objectHash.sha1(url);
        if (this.feedUrls.has(key)) {
            const feedData: UrlMetaData = this.feedUrls.get(key) as UrlMetaData;
            this.logMetadata("Metadaten Alt", feedData);
            // Wechsel Statistik schreiben
            if (withStatistic !== feedData.withStatistic) {
                feedData.withStatistic = withStatistic;
            }
            this.logMetadata("Metadaten Neu", feedData);
            return feedData?.data;
        } else {
            const feedData: UrlMetaData = {
                url: url,
                period: DEFAULT_PERIOD,
                withStatistic: withStatistic,
                data: {} as Feed,
                subscription: this.getNewsFeed(url, key, DEFAULT_PERIOD, withStatistic)
            };
            this.logMetadata("Erstelle Metadaten", feedData);
            this.feedUrls.set(key, feedData);
            return {} as Feed;
        }

    };

    public getFeedDataFor = (uuid:string, url: string, period: number, withStatistic: boolean): Feed => {
       this.LOG.logInfo("Eingehende Anfrage für " +uuid +" an " + url + " mit period: " + period + " und Statistik " + withStatistic);
        const key = objectHash.sha1(uuid + url);
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
       this.LOG.logDebug("fetch begin für " + url + " mit key " + key);
        const feed$: Observable<AxiosResponse> = timer(0, period).pipe(
            tap(() => console.log("Neue Abfrage von " + url)),
            switchMap(() => from(axios.get(url)).pipe(catchError(() => EMPTY))),
        );

        return feed$.subscribe(
            (feedResponse: AxiosResponse) => {
                if (feedResponse.status != 200) {
                   this.LOG.logError(new Error(`status code ${feedResponse.status}`));
                    return;
                }
                let parser = new FeedMe(true);
                parser.end(feedResponse.data);
                const feed = parser.done() as Feed;
                this.speichereResponsedaten(key, feed);
            }, (error) => {
               this.LOG.logError(new Error(`Response failed with: ${error}`));
            }, () => {
               this.LOG.logDebug("Feed complete for " + url + "(" + key + ")");
            }
        );
    };

    protected speichereResponsedaten(key: string, feed: Feed) {
       this.LOG.logDebug("Suche Metadaten zur Ablage der Responsedaten.");
        const metaData: UrlMetaData = this.feedUrls.get(key) as UrlMetaData;
        if (metaData) {
           this.LOG.logDebug("Feed Data: " + JSON.stringify(feed));
           this.LOG.logDebug("Data received for : " + metaData.url);
            metaData.data = feed;
        } else {
           this.LOG.logDebug("Keine Metadaten zur Anfrage gefunden");
        }
    };
}


const DEFAULT_PERIOD:number = 5000;
const feeder: Feeder = new Feeder();

export const getFeedData = (url: string, statistic: string): Feed => {
    const withStatistic: boolean = !!statistic;
    return feeder.getFeedData(url, withStatistic);
};

export const getFeedDataFor = (uuid:string, url: string, period: string, statistic: string): Feed => {
    const withPeriod: number = +period || DEFAULT_PERIOD;
    const withStatistic: boolean = !!statistic;
    return feeder.getFeedDataFor(uuid, url, withPeriod, withStatistic);
};




