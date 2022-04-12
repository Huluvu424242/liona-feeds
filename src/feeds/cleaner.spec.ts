import {describe, it} from "mocha";
import {TestScheduler} from "rxjs/testing";
import {expect} from "chai";
import {Cleaner} from "./cleaner";
import {FeedMetadata} from "./metadata";
import {of, Subscription, take} from "rxjs";
import {getPropertyValue} from "../shared/test-utils";
import {spy} from "sinon";
import {logService} from "../shared/log-service";

describe('Cleaner', () => {

    const metaData1: FeedMetadata = {
        url: "http://feed1.de",
    };
    const metaData2: FeedMetadata = {
        url: "http://feed1.de",
    };
    let feedMapFake: Map<string, FeedMetadata>;

    beforeEach('reset Mocks', () => {
        feedMapFake = new Map();
        expect(feedMapFake.size).to.be.eq(0);
    });

    describe('Mocked Unit Tests', () => {

        it('Cleaner Instanzen werdne korrekt initialisiert', () => {
            const cleaner: Cleaner = new Cleaner(feedMapFake);
            expect(getPropertyValue(cleaner, "feedMap")).to.be.deep.eq(feedMapFake);
            expect(getPropertyValue(cleaner, "jobPeriod")).to.be.eq(Cleaner.CLEANER_JOB_PERIOD);
            expect(getPropertyValue(cleaner, "timeoutDelta")).to.be.eq(Cleaner.CLEANER_TIMEOUT_DELTA);
            expect(getPropertyValue(cleaner, "cleanUpJobSubscription")).to.be.ok;
        })

        it('Subscribe of cleaner job works correct.', () => {
            const errorMessageSpy = spy(logService, 'errorMessage');
            const debugMessageSpy = spy(logService, 'debugMessage');
            const infoMessageSpy = spy(logService, 'infoMessage');

            const cleaner: Cleaner = new Cleaner(feedMapFake);
            cleaner.feedKeysToRemove$ = () => of("feed1", "feed2");

            const cleanUpJobSubscriptionBeforeSubscribe = getPropertyValue<Subscription>(cleaner, "cleanUpJobSubscription");
            expect(cleanUpJobSubscriptionBeforeSubscribe).to.be.ok;

            cleaner.subscribeCleanUpJob();

            const cleanUpJobSubscriptionAfterSubscribe = getPropertyValue<Subscription>(cleaner, "cleanUpJobSubscription");
            expect(cleanUpJobSubscriptionAfterSubscribe).to.be.ok;
            expect(cleanUpJobSubscriptionAfterSubscribe === cleanUpJobSubscriptionBeforeSubscribe).not.to.be.true;

            expect(errorMessageSpy.called).to.be.false;
            expect(debugMessageSpy.calledWithExactly("Feed feed1 aus Feedliste entfernt.")).to.be.true;
            expect(debugMessageSpy.calledWithExactly("Feed feed2 aus Feedliste entfernt.")).to.be.true;
            expect(infoMessageSpy.calledWithExactly("Subscription of cleanUpJob finished")).to.be.true;

            errorMessageSpy.restore();
            debugMessageSpy.restore();
            infoMessageSpy.restore();
        })

        it('Unsubscribe of cleaner job works correct.', () => {
            const cleaner: Cleaner = new Cleaner(feedMapFake);
            const cleanUpJobSubscription: Subscription = getPropertyValue(cleaner, "cleanUpJobSubscription");
            const subscriptionSpy = spy(cleanUpJobSubscription, "unsubscribe");

            expect(subscriptionSpy.called).not.to.be.true;

            cleaner.unsubscribeCleanUpJob();

            expect(subscriptionSpy.called).to.be.true;

            subscriptionSpy.restore();
        });

        it('tooFewRequested works correct with one value \< limit and one value \> limit', () => {
            metaData1.lastRequested = new Date(Date.now() - 10000);
            metaData2.lastRequested = new Date(Date.now() - 5000);
            feedMapFake.set("feed1", metaData1);
            feedMapFake.set("feed2", metaData2);
            const cleaner: Cleaner = new Cleaner(feedMapFake,0,6000);

            expect(cleaner.tooFewRequested("feed1")).to.be.true;
            expect(cleaner.tooFewRequested("feed2")).to.be.false;
        })

        it('tooFewRequested works correct with both values \< limit ', () => {
            metaData1.lastRequested = new Date(Date.now() - 5000);
            metaData2.lastRequested = new Date(Date.now() - 5000);
            feedMapFake.set("feed1", metaData1);
            feedMapFake.set("feed2", metaData2);
            const cleaner: Cleaner = new Cleaner(feedMapFake,0,6000);

            expect(cleaner.tooFewRequested("feed1")).to.be.false;
            expect(cleaner.tooFewRequested("feed2")).to.be.false;
        })

        it('tooFewRequested works correct with both values \> limit ', () => {
            metaData1.lastRequested = new Date(Date.now() - 10000);
            metaData2.lastRequested = new Date(Date.now() - 10000);
            feedMapFake.set("feed1", metaData1);
            feedMapFake.set("feed2", metaData2);
            const cleaner: Cleaner = new Cleaner(feedMapFake,0,6000);

            expect(cleaner.tooFewRequested("feed1")).to.be.true;
            expect(cleaner.tooFewRequested("feed2")).to.be.true;
        })


    });

    describe('Marble Tests', () => {

        let testScheduler: TestScheduler;

        beforeEach('Erstelle TestSheduler', () => {
            feedMapFake.set("feed1", metaData1);
            feedMapFake.set("feed2", metaData2);
            testScheduler = new TestScheduler((actual, expected) => {
                expect(actual).to.be.deep.eq(expected);
            });
        });

        it('Generiere längere Key Folgen als Zuordnungen in der Feed Map vorhanden sind, ohne vorher den Stream zu schließen ', () => {

            testScheduler.run(({expectObservable}) => {
                const cleaner: Cleaner = new Cleaner(feedMapFake, 1000, 10000);
                const expectedMarble = '(ab) 996ms (ab) 996ms (ab|)';
                const exprectedValues = {a: "feed1", b: "feed2"};
                const source$ = cleaner.keylistOfFeeds$().pipe(take(6));
                expectObservable(source$).toBe(expectedMarble, exprectedValues);
            });
        });

        // it('Generiere längere Key Folgen als Zuordnungen in der Feed Map vorhanden sind, ohne vorher den Stream zu schließen ', () => {
        //     const realNow = Date.now();
        //     const realNowDate = new Date(realNow);
        //     metaData1.lastRequested = new Date(realNow -10000);
        //     metaData2.lastRequested = new Date(realNow -5000);
        //     testScheduler.run(({expectObservable}) => {
        //         const cleaner: Cleaner = new Cleaner(feedMapFake, 7000, 6000);
        //         const expectedMarble = 'a 6999ms (ab) 6999ms (ab|)';
        //         const exprectedValues = {a: "feed1", b: "feed2"};
        //         const source$ = cleaner.feedKeysToRemove$().pipe(take(6));
        //         expectObservable(source$).toBe(expectedMarble, exprectedValues);
        //     });
        // });



    });
});