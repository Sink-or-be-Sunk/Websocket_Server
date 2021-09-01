import {WSClientMessage, REQ_TYPE} from "../../src/util/WSClientMessage";

describe("Validate WS Client Messages", () => {
	it("Accepts New Game Message", () => {
		const obj = { req: REQ_TYPE.NEW_GAME, id: "one" };
		const str = JSON.stringify(obj);
		const msg = new WSClientMessage(str);
		expect(msg).toEqual({ req: obj.req, id: obj.id, data: "" });
	});

	it("Accepts Make Move Message with data field", () => {
		const obj = {
			req: REQ_TYPE.MAKE_MOVE,
			id: "one",
			data: "some move", //NOTE: This data field doesn't have to be valid message, just a string
		};
		const str = JSON.stringify(obj);
		const msg = new WSClientMessage(str);
		expect(msg).toEqual({ req: obj.req, id: obj.id, data: obj.data });
	});

	it("Rejects Message with invalid types", () => {
		const obj = { request: REQ_TYPE.NEW_GAME, id: "one" };
		const str = JSON.stringify(obj);
		const msg = new WSClientMessage(str);
		expect(msg).toEqual({
			req: REQ_TYPE.INVALID,
			id: "",
			data: "",
		});
	});

	it("Rejects Make Move with no data", () => {
		const obj = { req: REQ_TYPE.MAKE_MOVE, id: "one" };
		const str = JSON.stringify(obj);
		const msg = new WSClientMessage(str);
		expect(msg).toEqual({
			req: REQ_TYPE.INVALID,
			id: "",
			data: "",
		});
	});

	it("Rejects Message with bad json formatting", () => {
		const str = "{req: \"newGame\"; id: \"one\"}";
		const msg = new WSClientMessage(str);
		expect(msg).toEqual({
			req: REQ_TYPE.BAD_FORMAT,
			id: "",
			data: "",
		});
	});
});
