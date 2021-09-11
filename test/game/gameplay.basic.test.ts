import { Game, GAME_TYPE, Response, ResponseHeader } from "../../src/models/gameplay/Game";
import Player from "../../src/models/gameplay/Player";
import { Move, MOVE_TYPE } from "../../src/models/gameplay/Move";
import { SHIP_DESCRIPTOR } from "../../src/models/gameplay/Ship";
import { Position, LAYOUT_TYPE } from "../../src/models/gameplay/Layout";

describe("Validate basic back and forth game", () => {
	const p1 = new Player("one");
	const p2 = new Player("two");

	const game = new Game(p1.id, GAME_TYPE.BASIC);
	game.add(p1);

	it("Reject Player 1 from making a move until game has started", () => {
		const move_obj = { type: MOVE_TYPE.SOLO, c: 0, r: 0 };
		const move = new Move(move_obj);
		const resp = game.makeMove(p1.id, move);
		expect(resp).toEqual(
			new Response(false, ResponseHeader.GAME_NOT_STARTED),
		);
	});

	it("Allows Player2 to join game", () => {
		const resp = game.add(p2);
		expect(resp).toEqual(true);
	});

	it("Reject Player2 from join game twice", () => {
		const resp = game.add(p2);
		expect(resp).toEqual(false);
	});

	/**
	 * 0|P|D| | | | | | |
	 * 1|P|D| | | | | | |
	 * 2| |D| | | | | | |
	 * 3| | | | | | | | |
	 * 4| | | | | | | | |
	 * 5| | | | | | | | |
	 * 6| | | | | | | | |
	 * 7| | | | | | | | |
	 *  |0|1|2|3|4|5|6|7|
	 */
	it("Allow Player 1 to position ships vertical", () => {
		const pos0 = new Position(0, 0, LAYOUT_TYPE.PATROL);
		const pos1 = new Position(0, 1, LAYOUT_TYPE.PATROL);
		const pos2 = new Position(1, 0, LAYOUT_TYPE.DESTROYER);
		const pos3 = new Position(1, 2, LAYOUT_TYPE.DESTROYER);
		const list = [pos2, pos1, pos0, pos3];
		const resp = game.positionShips(p1.id, list);
		expect(resp).toEqual(
			new Response(true, ResponseHeader.SHIP_POSITIONED),
		);
	});

	/**
	 * 0|P|D| | | | | | |
	 * 1|P|D| | | | | | |
	 * 2| |D| | | | | | |
	 * 3| | | | | | | | |
	 * 4| | | | | | | | |
	 * 5| | | | | | | | |
	 * 6| | | | | | | | |
	 * 7| | | | | | | | |
	 *  |0|1|2|3|4|5|6|7|
	 */
	it("Allow Player 2 to position ships vertical", () => {
		const pos0 = new Position(0, 0, LAYOUT_TYPE.PATROL);
		const pos1 = new Position(0, 1, LAYOUT_TYPE.PATROL);
		const pos2 = new Position(1, 0, LAYOUT_TYPE.DESTROYER);
		const pos3 = new Position(1, 2, LAYOUT_TYPE.DESTROYER);
		const list = [pos2, pos1, pos0, pos3];
		const resp = game.positionShips(p2.id, list);
		expect(resp).toEqual(
			new Response(
				true,
				ResponseHeader.SHIP_POSITIONED,
				ResponseHeader.GAME_STARTED,
			),
		);
	});

	/**     Player1				   Player 2
	 * 0|P|D| | | | | | |	 * 0|H|D| | | | | | |
	 * 1|P|D| | | | | | |	 * 1|P|D| | | | | | |
	 * 2| |D| | | | | | |	 * 2| |D| | | | | | |
	 * 3| | | | | | | | |	 * 3| | | | | | | | |
	 * 4| | | | | | | | |	 * 4| | | | | | | | |
	 * 5| | | | | | | | |	 * 5| | | | | | | | |
	 * 6| | | | | | | | |	 * 6| | | | | | | | |
	 * 7| | | | | | | | |	 * 7| | | | | | | | |
	 *  |0|1|2|3|4|5|6|7|	 *  |0|1|2|3|4|5|6|7|
	 */
	it("Allow Player 1 to make a move", () => {
		const move_obj = {
			type: MOVE_TYPE.SOLO,
			c: 0,
			r: 0,
			to: p2.id,
		};
		const move = new Move(move_obj);
		const resp = game.makeMove(p1.id, move);
		expect(resp).toEqual(new Response(true, ResponseHeader.HIT));
	});

	/**     Player1				   Player 2
	 * 0|H|D| | | | | | |	 * 0|H|D| | | | | | |
	 * 1|P|D| | | | | | |	 * 1|P|D| | | | | | |
	 * 2| |D| | | | | | |	 * 2| |D| | | | | | |
	 * 3| | | | | | | | |	 * 3| | | | | | | | |
	 * 4| | | | | | | | |	 * 4| | | | | | | | |
	 * 5| | | | | | | | |	 * 5| | | | | | | | |
	 * 6| | | | | | | | |	 * 6| | | | | | | | |
	 * 7| | | | | | | | |	 * 7| | | | | | | | |
	 *  |0|1|2|3|4|5|6|7|	 *  |0|1|2|3|4|5|6|7|
	 */
	it("Allow Player 2 to make a move", () => {
		const move_obj = {
			type: MOVE_TYPE.SOLO,
			c: 0,
			r: 0,
			to: p1.id,
		};
		const move = new Move(move_obj);
		const resp = game.makeMove(p2.id, move);
		expect(resp).toEqual(new Response(true, ResponseHeader.HIT));
	});

	it("Reject Player 1 from repeating same move", () => {
		const move_obj = {
			type: MOVE_TYPE.SOLO,
			c: 0,
			r: 0,
			to: p2.id,
		};
		const move = new Move(move_obj);
		const resp = game.makeMove(p1.id, move);
		expect(resp).toEqual(
			new Response(false, ResponseHeader.MOVE_REPEATED),
		);
	});


	/**     Player1				   Player 2
	 * 0|H|D| | | | | | |	 * 0|H|D| | | | | | |
	 * 1|P|D| | | | | | |	 * 1|H|D| | | | | | |
	 * 2| |D| | | | | | |	 * 2| |D| | | | | | |
	 * 3| | | | | | | | |	 * 3| | | | | | | | |
	 * 4| | | | | | | | |	 * 4| | | | | | | | |
	 * 5| | | | | | | | |	 * 5| | | | | | | | |
	 * 6| | | | | | | | |	 * 6| | | | | | | | |
	 * 7| | | | | | | | |	 * 7| | | | | | | | |
	 *  |0|1|2|3|4|5|6|7|	 *  |0|1|2|3|4|5|6|7|
	 */
	it("Allow Player 1 to Sink the Patrol Boat", () => {
		const move_obj = {
			type: MOVE_TYPE.SOLO,
			c: 0,
			r: 1,
			to: p2.id,
		};
		const move = new Move(move_obj);
		const resp = game.makeMove(p1.id, move);
		expect(resp).toEqual(
			new Response(
				true,
				ResponseHeader.SUNK,
				SHIP_DESCRIPTOR.PATROL,
			),
		);
	});

	/**     Player1				   Player 2
	 * 0|H|H| | | | | | |	 * 0|H|D| | | | | | |
	 * 1|P|D| | | | | | |	 * 1|H|D| | | | | | |
	 * 2| |D| | | | | | |	 * 2| |D| | | | | | |
	 * 3| | | | | | | | |	 * 3| | | | | | | | |
	 * 4| | | | | | | | |	 * 4| | | | | | | | |
	 * 5| | | | | | | | |	 * 5| | | | | | | | |
	 * 6| | | | | | | | |	 * 6| | | | | | | | |
	 * 7| | | | | | | | |	 * 7| | | | | | | | |
	 *  |0|1|2|3|4|5|6|7|	 *  |0|1|2|3|4|5|6|7|
	 */
	it("Allow Player 2 to hit a Destroyer", () => {
		const move = {
			type: MOVE_TYPE.SOLO,
			c: 1,
			r: 0,
			at: p1.id,
		};
		const resp = game.makeMove(p2.id, move);
		expect(resp).toEqual(new Response(true, ResponseHeader.HIT));
	});

	/**     Player1				   Player 2
	 * 0|H|H| | | | | | |	 * 0|H|H| | | | | | |
	 * 1|P|D| | | | | | |	 * 1|H|D| | | | | | |
	 * 2| |D| | | | | | |	 * 2| |D| | | | | | |
	 * 3| | | | | | | | |	 * 3| | | | | | | | |
	 * 4| | | | | | | | |	 * 4| | | | | | | | |
	 * 5| | | | | | | | |	 * 5| | | | | | | | |
	 * 6| | | | | | | | |	 * 6| | | | | | | | |
	 * 7| | | | | | | | |	 * 7| | | | | | | | |
	 *  |0|1|2|3|4|5|6|7|	 *  |0|1|2|3|4|5|6|7|
	 */
	it("Allow Player 1 to hit the Destroyer", () => {
		const move = {
			type: MOVE_TYPE.SOLO,
			c: 1,
			r: 0,
			at: p2.id,
		};
		const resp = game.makeMove(p1.id, move);
		expect(resp).toEqual(new Response(true, ResponseHeader.HIT));
	});

	/**     Player1				   Player 2
	 * 0|H|H|M| | | | | |	 * 0|H|H| | | | | | |
	 * 1|P|D| | | | | | |	 * 1|H|D| | | | | | |
	 * 2| |D| | | | | | |	 * 2| |D| | | | | | |
	 * 3| | | | | | | | |	 * 3| | | | | | | | |
	 * 4| | | | | | | | |	 * 4| | | | | | | | |
	 * 5| | | | | | | | |	 * 5| | | | | | | | |
	 * 6| | | | | | | | |	 * 6| | | | | | | | |
	 * 7| | | | | | | | |	 * 7| | | | | | | | |
	 *  |0|1|2|3|4|5|6|7|	 *  |0|1|2|3|4|5|6|7|
	 */
	it("Allow Player 2 to miss", () => {
		const move = {
			type: MOVE_TYPE.SOLO,
			c: 2,
			r: 0,
			at: p1.id,
		};
		const resp = game.makeMove(p2.id, move);
		expect(resp).toEqual(new Response(true, ResponseHeader.MISS));
	});

	/**     Player1				   Player 2
	 * 0|H|H|M| | | | | |	 * 0|H|H| | | | | | |
	 * 1|P|D| | | | | | |	 * 1|H|H| | | | | | |
	 * 2| |D| | | | | | |	 * 2| |D| | | | | | |
	 * 3| | | | | | | | |	 * 3| | | | | | | | |
	 * 4| | | | | | | | |	 * 4| | | | | | | | |
	 * 5| | | | | | | | |	 * 5| | | | | | | | |
	 * 6| | | | | | | | |	 * 6| | | | | | | | |
	 * 7| | | | | | | | |	 * 7| | | | | | | | |
	 *  |0|1|2|3|4|5|6|7|	 *  |0|1|2|3|4|5|6|7|
	 */
	it("Allow Player 1 to hit the Destroyer 2nd time", () => {
		const move = {
			type: MOVE_TYPE.SOLO,
			c: 1,
			r: 1,
			at: p2.id,
		};
		const resp = game.makeMove(p1.id, move);
		expect(resp).toEqual(new Response(true, ResponseHeader.HIT));
	});

	/**     Player1				   Player 2
	 * 0|H|H|M| | | | | |	 * 0|H|H| | | | | | |
	 * 1|P|D| | | | | | |	 * 1|H|H| | | | | | |
	 * 2| |H| | | | | | |	 * 2| |D| | | | | | |
	 * 3| | | | | | | | |	 * 3| | | | | | | | |
	 * 4| | | | | | | | |	 * 4| | | | | | | | |
	 * 5| | | | | | | | |	 * 5| | | | | | | | |
	 * 6| | | | | | | | |	 * 6| | | | | | | | |
	 * 7| | | | | | | | |	 * 7| | | | | | | | |
	 *  |0|1|2|3|4|5|6|7|	 *  |0|1|2|3|4|5|6|7|
	 */
	it("Allow Player 2 to hit the Destroyer 2nd time", () => {
		const move = {
			type: MOVE_TYPE.SOLO,
			c: 1,
			r: 2,
			at: p1.id,
		};
		const resp = game.makeMove(p2.id, move);
		expect(resp).toEqual(new Response(true, ResponseHeader.HIT));
	});

	/**     Player1				   Player 2
	 * 0|H|H|M| | | | | |	 * 0|H|H| | | | | | |
	 * 1|P|D| | | | | | |	 * 1|H|H| | | | | | |
	 * 2| |H| | | | | | |	 * 2| |H| | | | | | |
	 * 3| | | | | | | | |	 * 3| | | | | | | | |
	 * 4| | | | | | | | |	 * 4| | | | | | | | |
	 * 5| | | | | | | | |	 * 5| | | | | | | | |
	 * 6| | | | | | | | |	 * 6| | | | | | | | |
	 * 7| | | | | | | | |	 * 7| | | | | | | | |
	 *  |0|1|2|3|4|5|6|7|	 *  |0|1|2|3|4|5|6|7|
	 */
	it("Allow Player 1 to hit and sink the Destroyer to win", () => {
		const move = {
			type: MOVE_TYPE.SOLO,
			c: 1,
			r: 2,
			at: p2.id,
		};
		const resp = game.makeMove(p1.id, move);
		expect(resp).toEqual(
			new Response(
				true,
				ResponseHeader.GAME_OVER,
				SHIP_DESCRIPTOR.DESTROYER,
			),
		);
	});
});
