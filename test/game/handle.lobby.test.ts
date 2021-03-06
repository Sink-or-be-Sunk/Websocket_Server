import Lobby from "../../src/models/gameplay/Lobby";
import { Move, MOVE_RESULT, MOVE_TYPE } from "../../src/models/gameplay/Move";
import { GAME_TYPE, ResponseHeader } from "../../src/models/gameplay/Game";
import { WSClientMessage, REQ_TYPE } from "../../src/util/WSClientMessage";
import { Position, POSITION_TYPE } from "../../src/models/gameplay/Layout";
import {
	SERVER_HEADERS,
	WSServerMessage,
} from "../../src/util/WSServerMessage";

describe("Handle Lobby Requests ", () => {
	const lobby = new Lobby();

	it("Accepts New Game Request", async () => {
		const obj = { req: REQ_TYPE.NEW_GAME, id: "one" };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const resp = await lobby.handleReq(msg);
		const result = [
			new WSServerMessage({
				header: SERVER_HEADERS.GAME_CREATED,
				at: obj.id,
			}),
		];
		expect(resp.toString()).toEqual(result.toString());
	});

	it("Accept Join Game Request", async () => {
		const obj = { req: REQ_TYPE.JOIN_GAME, id: "two", data: "one" };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.JOINED_GAME,
				at: obj.id,
				payload: { opponent: obj.data, gameType: GAME_TYPE.CLASSIC },
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.JOINED_GAME,
				at: obj.data,
				payload: { opponent: obj.id, gameType: GAME_TYPE.CLASSIC },
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Accepts Duplicate New Game Request", async () => {
		const obj = { req: REQ_TYPE.NEW_GAME, id: "one" };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const resp = await lobby.handleReq(msg);
		const result = [
			new WSServerMessage({
				header: SERVER_HEADERS.JOINED_GAME,
				at: obj.id,
				payload: {
					opponent: Lobby.EMPTY_GAME_MSG,
					gameType: GAME_TYPE.CLASSIC,
				},
			}),
		];
		expect(resp.toString()).toEqual(result.toString());
	});

	it("Reject Join Game Request from Player One already in game", async () => {
		const obj = { req: REQ_TYPE.JOIN_GAME, id: "one", data: "one" };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const resp = await lobby.handleReq(msg);
		const result = [
			new WSServerMessage({
				header: SERVER_HEADERS.INVALID_JOIN,
				at: obj.id,
				meta: ResponseHeader.ALREADY_IN_GAME,
			}),
		];
		expect(resp.toString()).toEqual(result.toString());
	});
	it("Reject Join Game Request from Player Two already in game", async () => {
		const obj = { req: REQ_TYPE.JOIN_GAME, id: "two", data: "one" };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const resp = await lobby.handleReq(msg);
		const result = [
			new WSServerMessage({
				header: SERVER_HEADERS.INVALID_JOIN,
				at: obj.id,
				meta: ResponseHeader.ALREADY_IN_GAME,
			}),
		];
		expect(resp.toString()).toEqual(result.toString());
	});

	it("Allow Player 1 to change game type", async () => {
		const obj = {
			req: REQ_TYPE.GAME_TYPE,
			id: "one",
			data: GAME_TYPE.BASIC,
		};
		const str = JSON.stringify(obj);
		const msg = new WSClientMessage(str);
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.GAME_TYPE_APPROVED,
				at: obj.id,
				meta: obj.data,
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.GAME_TYPE_APPROVED,
				at: "two",
				meta: obj.data,
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Allow Player 1 to position ships", async () => {
		const list = [
			new Position(0, 0, POSITION_TYPE.PATROL),
			new Position(0, 1, POSITION_TYPE.PATROL),
			new Position(1, 0, POSITION_TYPE.DESTROYER),
			new Position(1, 2, POSITION_TYPE.DESTROYER),
		];
		const obj = { req: REQ_TYPE.POSITION_SHIPS, id: "one", data: list };
		const str = JSON.stringify(obj);
		const msg = new WSClientMessage(str);
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.POSITIONED_SHIPS,
				at: obj.id,
				payload: list,
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Allow Player 2 to position ships", async () => {
		const list = [
			new Position(0, 0, POSITION_TYPE.PATROL),
			new Position(0, 1, POSITION_TYPE.PATROL),
			new Position(1, 0, POSITION_TYPE.DESTROYER),
			new Position(1, 2, POSITION_TYPE.DESTROYER),
		];
		const obj = { req: REQ_TYPE.POSITION_SHIPS, id: "two", data: list };
		const str = JSON.stringify(obj);
		const msg = new WSClientMessage(str);
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.POSITIONED_SHIPS,
				at: "two",
				payload: list,
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.GAME_STARTED,
				at: "one",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.GAME_STARTED,
				at: obj.id,
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "one",
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEEFFEEEEEEFFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "two",
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEEFFEEEEEEFFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Allow Player 1 to make a move", async () => {
		const move = {
			type: MOVE_TYPE.SOLO,
			c: 0,
			r: 0,
			to: "two",
		};
		const move_res = new Move(move);
		move_res.from = "one";
		move_res.result = MOVE_RESULT.HIT;
		const obj = { req: REQ_TYPE.MAKE_MOVE, id: move_res.from, data: move };
		const str = JSON.stringify(obj);
		const msg = new WSClientMessage(str);
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.MOVE_MADE,
				at: obj.id,
				payload: move_res,
				meta: move_res.toResultString(),
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.MOVE_MADE,
				at: move.to,
				payload: move_res,
				meta: move_res.toResultString(),
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: obj.id,
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEEFFEEEEEEFFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEHEEEEEEE",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: move.to,
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEEFFEEEEEEHFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Allow Player 2 to make a move", async () => {
		const move = {
			type: MOVE_TYPE.SOLO,
			c: 0,
			r: 0,
			to: "one",
		};
		const move_res = new Move(move);
		move_res.from = "two";
		move_res.result = MOVE_RESULT.HIT;
		const obj = { req: REQ_TYPE.MAKE_MOVE, id: move_res.from, data: move };
		const str = JSON.stringify(obj);
		const msg = new WSClientMessage(str);
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.MOVE_MADE,
				at: obj.id,
				payload: move_res,
				meta: move_res.toResultString(),
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.MOVE_MADE,
				at: move.to,
				payload: move_res,
				meta: move_res.toResultString(),
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: move.to,
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEEFFEEEEEEHFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEHEEEEEEE",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: obj.id,
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEEFFEEEEEEHFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEHEEEEEEE",
			}),
		];

		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Player 2 Tries to Make Move when its Player 1's Turn", async () => {
		const move = {
			type: MOVE_TYPE.SOLO,
			c: 0,
			r: 0,
			to: "one",
		};
		const req = {
			id: "two",
			req: REQ_TYPE.MAKE_MOVE,
			data: move,
		};
		const msg = new WSClientMessage(JSON.stringify(req));
		const resp = await lobby.handleReq(msg);
		const result = [
			new WSServerMessage({
				header: SERVER_HEADERS.INVALID_MOVE,
				at: req.id,
				meta: ResponseHeader.TURN_ERROR,
			}),
		];
		expect(resp.toString()).toEqual(result.toString());
	});

	it("Allow Player 1 to make a move resulting in miss", async () => {
		const move = {
			type: MOVE_TYPE.SOLO,
			c: 0,
			r: 5,
			to: "two",
		};
		const move_res = new Move(move);
		move_res.from = "one";
		move_res.result = MOVE_RESULT.MISS;
		const obj = { req: REQ_TYPE.MAKE_MOVE, id: move_res.from, data: move };
		const str = JSON.stringify(obj);
		const msg = new WSClientMessage(str);
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.MOVE_MADE,
				at: obj.id,
				payload: move_res,
				meta: move_res.toResultString(),
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.MOVE_MADE,
				at: move.to,
				payload: move_res,
				meta: move_res.toResultString(),
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "one",
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEEFFEEEEEEHFEEEEEEEEEEEEEEEEEEEEEEMEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEHEEEEEEE",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "two",
				meta: "EEEEEEEEEEEEEEEEMEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEEFFEEEEEEHFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEHEEEEEEE",
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Player 2 Leaves the Game", async () => {
		const req = {
			id: "two",
			req: REQ_TYPE.LEAVE_GAME,
		};
		const msg = new WSClientMessage(JSON.stringify(req));
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.LEFT_GAME,
				at: "one",
				meta: req.id,
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.LEFT_GAME,
				at: req.id,
				meta: req.id,
			}),
		];
		expect(results.length).toEqual(responses.length);
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});
});
