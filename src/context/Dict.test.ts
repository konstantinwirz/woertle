import {germanDict} from "./Dict";


describe("germanDict", () => {
    test("should contain german nouns", () => {
        ["Stuhl", "Tisch", "Stute"].forEach(noun => {
            expect(germanDict(noun)).toBeTruthy();
        })
    });

    test("should not contain made-up words", () => {
        ["abcde", "babze", "figle"].forEach(noun => {
            expect(germanDict(noun)).toBeFalsy();
        })
    })
})
