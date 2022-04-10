import {logService} from "./log-service";
import {spy} from "sinon";
import 'mocha';
import {expect, should, use} from 'chai';

const sinonChai = require("sinon-chai");
should();
use(sinonChai);

describe('Hello function', () => {

    it('should return hello world', () => {

        let mySpy = spy(console, 'log');

        logService.logMessage("hallo");

        expect(mySpy.calledWith("hallo")).to.be.ok;

        // restore the original function
        mySpy.restore();

    });

});