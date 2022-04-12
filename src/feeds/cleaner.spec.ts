import {describe, it} from "mocha";
import {TestScheduler} from "rxjs/testing";
import {expect} from "chai";
import {Cleaner} from "./cleaner";
import {FeedMetadata} from "./metadata";
import {take} from "rxjs";

describe('Cleaner', () => {

    const metaData1: FeedMetadata = {
        url: "http://feed1.de",
        // lastRequested: new Date(Date.now() - 10000),
    };
    const metaData2: FeedMetadata = {
        url: "http://feed1.de",
        // lastRequested: new Date(Date.now() - 5000),
    };
    const feedMap: Map<string, FeedMetadata> = new Map();

    describe('Marble Tests', () => {

        let testScheduler: TestScheduler;

        beforeEach('Erstelle TestSheduler', () => {
            feedMap.set("feed1", metaData1);
            feedMap.set("feed2", metaData2);
            testScheduler = new TestScheduler((actual, expected) => {
                expect(actual).to.be.deep.eq(expected);
            });
        });

        it('Generiere längere Key Folgen als Zuordnungen in der Feed Map vorhanden sind, ohne vorher den Stream zu schließen ', () => {

            testScheduler.run(({expectObservable}) => {
                const cleaner: Cleaner = new Cleaner(feedMap, 1000, 10000);
                const expectedMarble = '(ab) 996ms (ab) 996ms (ab|)';
                const exprectedValues = {a: "feed1", b: "feed2"};
                const source$ = cleaner.keylistOfFeeds$().pipe(take(6));
                expectObservable(source$).toBe(expectedMarble, exprectedValues);
            });
        });
    });
});