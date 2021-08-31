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

	it("Allow Player 2 to change to Classic game type", () => {
		const resp = game.changeGameType(p1.id, Game.TYPE.CLASSIC);
		expect(resp).toEqual(
			new Game.Response(
				true,
				Game.ResponseHeader.GAME_TYPE_CHANGED,
				Game.TYPE.CLASSIC,
			),
		);
	});

	it("Allow Player 1 to change to Basic game type", () => {
		const resp = game.changeGameType(p1.id, Game.TYPE.BASIC);
		expect(resp).toEqual(
			new Game.Response(
				true,
				Game.ResponseHeader.GAME_TYPE_CHANGED,
				Game.TYPE.BASIC,
			),
		);
	});

	it("Allow Player 1 to position ships vertical basic ", () => {
		const pos0 = new Layout.Position(0, 0, Layout.TYPE.PATROL);
		const pos1 = new Layout.Position(1, 0, Layout.TYPE.PATROL);
		const pos2 = new Layout.Position(0, 1, Layout.TYPE.DESTROYER);
		const pos3 = new Layout.Position(2, 1, Layout.TYPE.DESTROYER);
		const list = [pos2, pos1, pos0, pos3];
		const str = JSON.stringify(list);
		const resp = game.positionShips(p1.id, str);
		expect(resp).toEqual(
			new Game.Response(true, Game.ResponseHeader.SHIP_POSITIONED),
		);
	});

	it("Reject Player 1 from changing game type after ready up", () => {
		const resp = game.changeGameType(p1.id, Game.TYPE.BASIC);
		expect(resp).toEqual(
			new Game.Response(false, Game.ResponseHeader.PLAYER_READY),
		);
	});

	it("Allow Player 2 to position ships horizontal basic", () => {
		const pos0 = new Layout.Position(0, 0, Layout.TYPE.PATROL);
		const pos1 = new Layout.Position(1, 0, Layout.TYPE.PATROL);
		const pos2 = new Layout.Position(0, 1, Layout.TYPE.DESTROYER);
		const pos3 = new Layout.Position(2, 1, Layout.TYPE.DESTROYER);
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

	it("Reject Player 1 from changing game type after game started", () => {
		const resp = game.changeGameType(p1.id, Game.TYPE.BASIC);
		expect(resp).toEqual(
			new Game.Response(false, Game.ResponseHeader.GAME_IN_PROGRESS),
		);
	});
});
