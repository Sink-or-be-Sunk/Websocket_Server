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

	const ships = [
		new Position(0, 0, POSITION_TYPE.PATROL),
		new Position(0, 1, POSITION_TYPE.PATROL),
		new Position(1, 0, POSITION_TYPE.SUBMARINE),
		new Position(1, 2, POSITION_TYPE.SUBMARINE),
		new Position(2, 0, POSITION_TYPE.BATTLESHIP),
		new Position(2, 3, POSITION_TYPE.BATTLESHIP),
		new Position(3, 0, POSITION_TYPE.CARRIER),
		new Position(3, 4, POSITION_TYPE.CARRIER),
	];

	it("Accepts Init Connection Request from player one", async () => {
		const obj = { req: REQ_TYPE.INIT_CONNECTION, id: "one" };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.CONNECTED,
				at: obj.id,
				meta: SERVER_HEADERS.INITIAL_CONNECTION,
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Accepts New Game Request", async () => {
		const obj = { req: REQ_TYPE.NEW_GAME, id: "one" };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.GAME_CREATED,
				at: obj.id,
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Accepts Player One Reconnect to Empty Game", async () => {
		const obj = { req: REQ_TYPE.INIT_CONNECTION, id: "one" };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.JOINED_GAME,
				at: obj.id,
				payload: {
					opponent: Lobby.EMPTY_GAME_MSG,
					gameType: GAME_TYPE.CLASSIC,
				},
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Accept Player Two Join Game Request", async () => {
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

	it("Accepts Player One Reconnect to Game with Opponent", async () => {
		const obj = { req: REQ_TYPE.INIT_CONNECTION, id: "one" };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.JOINED_GAME,
				at: obj.id,
				payload: {
					opponent: "two",
					gameType: GAME_TYPE.CLASSIC,
				},
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Accepts Player Two Reconnect to Game with Opponent", async () => {
		const obj = { req: REQ_TYPE.INIT_CONNECTION, id: "two" };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.JOINED_GAME,
				at: obj.id,
				payload: {
					opponent: "one",
					gameType: GAME_TYPE.CLASSIC,
				},
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Allow Player 1 to position ships", async () => {
		const obj = { req: REQ_TYPE.POSITION_SHIPS, id: "one", data: ships };
		const str = JSON.stringify(obj);
		const msg = new WSClientMessage(str);
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.POSITIONED_SHIPS,
				at: obj.id,
				payload: ships,
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Accepts Player One Reconnect to Game with Ships Positioned", async () => {
		const obj = { req: REQ_TYPE.INIT_CONNECTION, id: "one" };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.JOINED_GAME,
				at: obj.id,
				payload: {
					opponent: "two",
					gameType: GAME_TYPE.CLASSIC,
				},
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.POSITIONED_SHIPS,
				at: obj.id,
				payload: ships,
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Accepts Player Two Reconnect to Game", async () => {
		const obj = { req: REQ_TYPE.INIT_CONNECTION, id: "two" };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.JOINED_GAME,
				at: obj.id,
				payload: {
					opponent: "one",
					gameType: GAME_TYPE.CLASSIC,
				},
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Allow Player 2 to position ships", async () => {
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
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEEFFEEEEEFFFEEEEFFFFEEEEFFFFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "two",
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEEFFEEEEEFFFEEEEFFFFEEEEFFFFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Accepts Player One Reconnect to Game In Progress with No Moves", async () => {
		const obj = { req: REQ_TYPE.INIT_CONNECTION, id: "one" };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.JOINED_GAME,
				at: obj.id,
				payload: {
					opponent: "two",
					gameType: GAME_TYPE.CLASSIC,
				},
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.POSITIONED_SHIPS,
				at: "one",
				payload: ships,
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.GAME_STARTED,
				at: "one",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "one",
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEEFFEEEEEFFFEEEEFFFFEEEEFFFFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Accepts Player Two Reconnect to Game In Progress with No Moves", async () => {
		const obj = { req: REQ_TYPE.INIT_CONNECTION, id: "two" };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.JOINED_GAME,
				at: obj.id,
				payload: {
					opponent: "one",
					gameType: GAME_TYPE.CLASSIC,
				},
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.POSITIONED_SHIPS,
				at: "two",
				payload: ships,
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.GAME_STARTED,
				at: "two",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "two",
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEEFFEEEEEFFFEEEEFFFFEEEEFFFFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
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
				at: "one",
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEEFFEEEEEFFFEEEEFFFFEEEEFFFFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEHEEEEEEE",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "two",
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEEFFEEEEEFFFEEEEFFFFEEEEHFFFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Accepts Player One Reconnect to Game In Progress with One Move", async () => {
		const obj = { req: REQ_TYPE.INIT_CONNECTION, id: "one" };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.JOINED_GAME,
				at: obj.id,
				payload: {
					opponent: "two",
					gameType: GAME_TYPE.CLASSIC,
				},
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.POSITIONED_SHIPS,
				at: "one",
				payload: ships,
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.GAME_STARTED,
				at: "one",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "one",
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEEFFEEEEEFFFEEEEFFFFEEEEFFFFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEHEEEEEEE",
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Accepts Player Two Reconnect to Game In Progress with One Move", async () => {
		const obj = { req: REQ_TYPE.INIT_CONNECTION, id: "two" };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.JOINED_GAME,
				at: obj.id,
				payload: {
					opponent: "one",
					gameType: GAME_TYPE.CLASSIC,
				},
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.POSITIONED_SHIPS,
				at: "two",
				payload: ships,
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.GAME_STARTED,
				at: "two",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "two",
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEEFFEEEEEFFFEEEEFFFFEEEEHFFFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
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
				meta: "EEEEEEEMEEEEEEEEEEEEEEEEEEEFEEEEEEFFEEEEEFFFEEEEFFFFEEEEFFFFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEHEEEEEEE",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "two",
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEEFFEEEEEFFFEEEEFFFFEEEEHFFFEEEEEEEEEEEMEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Allow Player 1 to sink PT boat", async () => {
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
				meta: "EEEEEEEMEEEEEEEEEEEEEEEEEEEFEEEEEEFFEEEEEFFFEEEEFFFFEEEEFFFFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEESEEEEEEESEEEEEEE",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "two",
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEEFFEEEEEFFFEEEESFFFEEEESFFFEEEEEEEEEEEMEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Accepts Player One Reconnect to Game In Progress with One Move", async () => {
		const obj = { req: REQ_TYPE.INIT_CONNECTION, id: "one" };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.JOINED_GAME,
				at: obj.id,
				payload: {
					opponent: "two",
					gameType: GAME_TYPE.CLASSIC,
				},
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.POSITIONED_SHIPS,
				at: "one",
				payload: ships,
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.GAME_STARTED,
				at: "one",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "one",
				meta: "EEEEEEEMEEEEEEEEEEEEEEEEEEEFEEEEEEFFEEEEEFFFEEEEFFFFEEEEFFFFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEESEEEEEEESEEEEEEE",
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Accepts Player Two Reconnect to Game In Progress with One Move", async () => {
		const obj = { req: REQ_TYPE.INIT_CONNECTION, id: "two" };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.JOINED_GAME,
				at: obj.id,
				payload: {
					opponent: "one",
					gameType: GAME_TYPE.CLASSIC,
				},
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.POSITIONED_SHIPS,
				at: "two",
				payload: ships,
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.GAME_STARTED,
				at: "two",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "two",
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEEFFEEEEEFFFEEEESFFFEEEESFFFEEEEEEEEEEEMEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});
});

describe("Game Two Web Players with different setup message order", () => {
	const lobby = new Lobby();

	it("Accepts New Game Request", async () => {
		const obj = { req: REQ_TYPE.NEW_GAME, id: "one" };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.GAME_CREATED,
				at: obj.id,
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Accepts Change to Basic Game Mode", async () => {
		const obj = {
			req: REQ_TYPE.GAME_TYPE,
			id: "one",
			data: GAME_TYPE.BASIC,
		};
		const msg = new WSClientMessage(JSON.stringify(obj));
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.GAME_TYPE_APPROVED,
				at: obj.id,
				meta: GAME_TYPE.BASIC,
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Accepts Player One Reconnect to Basic Game", async () => {
		const obj = { req: REQ_TYPE.INIT_CONNECTION, id: "one" };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.JOINED_GAME,
				at: obj.id,
				payload: {
					opponent: Lobby.EMPTY_GAME_MSG,
					gameType: GAME_TYPE.BASIC,
				},
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Allow Player 1 to position ships", async () => {
		const list = [];
		list.push(new Position(0, 0, POSITION_TYPE.PATROL));
		list.push(new Position(0, 1, POSITION_TYPE.PATROL));
		list.push(new Position(1, 0, POSITION_TYPE.DESTROYER));
		list.push(new Position(1, 2, POSITION_TYPE.DESTROYER));
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

	it("Accepts Player One Reconnect to Game with Ships Positioned", async () => {
		const list = [];
		list.push(new Position(0, 0, POSITION_TYPE.PATROL));
		list.push(new Position(0, 1, POSITION_TYPE.PATROL));
		list.push(new Position(1, 0, POSITION_TYPE.DESTROYER));
		list.push(new Position(1, 2, POSITION_TYPE.DESTROYER));
		const obj = { req: REQ_TYPE.INIT_CONNECTION, id: "one" };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.JOINED_GAME,
				at: obj.id,
				payload: {
					opponent: Lobby.EMPTY_GAME_MSG,
					gameType: GAME_TYPE.BASIC,
				},
			}),
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

	it("Accept Join Game Request", async () => {
		const obj = { req: REQ_TYPE.JOIN_GAME, id: "two", data: "one" };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.JOINED_GAME,
				at: obj.id,
				payload: { opponent: obj.data, gameType: GAME_TYPE.BASIC },
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.JOINED_GAME,
				at: obj.data,
				payload: { opponent: obj.id, gameType: GAME_TYPE.BASIC },
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "one",
				meta: "SHEEEEEESHEEEEEEEFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEESSEEEESSEEEEESEEEEEEEEEEEEEEEEEEEEEE",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "two",
				meta: "SSEEEESSEEEEESEEEEEEEEEEEEEEEEEEEEEESHEEEEEESHEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Allow Player 2 to position ships", async () => {
		const list = [];
		list.push(new Position(0, 0, POSITION_TYPE.PATROL));
		list.push(new Position(0, 1, POSITION_TYPE.PATROL));
		list.push(new Position(1, 0, POSITION_TYPE.DESTROYER));
		list.push(new Position(1, 2, POSITION_TYPE.DESTROYER));
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
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEEFFEEEEEEFFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "two",
				meta: "EEEEEEEEEEEEEEEEEEEFEEEEFFEEEEFFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Allow Player 1 to make first move", async () => {
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
				at: "one",
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEEFFEEEEEEFFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEHEEEEE",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "two",
				meta: "EEEEEEEEEEEEEEEEEEEFEEEEFFEEEEHFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Allow Player 2 to make first move", async () => {
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
				at: "one",
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEEFFEEEEEEHFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEHEEEEE",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "two",
				meta: "EEEEEEEEEEEEEEEEEEEFEEEEFFEEEEHFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEHEEEEEEE",
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Allow Player 1 to make 2nd move", async () => {
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
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEEFFEEEEEEHFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEESEEEEESEEEEE",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "two",
				meta: "EEEEEEEEEEEEEEEEEEEFEEEESFEEEESFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEHEEEEEEE",
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Allow Player 2 to make 2nd move", async () => {
		const move = {
			type: MOVE_TYPE.SOLO,
			c: 0,
			r: 1,
			to: "one",
		};
		const move_res = new Move(move);
		move_res.from = "two";
		move_res.result = MOVE_RESULT.SUNK;
		move_res.result_ship = new ShipType(SHIP_DESCRIPTOR.PATROL);
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
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEESFEEEEEESFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEESEEEEESEEEEE",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "two",
				meta: "EEEEEEEEEEEEEEEEEEEFEEEESFEEEESFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEESEEEEEEESEEEEEEE",
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Allow Player 1 to make 3nd move", async () => {
		const move = {
			type: MOVE_TYPE.SOLO,
			c: 1,
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
				at: "one",
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEESFEEEEEESFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEESEEEEESHEEEE",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "two",
				meta: "EEEEEEEEEEEEEEEEEEEFEEEESFEEEESHEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEESEEEEEEESEEEEEEE",
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Allow Player 2 to make 3nd move", async () => {
		const move = {
			type: MOVE_TYPE.SOLO,
			c: 1,
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
				at: "one",
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEESFEEEEEESHEEEEEEEEEEEEEEEEEEEEEEEEEEEEEESEEEEESHEEEE",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "two",
				meta: "EEEEEEEEEEEEEEEEEEEFEEEESFEEEESHEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEESEEEEEEESHEEEEEE",
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Allow Player 1 to make 4th move", async () => {
		const move = {
			type: MOVE_TYPE.SOLO,
			c: 1,
			r: 1,
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
				at: "one",
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEESFEEEEEESHEEEEEEEEEEEEEEEEEEEEEEEEEEEEEESHEEEESHEEEE",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "two",
				meta: "EEEEEEEEEEEEEEEEEEEFEEEESHEEEESHEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEESEEEEEEESHEEEEEE",
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Allow Player 2 to make 4th move", async () => {
		const move = {
			type: MOVE_TYPE.SOLO,
			c: 1,
			r: 1,
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
				at: "one",
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEESHEEEEEESHEEEEEEEEEEEEEEEEEEEEEEEEEEEEEESHEEEESHEEEE",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "two",
				meta: "EEEEEEEEEEEEEEEEEEEFEEEESHEEEESHEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEESHEEEEEESHEEEEEE",
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	// it("Allow Player 1 to reconnect in middle of gameplay", async () => {
	// 	const obj = { req: REQ_TYPE.INIT_CONNECTION, id: "one" };
	// 	const str = JSON.stringify(obj);
	// 	const msg = new WSClientMessage(str);
	// 	const responses = await lobby.handleReq(msg);
	// 	const results = [
	// 		new WSServerMessage({
	// 			header: SERVER_HEADERS.BOARD_UPDATE,
	// 			at: "one",
	// 			meta: "SHEEEEEESHEEEEEEEFEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEESHEEEESHEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
	// 		}),
	// 		new WSServerMessage({
	// 			header: SERVER_HEADERS.BOARD_UPDATE,
	// 			at: "two",
	// 			meta: "SHEEEESHEEEEEFEEEEEEEEEEEEEEEEEEEEEESHEEEEEESHEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
	// 		}),
	// 	];
	// 	for (let i = 0; i < responses.length; i++) {
	// 		const result = results[i];
	// 		const resp = responses[i];
	// 		expect(resp).toEqual(result);
	// 	}
	// });

	it("Allow Player 1 to win game", async () => {
		const move = {
			type: MOVE_TYPE.SOLO,
			c: 1,
			r: 2,
			to: "two",
		};
		const move_res = new Move(move);
		move_res.from = "one";
		move_res.result = MOVE_RESULT.SUNK;
		move_res.result_ship = new ShipType(SHIP_DESCRIPTOR.DESTROYER);
		const obj = { req: REQ_TYPE.MAKE_MOVE, id: move_res.from, data: move };
		const str = JSON.stringify(obj);
		const msg = new WSClientMessage(str);
		const responses = await lobby.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.MOVE_MADE,
				at: "one",
				payload: move_res,
				meta: Move.WINNER_TAG,
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.MOVE_MADE,
				at: "two",
				payload: move_res,
				meta: Move.LOSER_TAG,
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "one",
				meta: "EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEFEEEEEESHEEEEEESHEEEEEEEEEEEEEEEEEEEEEEEEESEEEESSEEEESSEEEE",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.BOARD_UPDATE,
				at: "two",
				meta: "EEEEEEEEEEEEEEEEEEESEEEESSEEEESSEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEESHEEEEEESHEEEEEE",
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.GAME_OVER,
				at: "one",
				meta: Move.WINNER_TAG,
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.GAME_OVER,
				at: "two",
				meta: Move.LOSER_TAG,
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});
});
