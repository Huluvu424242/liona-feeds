import {FeedMetadata} from "./cleaner";

export interface StatisticData {
    url: string;
    countRequested: number;
    countConnected: number;
    countResponsOK: number;
}

export class Statistic {

    protected feedMap: Map<string, FeedMetadata>;
    protected statisticMap: Map<string, StatisticData>;

    public constructor(feedMap: Map<string, FeedMetadata>) {
        this.feedMap = feedMap;
        this.statisticMap = new Map();
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
        statisticData.countResponsOK++;
    }

    protected getStatisticData(key: string): StatisticData {
        if (!this.statisticMap.has(key)) {
            const feedMetadata: FeedMetadata = this.feedMap.get(key) as FeedMetadata;
            const url = feedMetadata?.url;

            this.statisticMap.set(key, {
                url: url,
                countRequested: 0,
                countConnected: 0,
                countResponsOK: 0
            });
        }
        return this.statisticMap.get(key) as StatisticData;
    }

}
