import Game from "../src/server/gameflow/Game";
import Player from "../src/server/gameflow/Player";
import Move from "../src/server/gameflow/Move";
import TestUtils from "../utils/TestUtils";
import Ship from "../src/server/gameflow/Ship";
import Layout from "../src/server/gameflow/Layout";

const utils = new TestUtils();
TestUtils.silenceLog();

beforeAll(async () => {
	await utils.setup();
});

afterAll(async () => {
	await utils.tearDown();
});

describe("Validate basic back and forth game", () => {
	const p1 = new Player("one", utils.getSocket("one"));
	const p2 = new Player("two", utils.getSocket("two"));

	const game = new Game(p1.id, p1.socket, Game.TYPE.BASIC);

	it("Reject Player 1 from making a move until game has started", () => {
		const move = JSON.stringify({ type: Move.TYPE.SOLO, c: 0, r: 0 });
		const resp = game.makeMove(p1.id, move);
		expect(resp).toEqual(
			new Game.Response(false, Game.ResponseHeader.GAME_NOT_STARTED),
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
		const pos0 = new Layout.Position(0, 0, Layout.TYPE.PATROL);
		const pos1 = new Layout.Position(0, 1, Layout.TYPE.PATROL);
		const pos2 = new Layout.Position(1, 0, Layout.TYPE.DESTROYER);
		const pos3 = new Layout.Position(1, 2, Layout.TYPE.DESTROYER);
		const list = [pos2, pos1, pos0, pos3];
		const str = JSON.stringify(list);
		const resp = game.positionShips(p1.id, str);
		expect(resp).toEqual(
			new Game.Response(true, Game.ResponseHeader.SHIP_POSITIONED),
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
		const pos0 = new Layout.Position(0, 0, Layout.TYPE.PATROL);
		const pos1 = new Layout.Position(0, 1, Layout.TYPE.PATROL);
		const pos2 = new Layout.Position(1, 0, Layout.TYPE.DESTROYER);
		const pos3 = new Layout.Position(1, 2, Layout.TYPE.DESTROYER);
		const list = [pos2, pos1, pos0, pos3];
		const str = JSON.stringify(list);
		const resp = game.positionShips(p2.id, str);
		expect(resp).toEqual(
			new Game.Response(
				true,
				Game.ResponseHeader.SHIP_POSITIONED,
				Game.ResponseHeader.GAME_STARTED,
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
		const move = JSON.stringify({
			type: Move.TYPE.SOLO,
			c: 0,
			r: 0,
			at: p2.id,
		});
		const resp = game.makeMove(p1.id, move);
		expect(resp).toEqual(new Game.Response(true, Game.ResponseHeader.HIT));
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
		const move = JSON.stringify({
			type: Move.TYPE.SOLO,
			c: 0,
			r: 0,
			at: p1.id,
		});
		const resp = game.makeMove(p2.id, move);
		expect(resp).toEqual(new Game.Response(true, Game.ResponseHeader.HIT));
	});

	it("Reject Player 1 from repeating same move", () => {
		const move = JSON.stringify({
			type: Move.TYPE.SOLO,
			c: 0,
			r: 0,
			at: p2.id,
		});
		const resp = game.makeMove(p1.id, move);
		expect(resp).toEqual(
			new Game.Response(false, Game.ResponseHeader.MOVE_REPEATED),
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
		const move = JSON.stringify({
			type: Move.TYPE.SOLO,
			c: 0,
			r: 1,
			at: p2.id,
		});
		const resp = game.makeMove(p1.id, move);
		expect(resp).toEqual(
			new Game.Response(
				true,
				Game.ResponseHeader.SUNK,
				Ship.DESCRIPTOR.PATROL,
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
		const move = JSON.stringify({
			type: Move.TYPE.SOLO,
			c: 1,
			r: 0,
			at: p1.id,
		});
		const resp = game.makeMove(p2.id, move);
		expect(resp).toEqual(new Game.Response(true, Game.ResponseHeader.HIT));
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
		const move = JSON.stringify({
			type: Move.TYPE.SOLO,
			c: 1,
			r: 0,
			at: p2.id,
		});
		const resp = game.makeMove(p1.id, move);
		expect(resp).toEqual(new Game.Response(true, Game.ResponseHeader.HIT));
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
		const move = JSON.stringify({
			type: Move.TYPE.SOLO,
			c: 2,
			r: 0,
			at: p1.id,
		});
		const resp = game.makeMove(p2.id, move);
		expect(resp).toEqual(new Game.Response(true, Game.ResponseHeader.MISS));
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
		const move = JSON.stringify({
			type: Move.TYPE.SOLO,
			c: 1,
			r: 1,
			at: p2.id,
		});
		const resp = game.makeMove(p1.id, move);
		expect(resp).toEqual(new Game.Response(true, Game.ResponseHeader.HIT));
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
		const move = JSON.stringify({
			type: Move.TYPE.SOLO,
			c: 1,
			r: 2,
			at: p1.id,
		});
		const resp = game.makeMove(p2.id, move);
		expect(resp).toEqual(new Game.Response(true, Game.ResponseHeader.HIT));
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
		const move = JSON.stringify({
			type: Move.TYPE.SOLO,
			c: 1,
			r: 2,
			at: p2.id,
		});
		const resp = game.makeMove(p1.id, move);
		expect(resp).toEqual(
			new Game.Response(
				true,
				Game.ResponseHeader.GAME_OVER,
				Ship.DESCRIPTOR.DESTROYER,
			),
		);
	});
});
