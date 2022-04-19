import {EMPTY, filter, from, Observable, Subscription, switchMap, timer} from "rxjs";
import {logService} from "../shared/log-service";
import {FeedMetadata} from "./metadata";

export class Cleaner {

    public static CLEANER_JOB_PERIOD: number = 60000 * 30; // alle 30 Minuten
    public static CLEANER_TIMEOUT_DELTA: number = 60000 * 60; // alle 60 Minuten

    protected feedMap: Map<string, FeedMetadata>;
    protected jobPeriod: number;
    /**
     * Zeitspanne ohne Anfragen, nach der der Feed aus der Liste entfernt wird
     * @protected
     */
    protected timeoutDelta: number;

    protected cleanUpJobSubscription: Subscription;

    /**
     * Erzeugt eine Cleaner Instanz
     * @param feedMap Zuordnung von FeedKey auf FeedMetadaten
     * @param jobPeriod Zeitintervall nach dem ein neuer Reinigungsdurchgang anläuft
     * @param timeoutDelta Zeitgrenze nach deren Überschreiten ein Feed ohne Anfragen im Zeitbereich entfernt wird.
     */
    public constructor(feedMap: Map<string, FeedMetadata>, jobPeriod: number = Cleaner.CLEANER_JOB_PERIOD, timeoutDelta: number = Cleaner.CLEANER_TIMEOUT_DELTA) {
        this.feedMap = feedMap;
        this.jobPeriod = jobPeriod;
        this.timeoutDelta = timeoutDelta;
        this.cleanUpJobSubscription = EMPTY.subscribe();
    }

    public subscribeCleanUpJob(): void {
        this.cleanUpJobSubscription = this.feedKeysToRemove$().subscribe({
                next: (key: string) => this.removeAndCleanUpKey(key),
                error: (error: any) => logService.errorMessage(error),
                complete: () => logService.infoMessage("Subscription of cleanUpJob finished")
            }
        );
    }

    public unsubscribeCleanUpJob(): void {
        this.cleanUpJobSubscription.unsubscribe();
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
        if (!feedMetadata.lastRequested) feedMetadata.lastRequested = new Date(current);
        logService.debugMessage("(current - feedMetadata.lastRequested.getTime()) > this.timeoutDelta");
        logService.debugMessage("      current: " + current + "\nlastRequested: " + feedMetadata.lastRequested.getTime() + "\n timeoutDelta: " + this.timeoutDelta + " delta: "+(current - feedMetadata.lastRequested.getTime()));
        return (current - feedMetadata.lastRequested.getTime()) > this.timeoutDelta;
    }

    unsubscribeFeedInMetadata(key: string) {
        const feedMetadata: FeedMetadata = this.feedMap.get(key) as FeedMetadata;
        if (feedMetadata) {
            feedMetadata.subscription?.unsubscribe();
            logService.debugMessage("Subscription für feed " + key + " beendet.");
        }
    }

    removeAndCleanUpKey(key: string) {
        this.unsubscribeFeedInMetadata(key);
        this.feedMap.delete(key);
        logService.debugMessage("Feed " + key + " aus Feedliste entfernt.");
    }
}
