import Game from "../server/models/Game";
import Player from "../server/models/Player";
import Move from "../server/models/Move";
import TestUtils from "../utils/TestUtils";
import Ship from "../server/models/Ship";
import Layout from "../server/models/Layout";

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

	it("Allow Player 1 to position ships vertical", () => {
		const pos0 = new Layout.Position(0, 0, Layout.Orientation.VERTICAL);
		const pos1 = new Layout.Position(0, 1, Layout.Orientation.VERTICAL);
		const pos2 = new Layout.Position(1, 0, Layout.Orientation.VERTICAL);
		const pos3 = new Layout.Position(1, 1, Layout.Orientation.VERTICAL);
		const list = [pos2, pos1, pos0, pos3];
		const str = JSON.stringify(list);
		const resp = game.positionShips(p1.id, str);
		expect(resp).toEqual(
			new Game.Response(true, Game.ResponseHeader.SHIP_POSITIONED),
		);
	});

	it("Allow Player 2 to position ships vertical", () => {
		const pos0 = new Layout.Position(0, 0, Layout.Orientation.VERTICAL);
		const pos1 = new Layout.Position(0, 1, Layout.Orientation.VERTICAL);
		const pos2 = new Layout.Position(1, 0, Layout.Orientation.VERTICAL);
		const pos3 = new Layout.Position(1, 1, Layout.Orientation.VERTICAL);
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

	it("Allow Player 1 to make a move", () => {
		const move = JSON.stringify({ type: Move.TYPE.SOLO, c: 0, r: 0 });
		const resp = game.makeMove(p1.id, move);
		expect(resp).toEqual(new Game.Response(true, Game.ResponseHeader.HIT));
	});

	it("Allow Player 2 to make a move", () => {
		const move = JSON.stringify({ type: Move.TYPE.SOLO, c: 0, r: 0 });
		const resp = game.makeMove(p2.id, move);
		expect(resp).toEqual(new Game.Response(true, Game.ResponseHeader.HIT));
	});

	it("Reject Player 1 from repeating same move", () => {
		const move = JSON.stringify({ type: Move.TYPE.SOLO, c: 0, r: 0 });
		const resp = game.makeMove(p1.id, move);
		expect(resp).toEqual(
			new Game.Response(false, Game.ResponseHeader.MOVE_REPEATED),
		);
	});

	it("Allow Player 1 to Sink the Patrol Boat", () => {
		const move = JSON.stringify({ type: Move.TYPE.SOLO, c: 0, r: 1 });
		const resp = game.makeMove(p1.id, move);
		expect(resp).toEqual(
			new Game.Response(
				true,
				Game.ResponseHeader.SUNK,
				Ship.DESCRIPTOR.PATROL,
			),
		);
	});

	it("Allow Player 2 to hit a Patrol Boat", () => {
		const move = JSON.stringify({ type: Move.TYPE.SOLO, c: 1, r: 0 });
		const resp = game.makeMove(p2.id, move);
		expect(resp).toEqual(new Game.Response(true, Game.ResponseHeader.HIT));
	});

	it("Allow Player 1 to hit the Patrol Boat", () => {
		const move = JSON.stringify({ type: Move.TYPE.SOLO, c: 1, r: 0 });
		const resp = game.makeMove(p1.id, move);
		expect(resp).toEqual(new Game.Response(true, Game.ResponseHeader.HIT));
	});

	it("Allow Player 2 to miss", () => {
		const move = JSON.stringify({ type: Move.TYPE.SOLO, c: 2, r: 0 });
		const resp = game.makeMove(p2.id, move);
		expect(resp).toEqual(new Game.Response(true, Game.ResponseHeader.MISS));
	});

	it("Allow Player 1 to hit the Patrol and win", () => {
		const move = JSON.stringify({ type: Move.TYPE.SOLO, c: 1, r: 1 });
		const resp = game.makeMove(p1.id, move);
		expect(resp).toEqual(
			new Game.Response(
				true,
				Game.ResponseHeader.GAME_OVER,
				Ship.DESCRIPTOR.PATROL,
			),
		);
	});
});
