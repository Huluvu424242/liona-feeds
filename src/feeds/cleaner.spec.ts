import {describe, it} from "mocha";
import {TestScheduler} from "rxjs/testing";
import {interval, take} from "rxjs";
import {expect} from "chai";

describe('Cleaner', () => {

    let testScheduler: TestScheduler;


    beforeEach('Erstelle TestSheduler', () => {
        testScheduler = new TestScheduler((actual, expected) => {
            expect(actual).to.be.deep.eq(expected);
        });
    });

    it('Generiere 5 Feeds', () => {
        testScheduler.run(({expectObservable}) => {
            const expectedMarble = '1s a 999ms b 999ms c 999ms d 999ms (e|)';
            const exprectedValues = {a: 0, b: 1, c: 2, d: 3, e: 4};
            const source$ = interval(1000).pipe(take(5));
            expectObservable(source$).toBe(expectedMarble, exprectedValues);
        });
    });
});