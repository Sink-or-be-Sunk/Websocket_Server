import { Move, MOVE_RESULT, MOVE_TYPE } from "../../src/models/gameplay/Move";

describe("Validate Player Move Requests", () => {
	it("Accepts Correct Player Move", () => {
		const obj = { c: 1, r: 2, type: MOVE_TYPE.SOLO, to: "joe" };
		const move = new Move(obj);
		expect(move).toEqual({
			c: obj.c,
			r: obj.r,
			type: obj.type,
			to: obj.to,
			from: "",
			result: MOVE_RESULT.INIT,
			result_ship: null
		});
	});

	it("Accepts Player move with stringified numbers", () => {
		const obj = { c: "1", r: "2", type: MOVE_TYPE.SOLO, to: "joe" };
		const move = new Move(obj);
		expect(move).toEqual({
			c: 1,
			r: 2,
			type: MOVE_TYPE.SOLO,
			to: obj.to,
			from: "",
			result: MOVE_RESULT.INIT,
			result_ship: null
		});
	});

	it("Rejects Invalid String Numbers", () => {
		const obj = { c: "1a", r: "2b", type: MOVE_TYPE.SOLO, at: "joe" };
		const move = new Move(obj);
		expect(move).toEqual({
			c: -1,
			r: -1,
			type: MOVE_TYPE.INVALID,
			to: "",
			from: "",
			result: MOVE_RESULT.INIT,
			result_ship: null
		});
	});

	it("Rejects Object without all Fields", () => {
		const obj = { c: 1, type: MOVE_TYPE.SOLO, to: "joe" };
		const move = new Move(obj);
		expect(move).toEqual({
			c: -1,
			r: -1,
			type:
				MOVE_TYPE.INVALID,
			to: "",
			from: "",
			result: MOVE_RESULT.INIT,
			result_ship: null
		});
	});
});
