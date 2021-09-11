import { Game, GAME_TYPE, Response, ResponseHeader } from "../../src/models/gameplay/Game";
import Player from "../../src/models/gameplay/Player";
import { Move, MOVE_TYPE } from "../../src/models/gameplay/Move";
import { Position, LAYOUT_TYPE } from "../../src/models/gameplay/Layout";

describe("Validate classic back and forth game", () => {
	const p1 = new Player("one");
	const p2 = new Player("two");

	const game = new Game(p1.id, GAME_TYPE.CLASSIC);
	game.add(p1);

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
			new Position(1, 5, LAYOUT_TYPE.PATROL),
			new Position(1, 6, LAYOUT_TYPE.PATROL),
		);
		list.push(
			//BATTLESHIP
			new Position(4, 7, LAYOUT_TYPE.BATTLESHIP),
			new Position(4, 4, LAYOUT_TYPE.BATTLESHIP),
		);
		list.push(
			//CARRIER
			new Position(3, 4, LAYOUT_TYPE.CARRIER),
			new Position(3, 0, LAYOUT_TYPE.CARRIER),
		);
		list.push(
			//DESTROYER
			new Position(4, 3, LAYOUT_TYPE.DESTROYER),
			new Position(6, 3, LAYOUT_TYPE.DESTROYER),
		);
		list.push(
			//SUBMARINE
			new Position(0, 1, LAYOUT_TYPE.SUBMARINE),
			new Position(2, 1, LAYOUT_TYPE.SUBMARINE),
		);
		const resp = game.positionShips(p1.id, list);
		expect(resp).toEqual(
			new Response(true, ResponseHeader.SHIP_POSITIONED),
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
			new Position(4, 6, LAYOUT_TYPE.PATROL),
			new Position(4, 5, LAYOUT_TYPE.PATROL),
		);
		list.push(
			//BATTLESHIP
			new Position(0, 5, LAYOUT_TYPE.BATTLESHIP),
			new Position(3, 5, LAYOUT_TYPE.BATTLESHIP),
		);
		list.push(
			//CARRIER
			new Position(0, 0, LAYOUT_TYPE.CARRIER),
			new Position(0, 4, LAYOUT_TYPE.CARRIER),
		);
		list.push(
			//DESTROYER
			new Position(3, 3, LAYOUT_TYPE.DESTROYER),
			new Position(3, 1, LAYOUT_TYPE.DESTROYER),
		);
		list.push(
			//SUBMARINE
			new Position(4, 3, LAYOUT_TYPE.SUBMARINE),
			new Position(6, 3, LAYOUT_TYPE.SUBMARINE),
		);
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
		const move_obj = {
			type: MOVE_TYPE.SOLO,
			c: 3,
			r: 5,
			to: p2.id,
		};
		const move = new Move(move_obj);
		const resp = game.makeMove(p1.id, move);
		expect(resp).toEqual(new Response(true, ResponseHeader.HIT));
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
		const move_obj = {
			type: MOVE_TYPE.SOLO,
			c: 3,
			r: 5,
			to: p1.id,
		};
		const move = new Move(move_obj);
		const resp = game.makeMove(p2.id, move);
		expect(resp).toEqual(new Response(true, ResponseHeader.MISS));
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
		const move_obj = {
			type: MOVE_TYPE.SOLO,
			c: 4,
			r: 5,
			to: obj.them.id,
		};
		const move = new Move(move_obj);
		const resp = game.makeMove(obj.me.id, move);
		expect(resp).toEqual(new Response(true, ResponseHeader.HIT));
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
		const move_obj = {
			type: MOVE_TYPE.SOLO,
			c: 4,
			r: 5,
			to: obj.them.id,
		};
		const move = new Move(move_obj);
		const resp = game.makeMove(obj.me.id, move);
		expect(resp).toEqual(new Response(true, ResponseHeader.HIT));
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
		const move_obj = {
			type: MOVE_TYPE.SOLO,
			c: 2,
			r: 5,
			to: obj.them.id,
		};
		const move = new Move(move_obj);
		const resp = game.makeMove(obj.me.id, move);
		expect(resp).toEqual(new Response(true, ResponseHeader.HIT));
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
		const move_obj = {
			type: MOVE_TYPE.SOLO,
			c: 2,
			r: 5,
			to: obj.them.id,
		};
		const move = new Move(move_obj);
		const resp = game.makeMove(obj.me.id, move);
		expect(resp).toEqual(new Response(true, ResponseHeader.MISS));
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
		const move_obj = {
			type: MOVE_TYPE.SOLO,
			c: 1,
			r: 5,
			to: obj.them.id,
		};
		const move = new Move(move_obj);
		const resp = game.makeMove(obj.me.id, move);
		expect(resp).toEqual(new Response(true, ResponseHeader.HIT));
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
		const move_obj = {
			type: MOVE_TYPE.SOLO,
			c: 1,
			r: 5,
			to: obj.them.id,
		};
		const move = new Move(move_obj);
		const resp = game.makeMove(obj.me.id, move);
		expect(resp).toEqual(new Response(true, ResponseHeader.HIT));
	});
});
