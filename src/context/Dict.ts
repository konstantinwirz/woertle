import dict from './nouns.json';

/**
 * Dict returns true if given word does exist in the dictionary
 */
export default interface Dict {
    (word: string): boolean;
}

/**
 * German dictionary (for nouns of length = 5)
 */
export const germanDict: Dict = (word: string) => {
    for (const noun of dict.nouns) {
        if (noun.toUpperCase() === word.toUpperCase()) {
            return true;
        }
    }

    return false;
}

export function randomGermanNoun(): string {
    const nouns = dict.nouns;
    const randomIndex = Math.floor(Math.random() * nouns.length);
    return nouns[randomIndex];
}