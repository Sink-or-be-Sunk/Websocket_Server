import Move from "../server/models/Move";
import WSClientMessage from "../server/models/WSClientMessage";

describe("Validate Player Move Requests", () => {
	it("Accepts Correct Player Move", () => {
		const obj = { x: 1, y: 2, type: Move.TYPE.SOLO };
		const str = JSON.stringify(obj);
		const move = new Move(str);
		expect(move).toEqual({ x: obj.x, y: obj.y, type: obj.type });
	});

	it("Accepts Player move with stringified numbers", () => {
		const obj = { x: "1", y: "2", type: Move.TYPE.SOLO };
		const str = JSON.stringify(obj);
		const move = new Move(str);
		expect(move).toEqual({ x: 1, y: 2, type: Move.TYPE.SOLO });
	});

	it("Rejects Invalid String Numbers", () => {
		const obj = { x: "1a", y: "2b", type: Move.TYPE.SOLO };
		const str = JSON.stringify(obj);
		const move = new Move(str);
		expect(move).toEqual({ x: -1, y: -1, type: Move.TYPE.INVALID });
	});

	it("Rejects Invalid JSON string", () => {
		const str = "{ x: 1; y: 2; type: 'solo' }";
		const move = new Move(str);
		expect(move).toEqual({ x: -1, y: -1, type: Move.TYPE.BAD_FORMAT });
	});

	it("Rejects Object without all Fields", () => {
		const obj = { x: 1, type: Move.TYPE.SOLO };
		const str = JSON.stringify(obj);
		const move = new Move(str);
		expect(move).toEqual({ x: -1, y: -1, type: Move.TYPE.INVALID });
	});
});

describe("Validate WS Client Messages", () => {
	it("Accepts New Game Message", () => {
		const obj = { req: WSClientMessage.REQ_TYPE.NEW_GAME, id: "one" };
		const str = JSON.stringify(obj);
		const msg = new WSClientMessage(str);
		expect(msg).toEqual({ req: obj.req, id: obj.id, data: "" });
	});

	it("Accepts Make Move Message with data field", () => {
		const obj = {
			req: WSClientMessage.REQ_TYPE.MAKE_MOVE,
			id: "one",
			data: "some move", //NOTE: This data field doesn't have to be valid message, just a string
		};
		const str = JSON.stringify(obj);
		const msg = new WSClientMessage(str);
		expect(msg).toEqual({ req: obj.req, id: obj.id, data: obj.data });
	});

	it("Rejects Message with invalid types", () => {
		const obj = { request: WSClientMessage.REQ_TYPE.NEW_GAME, id: "one" };
		const str = JSON.stringify(obj);
		const msg = new WSClientMessage(str);
		expect(msg).toEqual({
			req: WSClientMessage.REQ_TYPE.INVALID,
			id: "",
			data: "",
		});
	});

	it("Rejects Make Move with no data", () => {
		const obj = { req: WSClientMessage.REQ_TYPE.MAKE_MOVE, id: "one" };
		const str = JSON.stringify(obj);
		const msg = new WSClientMessage(str);
		expect(msg).toEqual({
			req: WSClientMessage.REQ_TYPE.INVALID,
			id: "",
			data: "",
		});
	});

	it("Rejects Message with bad json formatting", () => {
		const str = '{req: "newGame"; id: "one"}';
		const msg = new WSClientMessage(str);
		expect(msg).toEqual({
			req: WSClientMessage.REQ_TYPE.BAD_FORMAT,
			id: "",
			data: "",
		});
	});
});
