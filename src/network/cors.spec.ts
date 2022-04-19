import {describe} from "mocha";
import {addCORSHeader} from "./cors";
import {fake, spy} from "sinon";
import {expect} from "chai";

describe('CORS:',()=>{

    it('All headers are set correct',()=>{
        const getFake = fake.returns("localhost");
        const fakeRequest = {get: getFake};
        const fakeResponse={setHeader:spy()};
        const callbackSpy = spy();

        addCORSHeader(fakeRequest,fakeResponse,callbackSpy);
        expect(fakeResponse.setHeader.calledWith('Access-Control-Allow-Origin',"localhost")).to.be.true;
        expect(fakeResponse.setHeader.calledWith('Access-Control-Allow-Headers',"Origin, X-Requested-With, Content-Type, Accept")).to.be.true;
        expect(fakeResponse.setHeader.calledWith('Access-Control-Allow-Methods',"GET")).to.be.true;
        expect(fakeResponse.setHeader.callCount).to.be.eq(3);
        expect(callbackSpy.called).to.be.true;
    });

});