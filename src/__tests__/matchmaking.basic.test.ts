import Lobby from "../server/models/Lobby";
import Game from "../server/models/Game";
import ServerMessenger from "../server/models/ServerMessenger";
import WSClientMessage from "../server/models/WSClientMessage";
import TestUtils from "../utils/TestUtils";
import Move from "../server/models/Move";

const utils = new TestUtils();
TestUtils.silenceLog();

beforeAll(async () => {
	await utils.setup();
});

afterAll(async () => {
	await utils.tearDown();
});

describe("Basic Matchmaking", () => {
	// initialize a simple http server
	const lobby = new Lobby();

	it("Player 1 Creates New Game", () => {
		const req = { id: "one", req: WSClientMessage.REQ_TYPE.NEW_GAME };
		const msg = new WSClientMessage(JSON.stringify(req));
		const resp = lobby.handleReq(utils.getSocket(req.id), msg);
		expect(resp).toStrictEqual(ServerMessenger.GAME_CREATED);
	});

	it("Player 2 Joins the Game", () => {
		const req = {
			id: "two",
			req: WSClientMessage.REQ_TYPE.JOIN_GAME,
			data: "one",
		};
		const msg = new WSClientMessage(JSON.stringify(req));
		const resp = lobby.handleReq(utils.getSocket(req.id), msg);
		expect(resp).toStrictEqual(ServerMessenger.joined(req.data));
	});

	it("Player 1 Makes a Move", () => {
		const req = {
			id: "one",
			req: WSClientMessage.REQ_TYPE.MAKE_MOVE,
			data: JSON.stringify({ c: 0, r: 0, type: Move.TYPE.SOLO }),
		};
		const msg = new WSClientMessage(JSON.stringify(req));
		const resp = lobby.handleReq(utils.getSocket(req.id), msg);
		expect(resp).toStrictEqual(ServerMessenger.MOVE_MADE);
	});

	it("Player 1 Makes a Move", () => {
		const req = {
			id: "one",
			req: WSClientMessage.REQ_TYPE.MAKE_MOVE,
			data: JSON.stringify({ c: 0, r: 0, type: Move.TYPE.SOLO }),
		};
		const msg = new WSClientMessage(JSON.stringify(req));
		const resp = lobby.handleReq(utils.getSocket(req.id), msg);
		expect(resp).toStrictEqual(ServerMessenger.MOVE_MADE);
	});

	it("Player 2 Makes a Move", () => {
		const req = {
			id: "two",
			req: WSClientMessage.REQ_TYPE.MAKE_MOVE,
			data: JSON.stringify({ c: 1, r: 2, type: Move.TYPE.SOLO }),
		};
		const msg = new WSClientMessage(JSON.stringify(req));
		const resp = lobby.handleReq(utils.getSocket(req.id), msg);
		expect(resp).toStrictEqual(ServerMessenger.MOVE_MADE);
	});

	it("Player 2 Tries to Make Move when its Player 1's Turn", () => {
		const req = {
			id: "two",
			req: WSClientMessage.REQ_TYPE.MAKE_MOVE,
			data: JSON.stringify({ c: 3, r: 2, type: Move.TYPE.SOLO }),
		};
		const msg = new WSClientMessage(JSON.stringify(req));
		const resp = lobby.handleReq(utils.getSocket(req.id), msg);
		expect(resp).toStrictEqual(
			ServerMessenger.invalid_move(Game.ResponseHeader.TURN_ERROR),
		);
	});
});
