import {describe} from "mocha";
import {expect} from "chai";
import {getPropertyValue, setPropertyValue} from "./test-utils";

class TestClass {
    private name: string = "noname";
}

describe('Test Utils:', () => {

    let testClass: TestClass;

    beforeEach('erzeuge Testobject', () => {
        testClass = new TestClass();
    })

    it('getPropertyValue gibt den korrekten Wert zurück', () => {
        const name: string = getPropertyValue(testClass, 'name');
        expect(name).to.be.eq('noname');
    });

    it('setPropertyValue setzt den korrekten Wert', () => {
        const originalName: string = getPropertyValue(testClass, 'name');
        setPropertyValue(testClass, 'name', "Hubert");
        const newName: string = getPropertyValue(testClass, 'name');
        expect(newName).to.be.eq('Hubert');
        expect(originalName).not.to.be.eq(newName);
    });


});