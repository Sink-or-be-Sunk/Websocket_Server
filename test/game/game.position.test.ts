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

	it("Allow Player 1 to position ships vertical basic ", () => {
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

	it("Allow Player 1 to position ships horizontal basic", () => {
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

	it("Allow Player 1 to position ships horizontal medium", () => {
		const pos0 = new Position(0, 0, LAYOUT_TYPE.PATROL);
		const pos1 = new Position(1, 0, LAYOUT_TYPE.PATROL);
		const pos2 = new Position(3, 1, LAYOUT_TYPE.DESTROYER);
		const pos3 = new Position(5, 1, LAYOUT_TYPE.DESTROYER);
		const list = [pos2, pos1, pos0, pos3];
		const resp = game.positionShips(p1.id, list);
		expect(resp).toEqual(
			new Response(true, ResponseHeader.SHIP_POSITIONED),
		);
	});

	it("Allow Player 1 to position ships vertical medium", () => {
		const pos0 = new Position(0, 0, LAYOUT_TYPE.PATROL);
		const pos1 = new Position(0, 1, LAYOUT_TYPE.PATROL);
		const pos2 = new Position(1, 3, LAYOUT_TYPE.DESTROYER);
		const pos3 = new Position(1, 5, LAYOUT_TYPE.DESTROYER);
		const list = [pos2, pos1, pos0, pos3];
		const resp = game.positionShips(p1.id, list);
		expect(resp).toEqual(
			new Response(true, ResponseHeader.SHIP_POSITIONED),
		);
	});

	it("Allow Player 1 to position ships horizontal and vertical", () => {
		const pos0 = new Position(1, 0, LAYOUT_TYPE.PATROL);
		const pos1 = new Position(1, 1, LAYOUT_TYPE.PATROL);
		const pos2 = new Position(2, 1, LAYOUT_TYPE.DESTROYER);
		const pos3 = new Position(4, 1, LAYOUT_TYPE.DESTROYER);
		const list = [pos2, pos1, pos0, pos3];
		const resp = game.positionShips(p1.id, list);
		expect(resp).toEqual(
			new Response(true, ResponseHeader.SHIP_POSITIONED),
		);
	});

	it("Reject Player 1 from using invalid ship size for small game mode", () => {
		const pos0 = new Position(0, 0, LAYOUT_TYPE.PATROL);
		const pos1 = new Position(0, 1, LAYOUT_TYPE.PATROL);
		const pos2 = new Position(1, 0, LAYOUT_TYPE.DESTROYER);
		const pos3 = new Position(1, 3, LAYOUT_TYPE.DESTROYER);
		const list = [pos2, pos1, pos0, pos3];
		const resp = game.positionShips(p1.id, list);
		expect(resp).toEqual(
			new Response(false, ResponseHeader.SHIP_BROKE_RULES),
		);
	});

	it("Reject Player 1 from using too many ships", () => {
		const pos0 = new Position(0, 0, LAYOUT_TYPE.PATROL);
		const pos1 = new Position(0, 1, LAYOUT_TYPE.PATROL);
		const pos2 = new Position(1, 0, LAYOUT_TYPE.DESTROYER);
		const pos3 = new Position(1, 2, LAYOUT_TYPE.DESTROYER);
		const pos4 = new Position(2, 0, LAYOUT_TYPE.PATROL);
		const pos5 = new Position(2, 1, LAYOUT_TYPE.PATROL);
		const list = [pos2, pos1, pos0, pos3, pos4, pos5];
		const resp = game.positionShips(p1.id, list);
		expect(resp).toEqual(
			new Response(false, ResponseHeader.SHIP_BROKE_RULES),
		);
	});

	it("Reject Player 1 from using invalid position format", () => {
		const pos0 = new Position(0, 0, LAYOUT_TYPE.PATROL);
		const pos1 = new Position(0, 1, LAYOUT_TYPE.PATROL);
		const pos2 = new Position(1, 0, LAYOUT_TYPE.DESTROYER);
		const pos3 = new Position(2, 1, LAYOUT_TYPE.DESTROYER);
		const list = [pos2, pos1, pos0, pos3];
		const resp = game.positionShips(p1.id, list);
		expect(resp).toEqual(
			new Response(false, ResponseHeader.INVALID_SHIP_MARKERS),
		);
	});
});
