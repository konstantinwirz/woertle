import {err, ok, Result} from "neverthrow";


export interface Char {
    readonly value: string
}

export class NotAllowedCharacter extends Error {
    constructor(s: string) {
        super(`not allowed character: '${s}'`);
    }
}

const allowedCharsPattern = new RegExp('^[a-zA-ZäÄüÜöÖ]$')

export function char(s: string): Result<Char, NotAllowedCharacter> {
    if (allowedCharsPattern.test(s)) {
        return ok({value: s.toUpperCase()})
    }

    return err(new NotAllowedCharacter(s))
}
