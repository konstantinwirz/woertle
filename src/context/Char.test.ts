import {char} from "./Char";


describe("Char", () => {
    test("can be created from allowed characters", () => {
        Array.of("a", "b", "z", "Z", "m", "Ö", "ü", "Ä",).forEach((expected) => {
            const result = char(expected);
            expect(result.isOk()).toBeTruthy();
            expect(result.map(({value}) => value)._unsafeUnwrap()).toEqual(expected.toUpperCase());
        });
    });

    test("should throw an error for not accepted characters and strings that are longer than 1", () => {
        Array.of("ab", "_", "/").forEach((expected) => {
            const result = char(expected);
            expect(result.isErr()).toBeTruthy();
            expect(result._unsafeUnwrapErr()).toMatchObject(new Error(`not allowed character: '${expected}'`));
        });
    });
});