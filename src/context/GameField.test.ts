import {CurrentWordNotInProgress, gameField, GameFieldState} from "./GameField";
import {emptyTile, TileState} from "./Tile";
import Dict from "./Dict";
import {char} from "./Char";
import {err, ok} from "neverthrow";


describe("GameField", () => {
    test("should have correct initial properties", () => {
        const solution = "word"
        const attempts = 2;

        const field = gameField(solution, attempts);
        expect(field.state).toEqual(GameFieldState.IN_PROGRESS)
        expect(field.rows).toEqual(attempts);
        expect(field.columns).toEqual(solution.length);
        expect(field.currentRow).toEqual(0);
        expect(field.currentColumn).toEqual(0);
        expect(field.tiles).toMatchObject([
            [emptyTile(), emptyTile(), emptyTile(), emptyTile()],
            [emptyTile(), emptyTile(), emptyTile(), emptyTile()],
        ])
    });

    test("should be able to insert characters, accept words and solve", () => {
        const solution = "abc"
        const attempts = 2;
        const acceptAnyWord: Dict = (noun: string) => noun.toUpperCase() === solution.toUpperCase();

        // first insert

        const initialField = gameField(solution, attempts, acceptAnyWord);

        const afterFirstInsert = initialField.insert({value: "A"});
        expect(afterFirstInsert.isOk()).toBeTruthy();
        let field = afterFirstInsert._unsafeUnwrap()
        expect(field.state).toEqual(GameFieldState.IN_PROGRESS);
        expect(field.rows).toEqual(attempts);
        expect(field.columns).toEqual(solution.length);
        expect(field.currentRow).toEqual(0);
        expect(field.currentColumn).toEqual(1);
        expect(field.tiles).toMatchObject([
            [{value: "A", state: TileState.UNKNOWN}, emptyTile(), emptyTile()],
            [emptyTile(), emptyTile(), emptyTile()]
        ])
        expect(field.currentWordDone()).toBeFalsy();
        expect(field.acceptCurrentWord().isErr()).toBeTruthy();

        // second insert

        const afterSecondInsert = afterFirstInsert.andThen(field => field.insert({value: "B"}))
        expect(afterSecondInsert.isOk()).toBeTruthy();
        field = afterSecondInsert._unsafeUnwrap()
        expect(field.state).toEqual(GameFieldState.IN_PROGRESS);
        expect(field.rows).toEqual(attempts);
        expect(field.columns).toEqual(solution.length);
        expect(field.currentRow).toEqual(0);
        expect(field.currentColumn).toEqual(2);
        expect(field.tiles).toMatchObject([
            [{value: "A", state: TileState.UNKNOWN}, {value: "B", state: TileState.UNKNOWN}, emptyTile()],
            [emptyTile(), emptyTile(), emptyTile()]
        ])
        expect(field.currentWordDone()).toBeFalsy();
        expect(field.acceptCurrentWord().isErr()).toBeTruthy();

        // third and last insert
        const afterLastInsert = char("C").andThen(ch => afterSecondInsert.andThen(field => field.insert(ch)));
        expect(afterLastInsert.isOk()).toBeTruthy();
        field = afterLastInsert._unsafeUnwrap()
        expect(field.state).toEqual(GameFieldState.IN_PROGRESS);
        expect(field.rows).toEqual(attempts);
        expect(field.columns).toEqual(solution.length);
        expect(field.currentRow).toEqual(0);
        expect(field.currentColumn).toEqual(3);
        expect(field.tiles).toMatchObject([
            [{value: "A", state: TileState.UNKNOWN}, {value: "B", state: TileState.UNKNOWN}, {
                value: "C",
                state: TileState.UNKNOWN
            }],
            [emptyTile(), emptyTile(), emptyTile()]
        ])
        expect(field.currentWordDone()).toBeTruthy();

        // accept current word
        const afterAccepted = afterLastInsert.andThen(field => field.acceptCurrentWord());
        expect(afterAccepted.isOk()).toBeTruthy();
        field = afterAccepted._unsafeUnwrap()
        expect(field.state).toEqual(GameFieldState.WON);
        expect(field.rows).toEqual(attempts);
        expect(field.columns).toEqual(solution.length);
        expect(field.currentRow).toEqual(1);
        expect(field.currentColumn).toEqual(0);
        expect(field.tiles).toMatchObject([
            [{value: "A", state: TileState.SOLVED}, {value: "B", state: TileState.SOLVED}, {
                value: "C",
                state: TileState.SOLVED
            }],
            [emptyTile(), emptyTile(), emptyTile()]
        ])
        expect(field.currentWordDone()).toBeFalsy();

        // accept should not be possible anymore
        expect(field.acceptCurrentWord().isErr()).toBeTruthy();
    });

    test("should be able to remove inserted characters", () => {
        const solution = "abc";
        const attempts = 1;

        const initialField = gameField(solution, attempts);

        // insert 3 characters
        const afterInserting = initialField.insert({value: "D"})
            .andThen(f => f.insert({value: "E"}))
            .andThen(f => f.insert({value: "F"}));

        expect(afterInserting.isOk()).toBeTruthy();
        expect(afterInserting.map(f => f.currentWordDone())).toEqual(ok(true));
        let field = afterInserting._unsafeUnwrap()
        expect(field.currentColumn).toEqual(3)
        expect(field.currentRow).toEqual(0)
        expect(field.tiles).toMatchObject(
            [
                [{value: "D", state: TileState.UNKNOWN}, {value: "E", state: TileState.UNKNOWN}, {
                    value: "F",
                    state: TileState.UNKNOWN
                }]
            ]
        )

        // now remove F
        const afterFirstRemove = afterInserting.andThen(f => f.remove());
        expect(afterFirstRemove.isOk()).toBeTruthy();
        field = afterFirstRemove._unsafeUnwrap();
        expect(field.currentColumn).toEqual(2)
        expect(field.currentRow).toEqual(0)
        expect(field.tiles).toMatchObject(
            [
                [{value: "D", state: TileState.UNKNOWN}, {value: "E", state: TileState.UNKNOWN}, emptyTile()]
            ]
        )

        // remove E
        const afterSecondRemove = afterFirstRemove.andThen(f => f.remove());
        expect(afterSecondRemove.isOk()).toBeTruthy();
        field = afterSecondRemove._unsafeUnwrap();
        expect(field.currentColumn).toEqual(1)
        expect(field.currentRow).toEqual(0)
        expect(field.tiles).toMatchObject(
            [
                [{value: "D", state: TileState.UNKNOWN}, emptyTile(), emptyTile()]
            ]
        )

        // remove D
        const afterThirdRemove = afterSecondRemove.andThen(f => f.remove());
        expect(afterThirdRemove.isOk()).toBeTruthy();
        field = afterThirdRemove._unsafeUnwrap();
        expect(field.currentColumn).toEqual(0)
        expect(field.currentRow).toEqual(0)
        expect(field.tiles).toMatchObject(
            [
                [emptyTile(), emptyTile(), emptyTile()]
            ]
        )

        // no further removes possible
        expect(afterThirdRemove.andThen(f => f.remove())).toEqual(err(new CurrentWordNotInProgress()))
    });
})
