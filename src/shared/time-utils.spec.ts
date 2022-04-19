import {describe} from "mocha";
import {TimeUtils} from "./time-utils";
import {expect} from "chai";

describe('Time Utils:', () => {

    it('now liefert in etwa die aktuelle Zeit von Date.now()',()=>{
       const now = new TimeUtils().now();
       const jetzt = Date.now();
       expect(jetzt-now).to.be.eq(0);
    });


});