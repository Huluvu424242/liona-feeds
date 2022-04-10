import {Feed} from "feedme";
import {Subscription} from "rxjs";
import {Score} from "./ranking";

export interface FeedMetadata {
    lastRequested: Date; // contains time in typescript
    url: string;
    period: number;
    withStatistic: boolean;
    data: Feed;
    subscription: Subscription;
}


export interface StatisticData extends Score {
    url: string;
    countRequested: number;
    countContacted: number;
    countResponseOK: number;
}