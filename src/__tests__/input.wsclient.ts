import WSClientMessage from "../server/models/WSClientMessage";
import Move from "../server/models/Move";

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

describe("Validate Moves from Client Message", () => {
	it("Accepts Solo Move to Origin", () => {
		const obj = { type: Move.TYPE.SOLO, c: 0, r: 0 };
		const str = JSON.stringify(obj);
		const msg = new Move(str);
		expect(msg).toEqual({ type: obj.type, c: obj.c, r: obj.r });
	});

	it("Accepts Solo Move with string c,r", () => {
		const obj = { type: Move.TYPE.SOLO, c: "0", r: "0" };
		const str = JSON.stringify(obj);
		const msg = new Move(str);
		expect(msg).toEqual({ type: obj.type, c: 0, r: 0 });
	});

	it("Rejects Solo Move with invalid string c,r", () => {
		const obj = { type: Move.TYPE.SOLO, c: "0a", r: "0b" };
		const str = JSON.stringify(obj);
		const msg = new Move(str);
		expect(msg).toEqual({ type: Move.TYPE.INVALID, c: -1, r: -1 });
	});

	it("Rejects Move with invalid fields", () => {
		const obj = { tYpE: Move.TYPE.SOLO, c: "0a", r: "0b" };
		const str = JSON.stringify(obj);
		const msg = new Move(str);
		expect(msg).toEqual({ type: Move.TYPE.INVALID, c: -1, r: -1 });
	});

	it("Rejects Solo Move with invalid json format", () => {
		const str = '{ type: "solo", c: 0, r: 0 }';
		const msg = new Move(str);
		expect(msg).toEqual({ type: Move.TYPE.BAD_FORMAT, c: -1, r: -1 });
	});
});