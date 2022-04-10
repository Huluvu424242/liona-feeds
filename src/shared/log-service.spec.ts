import {logService} from "./log-service";
import { expect } from 'chai';
import 'mocha';

describe('Hello function', () => {

    it('should return hello world', () => {
        expect(logService).to.equal('Hello world!');
    });

});