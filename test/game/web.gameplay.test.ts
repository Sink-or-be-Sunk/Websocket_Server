import Lobby from "../../src/models/gameplay/Lobby";
import { Move, MOVE_RESULT, MOVE_TYPE } from "../../src/models/gameplay/Move";
import { GAME_TYPE, ResponseHeader } from "../../src/models/gameplay/Game";
import { WSClientMessage, REQ_TYPE } from "../../src/util/WSClientMessage";
import {
	Position,
	LAYOUT_TYPE,
	POSITION_TYPE,
} from "../../src/models/gameplay/Layout";
import {
	SERVER_HEADERS,
	WSServerMessage,
} from "../../src/util/WSServerMessage";
import { ShipType, SHIP_DESCRIPTOR } from "../../src/models/gameplay/Ship";

describe("Mimic Game Play From Two Web Players", () => {
	const lobby = new Lobby();

	it("Accepts New Game Request", () => {
		const obj = { req: REQ_TYPE.NEW_GAME, id: "one" };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const resp = lobby.handleReq(msg);
		const result = [
			new WSServerMessage({
				header: SERVER_HEADERS.GAME_CREATED,
				at: obj.id,
			}),
		];
		expect(resp.toString()).toEqual(result.toString());
	});

	it("Accept Join Game Request", () => {
		const obj = { req: REQ_TYPE.JOIN_GAME, id: "two", data: "one" };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const responses = lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.JOINED_GAME,
				at: obj.id,
				meta: obj.data,
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.JOINED_GAME,
				at: obj.data,
				meta: obj.id,
			}),
		];
		for (let i = 0; i < results.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Allow Player 1 to position ships", () => {
		const list = [];
		list.push(new Position(0, 0, POSITION_TYPE.PATROL));
		list.push(new Position(0, 1, POSITION_TYPE.PATROL));
		list.push(new Position(1, 0, POSITION_TYPE.SUBMARINE));
		list.push(new Position(1, 2, POSITION_TYPE.SUBMARINE));
		list.push(new Position(2, 0, POSITION_TYPE.BATTLESHIP));
		list.push(new Position(2, 3, POSITION_TYPE.BATTLESHIP));
		list.push(new Position(3, 0, POSITION_TYPE.CARRIER));
		list.push(new Position(3, 4, POSITION_TYPE.CARRIER));
		const obj = { req: REQ_TYPE.POSITION_SHIPS, id: "one", data: list };
		const str = JSON.stringify(obj);
		const msg = new WSClientMessage(str);
		const responses = lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.POSITIONED_SHIPS,
				at: obj.id,
			}),
		];
		for (let i = 0; i < results.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Allow Player 2 to position ships", () => {
		const list = [];
		list.push(new Position(0, 0, POSITION_TYPE.PATROL));
		list.push(new Position(0, 1, POSITION_TYPE.PATROL));
		list.push(new Position(1, 0, POSITION_TYPE.SUBMARINE));
		list.push(new Position(1, 2, POSITION_TYPE.SUBMARINE));
		list.push(new Position(2, 0, POSITION_TYPE.BATTLESHIP));
		list.push(new Position(2, 3, POSITION_TYPE.BATTLESHIP));
		list.push(new Position(3, 0, POSITION_TYPE.CARRIER));
		list.push(new Position(3, 4, POSITION_TYPE.CARRIER));
		const obj = { req: REQ_TYPE.POSITION_SHIPS, id: "two", data: list };
		const str = JSON.stringify(obj);
		const msg = new WSClientMessage(str);
		const responses = lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.GAME_STARTED,
				at: "one",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.GAME_STARTED,
				at: obj.id,
			}),
		];
		for (let i = 0; i < results.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Allow Player 1 to make a move", () => {
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
		const responses = lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.MOVE_MADE,
				at: obj.id,
				payload: move_res,
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.MOVE_MADE,
				at: move.to,
				payload: move_res,
			}),
		];
		for (let i = 0; i < results.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Allow Player 2 to make a move", () => {
		const move = {
			type: MOVE_TYPE.SOLO,
			c: 7,
			r: 7,
			to: "one",
		};
		const move_res = new Move(move);
		move_res.from = "two";
		move_res.result = MOVE_RESULT.MISS;
		const obj = { req: REQ_TYPE.MAKE_MOVE, id: move_res.from, data: move };
		const str = JSON.stringify(obj);
		const msg = new WSClientMessage(str);
		const responses = lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.MOVE_MADE,
				at: obj.id,
				payload: move_res,
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.MOVE_MADE,
				at: move.to,
				payload: move_res,
			}),
		];
		for (let i = 0; i < results.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Allow Player 1 to sink PT boat", () => {
		const move = {
			type: MOVE_TYPE.SOLO,
			c: 0,
			r: 1,
			to: "two",
		};
		const move_res = new Move(move);
		move_res.from = "one";
		move_res.result = MOVE_RESULT.SUNK;
		move_res.result_ship = new ShipType(SHIP_DESCRIPTOR.PATROL);
		const obj = { req: REQ_TYPE.MAKE_MOVE, id: move_res.from, data: move };
		const str = JSON.stringify(obj);
		const msg = new WSClientMessage(str);
		const responses = lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.MOVE_MADE,
				at: obj.id,
				payload: move_res,
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.MOVE_MADE,
				at: move.to,
				payload: move_res,
			}),
		];
		for (let i = 0; i < results.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});
});