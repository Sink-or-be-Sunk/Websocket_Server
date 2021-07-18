import Lobby from "../models/Lobby";
import { GameResponse } from "../models/Game";
import ServerMessenger from "../models/ServerMessenger";
import WSMessage from "../models/WSClientMessage";
import TestUtils from "../utils/TestUtils";

beforeAll(async () => {
	await TestUtils.setup();
});

afterAll(() => {
	TestUtils.tearDown();
});

describe("Basic Matchmaking", () => {
	// initialize a simple http server
	const lobby = new Lobby();

	it("Player 1 Creates New Game", () => {
		const req = { id: "one", req: WSMessage.NEW_GAME };
		const msg = new WSMessage(JSON.stringify(req));
		const resp = lobby.handleReq(TestUtils.getSocket(req.id), msg);
		expect(resp).toStrictEqual(ServerMessenger.GAME_CREATED);
	});

	it("Player 2 Joins the Game", () => {
		const req = { id: "two", req: WSMessage.JOIN_GAME, data: "one" };
		const msg = new WSMessage(JSON.stringify(req));
		const resp = lobby.handleReq(TestUtils.getSocket(req.id), msg);
		expect(resp).toStrictEqual(ServerMessenger.joined(req.data));
	});

	it("Player 1 Makes a Move", () => {
		const req = { id: "one", req: WSMessage.MAKE_MOVE, data: "move" };
		const msg = new WSMessage(JSON.stringify(req));
		const resp = lobby.handleReq(TestUtils.getSocket(req.id), msg);
		expect(resp).toStrictEqual(ServerMessenger.MOVE_MADE);
	});

	it("Player 2 Makes a Move", () => {
		const req = { id: "two", req: WSMessage.MAKE_MOVE, data: "move" };
		const msg = new WSMessage(JSON.stringify(req));
		const resp = lobby.handleReq(TestUtils.getSocket(req.id), msg);
		expect(resp).toStrictEqual(ServerMessenger.MOVE_MADE);
	});

	it("Player 2 Tries to Make Move when its Player 1's Turn", () => {
		const req = { id: "two", req: WSMessage.MAKE_MOVE, data: "move" };
		const msg = new WSMessage(JSON.stringify(req));
		const resp = lobby.handleReq(TestUtils.getSocket(req.id), msg);
		expect(resp).toStrictEqual(
			ServerMessenger.invalid_move(GameResponse.TURN_ERROR),
		);
	});
});
