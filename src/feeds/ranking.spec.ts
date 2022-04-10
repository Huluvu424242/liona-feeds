import {Ranking} from "./ranking";
import {describe, it} from 'mocha';
import {expect} from 'chai';

describe('Ranking', () => {

    describe('Gültige Vergleiche', () => {

        it('sortBestScore(A,B) mit A<B  ', () => {
            expect(Ranking.sortBestScore({score: 1}, {score: 2})).eq(1);
        });

        it('sortBestScore(A,B) mit A>B  ', () => {
            expect(Ranking.sortBestScore({score: 200}, {score: -1})).eq(-1);
        });

        it('sortBestScore(A,B) mit A=B  ', () => {
            expect(Ranking.sortBestScore({score: -1}, {score: -1})).eq(0);
        });

    })

    xdescribe('Ungültige Vergleiche', () => {

        // TODO welche mit korrekter Syntax finden
        // it('sortBestScore(A,B) mit A<B  ', () => {
        //     expect(Ranking.sortBestScore( {score: 2},null)).eq(1);
        // });

    })

});