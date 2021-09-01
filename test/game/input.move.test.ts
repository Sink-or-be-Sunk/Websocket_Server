import { Move, MOVE_TYPE } from "../../src/models/gameplay/Move";

describe("Validate Player Move Requests", () => {
	it("Accepts Correct Player Move", () => {
		const obj = { c: 1, r: 2, type: MOVE_TYPE.SOLO, at: "joe" };
		const str = JSON.stringify(obj);
		const move = new Move(str);
		expect(move).toEqual({
			c: obj.c,
			r: obj.r,
			type: obj.type,
			at: obj.at,
		});
	});

	it("Accepts Player move with stringified numbers", () => {
		const obj = { c: "1", r: "2", type: MOVE_TYPE.SOLO, at: "joe" };
		const str = JSON.stringify(obj);
		const move = new Move(str);
		expect(move).toEqual({ c: 1, r: 2, type: MOVE_TYPE.SOLO, at: obj.at });
	});

	it("Rejects Invalid String Numbers", () => {
		const obj = { c: "1a", r: "2b", type: MOVE_TYPE.SOLO, at: "joe" };
		const str = JSON.stringify(obj);
		const move = new Move(str);
		expect(move).toEqual({
			c: -1,
			r: -1,
			type: MOVE_TYPE.INVALID,
			at: "",
		});
	});

	it("Rejects Invalid JSON string", () => {
		const str = "{ c: 1; r: 2; type: 'solo'; at: 'joe'}";
		const move = new Move(str);
		expect(move).toEqual({
			c: -1,
			r: -1,
			type: MOVE_TYPE.BAD_FORMAT,
			at: "",
		});
	});

	it("Rejects Object without all Fields", () => {
		const obj = { c: 1, type: MOVE_TYPE.SOLO, at: "joe" };
		const str = JSON.stringify(obj);
		const move = new Move(str);
		expect(move).toEqual({ c: -1, r: -1, type: MOVE_TYPE.INVALID, at: "" });
	});
});
