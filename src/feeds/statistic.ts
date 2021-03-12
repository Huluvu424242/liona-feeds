import {FeedMetadata} from "./cleaner";
import {from, Observable} from "rxjs";
import {map, tap, toArray} from "rxjs/operators";
import {Ranking, Score} from "./ranking";

export interface StatisticData extends Score {
    url: string;
    countRequested: number;
    countConnected: number;
    countResponseOK: number;
}

export class Statistic {

    protected feedMap: Map<string, FeedMetadata>;
    protected statisticMap: Map<string, StatisticData>;

    public constructor(feedMap: Map<string, FeedMetadata>) {
        this.feedMap = feedMap;
        this.statisticMap = new Map();
    }

    public getStatistics(): Observable<StatisticData[]> {
        return from(this.statisticMap.values()).pipe(toArray());
    }

    public getRankedStatistics(): Observable<StatisticData[]> {
        return this.getStatistics()
            .pipe(
                tap(
                    (items: StatisticData[]) => {
                        items.forEach((item: StatisticData) => item.score = item.countRequested * (item.countConnected / item.countResponseOK));
                    }
                ),
                map((items: StatisticData[]) => items.sort(Ranking.sortBestScore))
            )
            ;
    }

    public feedWasRequested(key: string) {
        const statisticData: StatisticData = this.getStatisticData(key);
        statisticData.countRequested++;
    }

    public feedWasContacted(key: string) {
        const statisticData: StatisticData = this.getStatisticData(key);
        statisticData.countConnected++;
    }

    public feedResponseWasOK(key: string) {
        const statisticData: StatisticData = this.getStatisticData(key);
        statisticData.countResponseOK++;
    }

    protected getStatisticData(key: string): StatisticData {
        if (!this.statisticMap.has(key)) {
            const feedMetadata: FeedMetadata = this.feedMap.get(key) as FeedMetadata;
            const url = feedMetadata?.url;

            this.statisticMap.set(key, {
                url: url,
                countRequested: 0,
                countConnected: 0,
                countResponseOK: 0,
                score: 0
            });
        }
        return this.statisticMap.get(key) as StatisticData;
    }

}
