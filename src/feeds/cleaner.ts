import {filter, from, Observable, Subscription, switchMap, timer} from "rxjs";
import {logService} from "../shared/log-service";
import {FeedMetadata} from "./metadata";


const JOB_PERIOD: number = 60000 * 30; // alle 30 Minuten
const TIMEOUT_DELTA: number = 60000 * 60; // alle 60 Minuten

export class Cleaner {

    protected feedMap: Map<string, FeedMetadata>;
    protected jobPeriod: number;
    protected timeoutDelta: number;
    protected subscription: Subscription;

    public constructor(feedMap: Map<string, FeedMetadata>, jobPeriod: number = JOB_PERIOD, timeoutDelta: number = TIMEOUT_DELTA) {
        this.feedMap = feedMap;
        this.jobPeriod = jobPeriod;
        this.timeoutDelta = timeoutDelta;
        this.subscription = this.feedKeysToRemove$().subscribe({
                next: (key: string) => this.removeAndCleanUpKey(key),
                error: (error: any) => logService.errorMessage(error),
                complete: () => logService.infoMessage("Subscription of cleanUpJob finished")
            }
        );
    }

    feedKeysToRemove$(): Observable<string> {
        return this.keylistOfFeeds$().pipe(
            filter(
                (key: string) => this.tooFewRequested(key)
            ),
        );
    }

    keylistOfFeeds$(): Observable<string> {
        return timer(0, this.jobPeriod).pipe(
            switchMap(
                () => from(this.feedMap.keys())
            ),
        );
    }

    tooFewRequested(key: string): boolean {
        const feedMetadata: FeedMetadata = this.feedMap.get(key) as FeedMetadata
        if (!feedMetadata) return true; // -> entfernen
        const current: number = Date.now();
        return (current - feedMetadata.lastRequested.getTime()) > this.timeoutDelta;
    }

    unsubscribeFeedInMetadata(key: string) {
        const feedMetadata: FeedMetadata = this.feedMap.get(key) as FeedMetadata;
        if (feedMetadata) {
            feedMetadata.subscription.unsubscribe();
            logService.debugMessage("Subscription für feed " + key + " beendet.");
        }
    }

    removeAndCleanUpKey(key: string) {
        this.unsubscribeFeedInMetadata(key);
        this.feedMap.delete(key);
        logService.debugMessage("Feed " + key + " aus Feedliste entfernt.");
    }
}
