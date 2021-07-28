import Lobby from "../server/models/Lobby";
import Game from "../server/models/Game";
import ServerMessenger from "../server/models/ServerMessenger";
import WSClientMessage from "../server/models/WSClientMessage";
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
		const req = { id: "one", req: WSClientMessage.NEW_GAME };
		const msg = new WSClientMessage(JSON.stringify(req));
		const resp = lobby.handleReq(TestUtils.getSocket(req.id), msg);
		expect(resp).toStrictEqual(ServerMessenger.GAME_CREATED);
	});

	it("Player 2 Joins the Game", () => {
		const req = { id: "two", req: WSClientMessage.JOIN_GAME, data: "one" };
		const msg = new WSClientMessage(JSON.stringify(req));
		const resp = lobby.handleReq(TestUtils.getSocket(req.id), msg);
		expect(resp).toStrictEqual(ServerMessenger.joined(req.data));
	});

	it("Player 1 Makes a Move", () => {
		const req = { id: "one", req: WSClientMessage.MAKE_MOVE, data: "move" };
		const msg = new WSClientMessage(JSON.stringify(req));
		const resp = lobby.handleReq(TestUtils.getSocket(req.id), msg);
		expect(resp).toStrictEqual(ServerMessenger.MOVE_MADE);
	});

	it("Player 2 Makes a Move", () => {
		const req = { id: "two", req: WSClientMessage.MAKE_MOVE, data: "move" };
		const msg = new WSClientMessage(JSON.stringify(req));
		const resp = lobby.handleReq(TestUtils.getSocket(req.id), msg);
		expect(resp).toStrictEqual(ServerMessenger.MOVE_MADE);
	});

	it("Player 2 Tries to Make Move when its Player 1's Turn", () => {
		const req = { id: "two", req: WSClientMessage.MAKE_MOVE, data: "move" };
		const msg = new WSClientMessage(JSON.stringify(req));
		const resp = lobby.handleReq(TestUtils.getSocket(req.id), msg);
		expect(resp).toStrictEqual(
			ServerMessenger.invalid_move(Game.ResponseHeader.TURN_ERROR),
		);
	});
});
