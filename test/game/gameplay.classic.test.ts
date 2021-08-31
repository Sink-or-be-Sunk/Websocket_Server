import Game from "../../src/models/gameplay/Game";
import Player from "../../src/models/gameplay/Player";
import Move from "../../src/models/gameplay/Move";
import TestUtils from "../../testUtils/TestUtils";
import Layout from "../../src/models/gameplay/Layout";

const utils = new TestUtils();
TestUtils.silenceLog();

beforeAll(async () => {
	await utils.setup();
});

afterAll(async () => {
	await utils.tearDown();
});

describe("Validate classic back and forth game", () => {
	const p1 = new Player("one", utils.getSocket("one"));
	const p2 = new Player("two", utils.getSocket("two"));

	const game = new Game(p1.id, p1.socket, Game.TYPE.CLASSIC);

	it("Allows Player2 to join game", () => {
		const resp = game.add(p2);
		expect(resp).toEqual(true);
	});

	/**
	 * 0| | | |v| | | | |
	 * 1|h|h|h|v| | | | |
	 * 2| | | |v| | | | |
	 * 3| | | |v|h|h|h| |
	 * 4| | | |v|v| | | |
	 * 5| |v| | |v| | | |
	 * 6| |v| | |v| | | |
	 * 7| | | | |v| | | |
	 *  |0|1|2|3|4|5|6|7|
	 */
	it("Allow Player 1 to position ships", () => {
		const list = [];
		list.push(
			//PATROL
			new Layout.Position(1, 5, Layout.TYPE.PATROL),
			new Layout.Position(1, 6, Layout.TYPE.PATROL),
		);
		list.push(
			//BATTLESHIP
			new Layout.Position(4, 7, Layout.TYPE.BATTLESHIP),
			new Layout.Position(4, 4, Layout.TYPE.BATTLESHIP),
		);
		list.push(
			//CARRIER
			new Layout.Position(3, 4, Layout.TYPE.CARRIER),
			new Layout.Position(3, 0, Layout.TYPE.CARRIER),
		);
		list.push(
			//DESTROYER
			new Layout.Position(4, 3, Layout.TYPE.DESTROYER),
			new Layout.Position(6, 3, Layout.TYPE.DESTROYER),
		);
		list.push(
			//SUBMARINE
			new Layout.Position(0, 1, Layout.TYPE.SUBMARINE),
			new Layout.Position(2, 1, Layout.TYPE.SUBMARINE),
		);
		const str = JSON.stringify(list);
		const resp = game.positionShips(p1.id, str);
		expect(resp).toEqual(
			new Game.Response(true, Game.ResponseHeader.SHIP_POSITIONED),
		);
	});

	/**
	 * 0|v| | | | | | | |
	 * 1|v| | |v| | | | |
	 * 2|v| | |v| | | | |
	 * 3|v| | |v|h|h|h| |
	 * 4|v| | | | | | | |
	 * 5|h|h|h|h|v| | | |
	 * 6| | | | |v| | | |
	 * 7| | | | | | | | |
	 *  |0|1|2|3|4|5|6|7|
	 */
	it("Allow Player 2 to position ships", () => {
		const list = [];
		list.push(
			//PATROL
			new Layout.Position(4, 6, Layout.TYPE.PATROL),
			new Layout.Position(4, 5, Layout.TYPE.PATROL),
		);
		list.push(
			//BATTLESHIP
			new Layout.Position(0, 5, Layout.TYPE.BATTLESHIP),
			new Layout.Position(3, 5, Layout.TYPE.BATTLESHIP),
		);
		list.push(
			//CARRIER
			new Layout.Position(0, 0, Layout.TYPE.CARRIER),
			new Layout.Position(0, 4, Layout.TYPE.CARRIER),
		);
		list.push(
			//DESTROYER
			new Layout.Position(3, 3, Layout.TYPE.DESTROYER),
			new Layout.Position(3, 1, Layout.TYPE.DESTROYER),
		);
		list.push(
			//SUBMARINE
			new Layout.Position(4, 3, Layout.TYPE.SUBMARINE),
			new Layout.Position(6, 3, Layout.TYPE.SUBMARINE),
		);
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
	 * 0| | | |v| | | | |	 * 0|v| | | | | | | |
	 * 1|h|h|h|v| | | | |	 * 1|v| | |v| | | | |
	 * 2| | | |v| | | | |	 * 2|v| | |v| | | | |
	 * 3| | | |v|h|h|h| |	 * 3|v| | |v|h|h|h| |
	 * 4| | | |v|v| | | |	 * 4|v| | | | | | | |
	 * 5| |v| | |v| | | |	 * 5|h|h|h|H|v| | | |
	 * 6| |v| | |v| | | |	 * 6| | | | |v| | | |
	 * 7| | | | |v| | | |	 * 7| | | | | | | | |
	 *  |0|1|2|3|4|5|6|7|	 *  |0|1|2|3|4|5|6|7|
	 */
	it("Allow Player 1 to HIT battleship", () => {
		const move = JSON.stringify({
			type: Move.TYPE.SOLO,
			c: 3,
			r: 5,
			at: p2.id,
		});
		const resp = game.makeMove(p1.id, move);
		expect(resp).toEqual(new Game.Response(true, Game.ResponseHeader.HIT));
	});

	/**     Player1				   Player 2
	 * 0| | | |v| | | | |	 * 0|v| | | | | | | |
	 * 1|h|h|h|v| | | | |	 * 1|v| | |v| | | | |
	 * 2| | | |v| | | | |	 * 2|v| | |v| | | | |
	 * 3| | | |v|h|h|h| |	 * 3|v| | |v|h|h|h| |
	 * 4| | | |v|v| | | |	 * 4|v| | | | | | | |
	 * 5| |v| |M|v| | | |	 * 5|h|h|h|H|v| | | |
	 * 6| |v| | |v| | | |	 * 6| | | | |v| | | |
	 * 7| | | | |v| | | |	 * 7| | | | | | | | |
	 *  |0|1|2|3|4|5|6|7|	 *  |0|1|2|3|4|5|6|7|
	 */
	it("Allow Player 2 to MISS", () => {
		const move = JSON.stringify({
			type: Move.TYPE.SOLO,
			c: 3,
			r: 5,
			at: p1.id,
		});
		const resp = game.makeMove(p2.id, move);
		expect(resp).toEqual(new Game.Response(true, Game.ResponseHeader.MISS));
	});

	/**     Player1				   Player 2
	 * 0| | | |v| | | | |	 * 0|v| | | | | | | |
	 * 1|h|h|h|v| | | | |	 * 1|v| | |v| | | | |
	 * 2| | | |v| | | | |	 * 2|v| | |v| | | | |
	 * 3| | | |v|h|h|h| |	 * 3|v| | |v|h|h|h| |
	 * 4| | | |v|v| | | |	 * 4|v| | | | | | | |
	 * 5| |v| |M|v| | | |	 * 5|h|h|h|H|H| | | |
	 * 6| |v| | |v| | | |	 * 6| | | | |v| | | |
	 * 7| | | | |v| | | |	 * 7| | | | | | | | |
	 *  |0|1|2|3|4|5|6|7|	 *  |0|1|2|3|4|5|6|7|
	 */
	it("Allow Player 1 to HIT PT Boat", () => {
		const obj = { me: p1, them: p2 };
		const move = JSON.stringify({
			type: Move.TYPE.SOLO,
			c: 4,
			r: 5,
			at: obj.them.id,
		});
		const resp = game.makeMove(obj.me.id, move);
		expect(resp).toEqual(new Game.Response(true, Game.ResponseHeader.HIT));
	});

	/**     Player1				   Player 2
	 * 0| | | |v| | | | |	 * 0|v| | | | | | | |
	 * 1|h|h|h|v| | | | |	 * 1|v| | |v| | | | |
	 * 2| | | |v| | | | |	 * 2|v| | |v| | | | |
	 * 3| | | |v|h|h|h| |	 * 3|v| | |v|h|h|h| |
	 * 4| | | |v|v| | | |	 * 4|v| | | | | | | |
	 * 5| |v| |M|H| | | |	 * 5|h|h|h|H|H| | | |
	 * 6| |v| | |v| | | |	 * 6| | | | |v| | | |
	 * 7| | | | |v| | | |	 * 7| | | | | | | | |
	 *  |0|1|2|3|4|5|6|7|	 *  |0|1|2|3|4|5|6|7|
	 */
	it("Allow Player 2 to HIT Carrier", () => {
		const obj = { me: p2, them: p1 };
		const move = JSON.stringify({
			type: Move.TYPE.SOLO,
			c: 4,
			r: 5,
			at: obj.them.id,
		});
		const resp = game.makeMove(obj.me.id, move);
		expect(resp).toEqual(new Game.Response(true, Game.ResponseHeader.HIT));
	});

	/**     Player1				   Player 2
	 * 0| | | |v| | | | |	 * 0|v| | | | | | | |
	 * 1|h|h|h|v| | | | |	 * 1|v| | |v| | | | |
	 * 2| | | |v| | | | |	 * 2|v| | |v| | | | |
	 * 3| | | |v|h|h|h| |	 * 3|v| | |v|h|h|h| |
	 * 4| | | |v|v| | | |	 * 4|v| | | | | | | |
	 * 5| |v| |M|H| | | |	 * 5|h|h|H|H|H| | | |
	 * 6| |v| | |v| | | |	 * 6| | | | |v| | | |
	 * 7| | | | |v| | | |	 * 7| | | | | | | | |
	 *  |0|1|2|3|4|5|6|7|	 *  |0|1|2|3|4|5|6|7|
	 */
	it("Allow Player 1 to HIT Battleship", () => {
		const obj = { me: p1, them: p2 };
		const move = JSON.stringify({
			type: Move.TYPE.SOLO,
			c: 2,
			r: 5,
			at: obj.them.id,
		});
		const resp = game.makeMove(obj.me.id, move);
		expect(resp).toEqual(new Game.Response(true, Game.ResponseHeader.HIT));
	});

	/**     Player1				   Player 2
	 * 0| | | |v| | | | |	 * 0|v| | | | | | | |
	 * 1|h|h|h|v| | | | |	 * 1|v| | |v| | | | |
	 * 2| | | |v| | | | |	 * 2|v| | |v| | | | |
	 * 3| | | |v|h|h|h| |	 * 3|v| | |v|h|h|h| |
	 * 4| | | |v|v| | | |	 * 4|v| | | | | | | |
	 * 5| |v|M|M|H| | | |	 * 5|h|h|H|H|H| | | |
	 * 6| |v| | |v| | | |	 * 6| | | | |v| | | |
	 * 7| | | | |v| | | |	 * 7| | | | | | | | |
	 *  |0|1|2|3|4|5|6|7|	 *  |0|1|2|3|4|5|6|7|
	 */
	it("Allow Player 2 to Miss", () => {
		const obj = { me: p2, them: p1 };
		const move = JSON.stringify({
			type: Move.TYPE.SOLO,
			c: 2,
			r: 5,
			at: obj.them.id,
		});
		const resp = game.makeMove(obj.me.id, move);
		expect(resp).toEqual(new Game.Response(true, Game.ResponseHeader.MISS));
	});

	/**     Player1				   Player 2
	 * 0| | | |v| | | | |	 * 0|v| | | | | | | |
	 * 1|h|h|h|v| | | | |	 * 1|v| | |v| | | | |
	 * 2| | | |v| | | | |	 * 2|v| | |v| | | | |
	 * 3| | | |v|h|h|h| |	 * 3|v| | |v|h|h|h| |
	 * 4| | | |v|v| | | |	 * 4|v| | | | | | | |
	 * 5| |v|M|M|H| | | |	 * 5|h|H|H|H|H| | | |
	 * 6| |v| | |v| | | |	 * 6| | | | |v| | | |
	 * 7| | | | |v| | | |	 * 7| | | | | | | | |
	 *  |0|1|2|3|4|5|6|7|	 *  |0|1|2|3|4|5|6|7|
	 */
	it("Allow Player 1 to HIT Battleship", () => {
		const obj = { me: p1, them: p2 };
		const move = JSON.stringify({
			type: Move.TYPE.SOLO,
			c: 1,
			r: 5,
			at: obj.them.id,
		});
		const resp = game.makeMove(obj.me.id, move);
		expect(resp).toEqual(new Game.Response(true, Game.ResponseHeader.HIT));
	});

	/**     Player1				   Player 2
	 * 0| | | |v| | | | |	 * 0|v| | | | | | | |
	 * 1|h|h|h|v| | | | |	 * 1|v| | |v| | | | |
	 * 2| | | |v| | | | |	 * 2|v| | |v| | | | |
	 * 3| | | |v|h|h|h| |	 * 3|v| | |v|h|h|h| |
	 * 4| | | |v|v| | | |	 * 4|v| | | | | | | |
	 * 5| |H|M|M|H| | | |	 * 5|h|H|H|H|H| | | |
	 * 6| |v| | |v| | | |	 * 6| | | | |v| | | |
	 * 7| | | | |v| | | |	 * 7| | | | | | | | |
	 *  |0|1|2|3|4|5|6|7|	 *  |0|1|2|3|4|5|6|7|
	 */
	it("Allow Player 2 to HIT PT", () => {
		const obj = { me: p2, them: p1 };
		const move = JSON.stringify({
			type: Move.TYPE.SOLO,
			c: 1,
			r: 5,
			at: obj.them.id,
		});
		const resp = game.makeMove(obj.me.id, move);
		expect(resp).toEqual(new Game.Response(true, Game.ResponseHeader.HIT));
	});
});
