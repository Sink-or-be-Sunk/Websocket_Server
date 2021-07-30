import Move from "../server/models/Move";

describe("Validate Player Move Requests", () => {
	it("Accepts Correct Player Move", () => {
		const obj = { c: 1, r: 2, type: Move.TYPE.SOLO };
		const str = JSON.stringify(obj);
		const move = new Move(str);
		expect(move).toEqual({ c: obj.c, r: obj.r, type: obj.type });
	});

	it("Accepts Player move with stringified numbers", () => {
		const obj = { c: "1", r: "2", type: Move.TYPE.SOLO };
		const str = JSON.stringify(obj);
		const move = new Move(str);
		expect(move).toEqual({ c: 1, r: 2, type: Move.TYPE.SOLO });
	});

	it("Rejects Invalid String Numbers", () => {
		const obj = { c: "1a", r: "2b", type: Move.TYPE.SOLO };
		const str = JSON.stringify(obj);
		const move = new Move(str);
		expect(move).toEqual({ c: -1, r: -1, type: Move.TYPE.INVALID });
	});

	it("Rejects Invalid JSON string", () => {
		const str = "{ c: 1; r: 2; type: 'solo' }";
		const move = new Move(str);
		expect(move).toEqual({ c: -1, r: -1, type: Move.TYPE.BAD_FORMAT });
	});

	it("Rejects Object without all Fields", () => {
		const obj = { c: 1, type: Move.TYPE.SOLO };
		const str = JSON.stringify(obj);
		const move = new Move(str);
		expect(move).toEqual({ c: -1, r: -1, type: Move.TYPE.INVALID });
	});
});
