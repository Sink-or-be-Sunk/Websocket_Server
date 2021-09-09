import { Game, GAME_TYPE, Response, ResponseHeader } from "../../src/models/gameplay/Game";
import Player from "../../src/models/gameplay/Player";
import { Position, LAYOUT_TYPE } from "../../src/models/gameplay/Layout";

describe("Validate basic back and forth game", () => {
	const p1 = new Player("one");
	const p2 = new Player("two");

	const game = new Game(p1.id, GAME_TYPE.BASIC);
	game.add(p1);

	it("Allows Player2 to join game", () => {
		const resp = game.add(p2);
		expect(resp).toEqual(true);
	});

	it("Allow Player 2 to change to Classic game type", () => {
		const resp = game.changeGameType(p1.id, GAME_TYPE.CLASSIC);
		expect(resp).toEqual(
			new Response(
				true,
				ResponseHeader.GAME_TYPE_CHANGED,
				GAME_TYPE.CLASSIC,
			),
		);
	});

	it("Allow Player 1 to change to Basic game type", () => {
		const resp = game.changeGameType(p1.id, GAME_TYPE.BASIC);
		expect(resp).toEqual(
			new Response(
				true,
				ResponseHeader.GAME_TYPE_CHANGED,
				GAME_TYPE.BASIC,
			),
		);
	});

	it("Allow Player 1 to position ships vertical basic ", () => {
		const pos0 = new Position(0, 0, LAYOUT_TYPE.PATROL);
		const pos1 = new Position(1, 0, LAYOUT_TYPE.PATROL);
		const pos2 = new Position(0, 1, LAYOUT_TYPE.DESTROYER);
		const pos3 = new Position(2, 1, LAYOUT_TYPE.DESTROYER);
		const list = [pos2, pos1, pos0, pos3];
		const resp = game.positionShips(p1.id, list);
		expect(resp).toEqual(
			new Response(true, ResponseHeader.SHIP_POSITIONED),
		);
	});

	it("Reject Player 1 from changing game type after ready up", () => {
		const resp = game.changeGameType(p1.id, GAME_TYPE.BASIC);
		expect(resp).toEqual(
			new Response(false, ResponseHeader.PLAYER_READY),
		);
	});

	it("Allow Player 2 to position ships horizontal basic", () => {
		const pos0 = new Position(0, 0, LAYOUT_TYPE.PATROL);
		const pos1 = new Position(1, 0, LAYOUT_TYPE.PATROL);
		const pos2 = new Position(0, 1, LAYOUT_TYPE.DESTROYER);
		const pos3 = new Position(2, 1, LAYOUT_TYPE.DESTROYER);
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

	it("Reject Player 1 from changing game type after game started", () => {
		const resp = game.changeGameType(p1.id, GAME_TYPE.BASIC);
		expect(resp).toEqual(
			new Response(false, ResponseHeader.GAME_IN_PROGRESS),
		);
	});
});
