import Move from "../server/models/Move";

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
