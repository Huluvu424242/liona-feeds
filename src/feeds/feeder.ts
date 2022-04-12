import FeedMe, {Feed} from "feedme";
import {EMPTY, from, Observable, Subscription, timer} from "rxjs";
import * as objectHash from "object-hash";
import axios, {AxiosResponse} from "axios";
import {catchError, switchMap, tap} from "rxjs/operators";
import {Cleaner} from "./cleaner";
import {Statistic} from "./statistic";
import {logService} from "../shared/log-service";
import {FeedMetadata, StatisticData} from "./metadata";


class Feeder {

    protected feeds: Map<string, FeedMetadata> = new Map();

    protected cleaner: Cleaner = new Cleaner(this.feeds); // selbststartend
    protected statistic: Statistic = new Statistic(this.feeds);

    constructor() {
        this.cleaner.subscribeCleanUpJob();
    }


    protected logMetadata(titel: string, feedData: FeedMetadata) {
        logService.debugMessage(titel);
        logService.debugMessage("Url:" + feedData.url);
        logService.debugMessage("Period:" + feedData.period);
        logService.debugMessage("Statistik:" + feedData.withStatistic);
    }

    public getFeeds(): Observable<StatisticData[]> {
        logService.debugMessage("Statistiken angefragt");
        return this.statistic.getStatistics();
    }

    public getRankedFeeds() {
        logService.debugMessage("Ranked Statistiken angefragt");
        return this.statistic.getRankedStatistics();
    }

    public unsubscribeFeedFor = (uuid: string, url: string): void => {
        const key = objectHash.sha1(uuid + url);
        if (this.feeds.has(key)) {
            const feed: FeedMetadata = this.feeds.get(key) as FeedMetadata;
            this.feeds.delete(key);
            feed.subscription.unsubscribe();
        }
    };

    public getFeedData = (url: string, withStatistic: boolean): Feed => {
        logService.infoMessage("Eingehende Anfrage an " + url + " und Statistik " + withStatistic);
        const key = objectHash.sha1(url);
        let feedData: FeedMetadata;
        if (this.feeds.has(key)) {
            feedData = this.feeds.get(key) as FeedMetadata;
            this.logMetadata("Metadaten Alt", feedData);
            // Log lastRequest
            feedData.lastRequested = new Date();
            // Wechsel Statistik schreiben
            if (withStatistic !== feedData.withStatistic) {
                feedData.withStatistic = withStatistic;
            }
            this.logMetadata("Metadaten Neu", feedData);
        } else {
            feedData = {
                lastRequested: new Date(),
                url: url,
                period: DEFAULT_PERIOD,
                withStatistic: withStatistic,
                data: {} as Feed,
                subscription: this.getNewsFeed(url, key, DEFAULT_PERIOD, withStatistic)
            };
            this.logMetadata("Erstelle Metadaten", feedData);
            this.feeds.set(key, feedData);
        }
        this.statistic.feedWasRequested(key);
        return feedData?.data;
    };

    public subscribeFeedDataFor = (uuid: string, url: string, period: number, withStatistic: boolean): Feed => {
        logService.infoMessage("Eingehende Anfrage für " + uuid + " an " + url + " mit period: " + period + " und Statistik " + withStatistic);
        const key = objectHash.sha1(uuid + url);
        let feedData: FeedMetadata
        if (this.feeds.has(key)) {
            feedData = this.feeds.get(key) as FeedMetadata;
            this.logMetadata("Metadaten Alt", feedData);
            // Log lastRequested
            feedData.lastRequested = new Date();
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
        } else {
            feedData = {
                lastRequested: new Date(),
                url: url,
                period: period,
                withStatistic: withStatistic,
                data: {} as Feed,
                subscription: this.getNewsFeed(url, key, period, withStatistic)
            };
            this.logMetadata("Erstelle Metadaten", feedData);
            this.feeds.set(key, feedData);
        }
        this.statistic.feedWasRequested(key);
        return feedData?.data;
    };

    protected getNewsFeed = (url: string, key: string, period: number, withStatistic: boolean): Subscription => {
        logService.debugMessage("Create periodic fetcher for " + url + " with key " + key);
        const feed$: Observable<AxiosResponse> = timer(0, period).pipe(
            tap(() => {
                console.log("Kontakte " + url + " für " + key);
                this.statistic.feedWasContacted(key);
            }),
            switchMap(() => from(axios.get(url)).pipe(catchError(() => EMPTY)))
        );

        return feed$.subscribe(
            (feedResponse: AxiosResponse) => {
                if (feedResponse.status != 200) {
                    logService.errorMessage("", new Error(`status code ${feedResponse.status}`));
                    return;
                }
                let parser = new FeedMe(true);
                parser.end(feedResponse.data);
                const feed = parser.done() as Feed;
                this.statistic.feedResponseWasOK(key);
                this.speichereResponsedaten(key, feed);
            }, (error) => {
                logService.errorMessage("", new Error(`Response failed with: ${error}`));
            }, () => {
                logService.errorMessage("Feed complete for " + url + "(" + key + ")");
            }
        );
    };

    protected speichereResponsedaten(key: string, feed: Feed) {
        logService.debugMessage("Suche Metadaten zur Ablage der Responsedaten.");
        const metaData: FeedMetadata = this.feeds.get(key) as FeedMetadata;
        if (metaData) {
            // this.LOG.logDebug("Feed Data: " + JSON.stringify(feed));
            logService.debugMessage("Data received for : " + metaData.url);
            metaData.data = feed;
        } else {
            logService.debugMessage("Keine Metadaten zur Anfrage gefunden");
        }
    };
}


const DEFAULT_PERIOD: number = 60000 * 10;
const feeder: Feeder = new Feeder();


export const getFeeds = (): Observable<StatisticData[]> => {
    return feeder.getFeeds();
}

export const getRankedFeeds = (): Observable<StatisticData[]> => {
    return feeder.getRankedFeeds();
}

export const getFeedData = (url: string, statistic: string): Feed => {
    const withStatistic: boolean = !!statistic;
    return feeder.getFeedData(url, withStatistic);
};

export const getFeedDataFor = (uuid: string, url: string, period: string, statistic: string): Feed => {
    const withPeriod: number = +period || DEFAULT_PERIOD;
    const withStatistic: boolean = !!statistic;
    return feeder.subscribeFeedDataFor(uuid, url, withPeriod, withStatistic);
};

export const unsubscribeFeedFor = (uuid: string, url: string): void => {
    return feeder.unsubscribeFeedFor(uuid, url);
}

