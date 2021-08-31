import Game from "../../src/models/gameplay/Game";
import Player from "../../src/models/gameplay/Player";
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

describe("Validate basic back and forth game", () => {
	const p1 = new Player("one", utils.getSocket("one"));
	const p2 = new Player("two", utils.getSocket("two"));

	const game = new Game(p1.id, p1.socket, Game.TYPE.BASIC);

	it("Allows Player2 to join game", () => {
		const resp = game.add(p2);
		expect(resp).toEqual(true);
	});

	it("Allow Player 1 to position ships vertical basic ", () => {
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

	it("Allow Player 1 to position ships horizontal basic", () => {
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

	it("Allow Player 1 to position ships horizontal medium", () => {
		const pos0 = new Layout.Position(0, 0, Layout.TYPE.PATROL);
		const pos1 = new Layout.Position(1, 0, Layout.TYPE.PATROL);
		const pos2 = new Layout.Position(3, 1, Layout.TYPE.DESTROYER);
		const pos3 = new Layout.Position(5, 1, Layout.TYPE.DESTROYER);
		const list = [pos2, pos1, pos0, pos3];
		const str = JSON.stringify(list);
		const resp = game.positionShips(p1.id, str);
		expect(resp).toEqual(
			new Game.Response(true, Game.ResponseHeader.SHIP_POSITIONED),
		);
	});

	it("Allow Player 1 to position ships vertical medium", () => {
		const pos0 = new Layout.Position(0, 0, Layout.TYPE.PATROL);
		const pos1 = new Layout.Position(0, 1, Layout.TYPE.PATROL);
		const pos2 = new Layout.Position(1, 3, Layout.TYPE.DESTROYER);
		const pos3 = new Layout.Position(1, 5, Layout.TYPE.DESTROYER);
		const list = [pos2, pos1, pos0, pos3];
		const str = JSON.stringify(list);
		const resp = game.positionShips(p1.id, str);
		expect(resp).toEqual(
			new Game.Response(true, Game.ResponseHeader.SHIP_POSITIONED),
		);
	});

	it("Allow Player 1 to position ships horizontal and vertical", () => {
		const pos0 = new Layout.Position(1, 0, Layout.TYPE.PATROL);
		const pos1 = new Layout.Position(1, 1, Layout.TYPE.PATROL);
		const pos2 = new Layout.Position(2, 1, Layout.TYPE.DESTROYER);
		const pos3 = new Layout.Position(4, 1, Layout.TYPE.DESTROYER);
		const list = [pos2, pos1, pos0, pos3];
		const str = JSON.stringify(list);
		const resp = game.positionShips(p1.id, str);
		expect(resp).toEqual(
			new Game.Response(true, Game.ResponseHeader.SHIP_POSITIONED),
		);
	});

	it("Reject Player 1 from using invalid ship size for small game mode", () => {
		const pos0 = new Layout.Position(0, 0, Layout.TYPE.PATROL);
		const pos1 = new Layout.Position(0, 1, Layout.TYPE.PATROL);
		const pos2 = new Layout.Position(1, 0, Layout.TYPE.DESTROYER);
		const pos3 = new Layout.Position(1, 3, Layout.TYPE.DESTROYER);
		const list = [pos2, pos1, pos0, pos3];
		const str = JSON.stringify(list);
		const resp = game.positionShips(p1.id, str);
		expect(resp).toEqual(
			new Game.Response(false, Game.ResponseHeader.SHIP_BROKE_RULES),
		);
	});

	it("Reject Player 1 from using too many ships", () => {
		const pos0 = new Layout.Position(0, 0, Layout.TYPE.PATROL);
		const pos1 = new Layout.Position(0, 1, Layout.TYPE.PATROL);
		const pos2 = new Layout.Position(1, 0, Layout.TYPE.DESTROYER);
		const pos3 = new Layout.Position(1, 2, Layout.TYPE.DESTROYER);
		const pos4 = new Layout.Position(2, 0, Layout.TYPE.PATROL);
		const pos5 = new Layout.Position(2, 1, Layout.TYPE.PATROL);
		const list = [pos2, pos1, pos0, pos3, pos4, pos5];
		const str = JSON.stringify(list);
		const resp = game.positionShips(p1.id, str);
		expect(resp).toEqual(
			new Game.Response(false, Game.ResponseHeader.SHIP_BROKE_RULES),
		);
	});

	it("Reject Player 1 from using invalid position format", () => {
		const pos0 = new Layout.Position(0, 0, Layout.TYPE.PATROL);
		const pos1 = new Layout.Position(0, 1, Layout.TYPE.PATROL);
		const pos2 = new Layout.Position(1, 0, Layout.TYPE.DESTROYER);
		const pos3 = new Layout.Position(2, 1, Layout.TYPE.DESTROYER);
		const list = [pos2, pos1, pos0, pos3];
		const str = JSON.stringify(list);
		const resp = game.positionShips(p1.id, str);
		expect(resp).toEqual(
			new Game.Response(false, Game.ResponseHeader.INVALID_SHIP_MARKERS),
		);
	});
});
