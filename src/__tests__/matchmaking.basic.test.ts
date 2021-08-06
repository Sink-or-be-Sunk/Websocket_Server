import Lobby from "../server/models/Lobby";
import Game from "../server/models/Game";
import ServerMessenger from "../server/models/ServerMessenger";
import WSClientMessage from "../server/models/WSClientMessage";
import TestUtils from "../utils/TestUtils";
import Move from "../server/models/Move";
import Layout from "../server/models/Layout";
import { pbkdf2 } from "crypto";

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

	it("Player 1 Creates New Basic Game", () => {
		const req = {
			id: "one",
			req: WSClientMessage.REQ_TYPE.NEW_GAME,
			data: Game.TYPE.BASIC,
		};
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

	it("Allow Player 1 to position ships vertical", () => {
		const pos0 = new Layout.Position(0, 0, Layout.TYPE.PATROL);
		const pos1 = new Layout.Position(0, 1, Layout.TYPE.PATROL);
		const pos2 = new Layout.Position(1, 0, Layout.TYPE.DESTROYER);
		const pos3 = new Layout.Position(1, 2, Layout.TYPE.DESTROYER);
		const list = [pos2, pos1, pos0, pos3];
		const str = JSON.stringify(list);
		const req = {
			id: "one",
			req: WSClientMessage.REQ_TYPE.POSITION_SHIPS,
			data: str,
		};
		const msg = new WSClientMessage(JSON.stringify(req));
		const resp = lobby.handleReq(utils.getSocket(req.id), msg);
		expect(resp).toEqual(ServerMessenger.LAYOUT_APPROVED);
	});

	it("Allow Player 1 to position ships vertical", () => {
		const pos0 = new Layout.Position(0, 0, Layout.TYPE.PATROL);
		const pos1 = new Layout.Position(0, 1, Layout.TYPE.PATROL);
		const pos2 = new Layout.Position(1, 0, Layout.TYPE.DESTROYER);
		const pos3 = new Layout.Position(1, 2, Layout.TYPE.DESTROYER);
		const list = [pos2, pos1, pos0, pos3];
		const str = JSON.stringify(list);
		const req = {
			id: "two",
			req: WSClientMessage.REQ_TYPE.POSITION_SHIPS,
			data: str,
		};
		const msg = new WSClientMessage(JSON.stringify(req));
		const resp = lobby.handleReq(utils.getSocket(req.id), msg);
		expect(resp).toEqual(ServerMessenger.LAYOUT_APPROVED);
	});

	it("Player 1 Makes a Move", () => {
		const req = {
			id: "one",
			req: WSClientMessage.REQ_TYPE.MAKE_MOVE,
			data: JSON.stringify({
				c: 0,
				r: 0,
				type: Move.TYPE.SOLO,
				at: "two",
			}),
		};
		const msg = new WSClientMessage(JSON.stringify(req));
		const resp = lobby.handleReq(utils.getSocket(req.id), msg);
		expect(resp).toStrictEqual(ServerMessenger.MOVE_MADE);
	});

	it("Player 2 Makes a Move", () => {
		const req = {
			id: "two",
			req: WSClientMessage.REQ_TYPE.MAKE_MOVE,
			data: JSON.stringify({
				c: 1,
				r: 2,
				type: Move.TYPE.SOLO,
				at: "one",
			}),
		};
		const msg = new WSClientMessage(JSON.stringify(req));
		const resp = lobby.handleReq(utils.getSocket(req.id), msg);
		expect(resp).toStrictEqual(ServerMessenger.MOVE_MADE);
	});

	it("Player 2 Tries to Make Move when its Player 1's Turn", () => {
		const req = {
			id: "two",
			req: WSClientMessage.REQ_TYPE.MAKE_MOVE,
			data: JSON.stringify({
				c: 3,
				r: 2,
				type: Move.TYPE.SOLO,
				at: "one",
			}),
		};
		const msg = new WSClientMessage(JSON.stringify(req));
		const resp = lobby.handleReq(utils.getSocket(req.id), msg);
		expect(resp).toStrictEqual(
			ServerMessenger.invalid_move(Game.ResponseHeader.TURN_ERROR),
		);
	});
});
