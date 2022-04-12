import {describe, it} from "mocha";
import {TestScheduler} from "rxjs/testing";
import {expect} from "chai";
import {Cleaner} from "./cleaner";
import {FeedMetadata} from "./metadata";
import {take} from "rxjs";

describe('Cleaner', () => {

    describe('Marble Tests', () => {

        let testScheduler: TestScheduler;


        beforeEach('Erstelle TestSheduler', () => {
            testScheduler = new TestScheduler((actual, expected) => {
                expect(actual).to.be.deep.eq(expected);
            });
        });

        it('Generiere 5 Feeds', () => {
            const feedMap: Map<string, FeedMetadata> = new Map();
            const cleaner: Cleaner = new Cleaner(feedMap,1000,10000);

            testScheduler.run(({expectObservable}) => {
                const expectedMarble = '1s a 999ms b 999ms c 999ms d 999ms (e|)';
                const exprectedValues = {a: 0, b: 1, c: 2, d: 3, e: 4};
                const source$ = cleaner.keylistOfFeeds$().pipe(take(2));
                expectObservable(source$).toBe(expectedMarble, exprectedValues);
            });
        });
    });
});