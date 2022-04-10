import {logService} from "./log-service";
import {spy} from "sinon";
import {afterEach, describe, it} from 'mocha';
import {expect, should, use} from 'chai';

const sinonChai = require("sinon-chai");
should();
use(sinonChai);

describe('LogService', () => {

    const logSpy = spy(console, 'log');
    const infoSpy = spy(console, 'info');
    const warningSpy = spy(console, 'warn');
    const errorSpy = spy(console, 'error');
    const debugSpy = spy(console, 'debug');

    afterEach('Reset: Mock and Spy', () => {

        // restore the original function
        logSpy.restore();
        infoSpy.restore();
        warningSpy.restore();
        errorSpy.restore();
        debugSpy.restore();
    });


    describe('Aktives Logging',()=>{

        beforeEach('aktiviere Logging',()=>{
            logService.enableLogging();
        });

        it('logMessage logt über console.log', () => {
            const testParameter = {"error": 3};

            logService.logMessage("hallo", testParameter);

            expect(logSpy.calledWithExactly("hallo", testParameter)).to.be.ok;
        });
    })

    describe('Deaktiviertes Logging',()=>{

        beforeEach('deaktiviere Logging',()=>{
            logService.disableLogging();
        })



        it('logMessage logt über console.log', () => {
            const testParameter = {"error": 3};

            logService.logMessage("hallo", testParameter);

            expect(logSpy.calledWithExactly("hallo", testParameter)).to.be.ok;
        });

    })




});