import {Cleaner} from "./cleaner";
import {spy} from "sinon";
import {describe, it} from 'mocha';
import {expect, should, use} from 'chai';
import {FeedMetadata} from "./metadata";
import {getPropertyValue} from "../shared/test-utils";
import {Subscription} from "rxjs";

const sinonChai = require("sinon-chai");
should();
use(sinonChai);

describe('LogService', () => {

    const logSpy = spy(console, 'log');


    beforeEach('deaktiviere Logging', () => {
        logSpy.resetHistory();

    })

    after('Reset: Mock and Spy', () => {

        // restore the original function
        logSpy.restore();

    });

    const feedMapFake = new Map<string, FeedMetadata>();
    let cleaner: Cleaner;


    describe('Gültige Benutzung', () => {

        beforeEach('erzeuge cleaner Instanz', () => {
            cleaner = new Cleaner(feedMapFake);
        });

        it('Initialisierung erzeugt eine Subscription auf den CleanJobStream.', () => {
            expect(cleaner["subscription"]).to.be.ok;
            expect(getPropertyValue(cleaner,"subscription")).not.to.be.null;
            expect(getPropertyValue(cleaner,"subscription")).not.to.be.undefined;
        });

    })


});