import {LogService, logService} from "./log-service";
import {spy} from "sinon";
import {describe, it} from 'mocha';
import {expect, should, use} from 'chai';
import {log} from "util";

const sinonChai = require("sinon-chai");
should();
use(sinonChai);

describe('LogService', () => {

    const logSpy = spy(console, 'log');
    const infoSpy = spy(console, 'info');
    const warningSpy = spy(console, 'warn');
    const errorSpy = spy(console, 'error');
    const debugSpy = spy(console, 'debug');

    beforeEach('deaktiviere Logging', () => {
        logSpy.resetHistory();
        infoSpy.resetHistory();
        warningSpy.resetHistory();
        errorSpy.resetHistory();
        debugSpy.resetHistory();
    })

    after('Reset: Mock and Spy', () => {

        // restore the original function
        logSpy.restore();
        infoSpy.restore();
        warningSpy.restore();
        errorSpy.restore();
        debugSpy.restore();
    });

    describe('Aktives Logging', () => {

        beforeEach('aktiviere Logging', () => {
            LogService.enableLogging();
        });

        it('errorMessage logt über console.error', () => {
            const testParameter = {"error": 1};
            logService.errorMessage("ERROR", testParameter);
            expect(errorSpy.calledWithExactly("ERROR", testParameter)).to.be.ok;
            expect(warningSpy.called).to.be.false;
            expect(debugSpy.called).to.be.false;
            expect(infoSpy.called).to.be.false;
            expect(logSpy.called).to.be.false;
        });

        it('warnMessage logt über console.warn', () => {
            const testParameter = {"warning": 2};
            logService.warnMessage("WARNING", testParameter);
            expect(errorSpy.called).to.be.false;
            expect(warningSpy.calledWithExactly("WARNING", testParameter)).to.be.ok;
            expect(debugSpy.called).to.be.false;
            expect(infoSpy.called).to.be.false;
            expect(logSpy.called).to.be.false;
        });

        it('debugMessage logt über console.debug', () => {
            const testParameter = {"debug": 3};
            logService.debugMessage("DEBUG", testParameter);
            expect(errorSpy.called).to.be.false;
            expect(warningSpy.called).to.be.false;
            expect(debugSpy.calledWithExactly("DEBUG", testParameter)).to.be.ok;
            expect(infoSpy.called).to.be.false;
            expect(logSpy.called).to.be.false;
        });

        it('infoMessage logt über console.info', () => {
            const testParameter = {"info": 4};
            logService.infoMessage("INFO", testParameter);
            expect(errorSpy.called).to.be.false;
            expect(warningSpy.called).to.be.false;
            expect(debugSpy.called).to.be.false;
            expect(infoSpy.calledWithExactly("INFO", testParameter)).to.be.ok;
            expect(logSpy.called).to.be.false;
        });


        it('logMessage logt über console.log', () => {
            const testParameter = {"log": 5};
            logService.logMessage("LOG", testParameter);
            expect(errorSpy.called).to.be.false;
            expect(warningSpy.called).to.be.false;
            expect(debugSpy.called).to.be.false;
            expect(infoSpy.called).to.be.false;
            expect(logSpy.calledWithExactly("LOG", testParameter)).to.be.ok;
        });


    })

    describe('Deaktiviertes Logging', () => {

        const nichtsGeloggt: () => boolean = () => (errorSpy.called && warningSpy.called && debugSpy.called && infoSpy.called && logSpy.called);

        beforeEach('deaktiviere Logging', () => {
            LogService.disableLogging();
        })

        it('errorMessage logt nicht bei deaktivierten Logging', () => {
            const testParameter = {"error": 11};
            logService.errorMessage("ERROR", testParameter);
            expect(nichtsGeloggt()).to.be.false;
        });

        it('warnMessage logt nicht bei deaktivierten Logging', () => {
            const testParameter = {"warn": 12};
            logService.errorMessage("WARNING", testParameter);
            expect(nichtsGeloggt()).to.be.false;
        });

        it('debugMessage logt nicht bei deaktivierten Logging', () => {
            const testParameter = {"debug": 13};
            logService.errorMessage("DEBUG", testParameter);
            expect(nichtsGeloggt()).to.be.false;
        });

        it('infoMessage logt nicht bei deaktivierten Logging', () => {
            const testParameter = {"info": 14};
            logService.errorMessage("INFO", testParameter);
            expect(nichtsGeloggt()).to.be.false;
        });

        it('logMessage logt nicht bei deaktivierten Logging', () => {
            const testParameter = {"log": 15};
            logService.logMessage("LOG", testParameter);
            expect(nichtsGeloggt()).to.be.false;
        });


    })


});