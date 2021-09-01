import { Layout, LAYOUT_TYPE, Position } from "../../src/models/gameplay/Layout";

describe("Validate Layout Change from Client Message", () => {
	it("Accepts valid single element list", () => {
		const obj = { c: 0, r: 0, t: LAYOUT_TYPE.PATROL };
		const list = [obj];
		const str = JSON.stringify(list);
		const msg = new Layout(str);
		expect(msg).toEqual({
			list: [new Position(obj.c, obj.r, obj.t)],
			type: LAYOUT_TYPE.VALID,
		});
	});

	it("Accepts valid two element list", () => {
		const obj1 = { c: 0, r: 0, t: LAYOUT_TYPE.PATROL };
		const obj2 = { c: 1, r: 2, t: LAYOUT_TYPE.PATROL };
		const list = [obj1, obj2];
		const str = JSON.stringify(list);
		const msg = new Layout(str);
		expect(msg).toEqual({
			list: [
				new Position(obj1.c, obj1.r, obj1.t),
				new Position(obj2.c, obj2.r, obj2.t),
			],
			type: LAYOUT_TYPE.VALID,
		});
	});

	it("Accepts valid single element list with string (c,r)", () => {
		const obj = { c: "0", r: "0", t: LAYOUT_TYPE.PATROL };
		const list = [obj];
		const str = JSON.stringify(list);
		const msg = new Layout(str);
		expect(msg).toEqual({
			list: [new Position(0, 0, obj.t)],
			type: LAYOUT_TYPE.VALID,
		});
	});

	it("Rejects single element list with invalid string numbers", () => {
		const obj = { c: "0a", r: "0b", t: LAYOUT_TYPE.PATROL };
		const list = [obj];
		const str = JSON.stringify(list);
		const msg = new Layout(str);
		expect(msg).toEqual({
			list: [],
			type: LAYOUT_TYPE.BAD_POSITION_OBJ,
		});
	});

	it("Rejects element that isn't an array", () => {
		const obj = { c: "0", r: "0", t: LAYOUT_TYPE.PATROL };
		const list = obj;
		const str = JSON.stringify(list);
		const msg = new Layout(str);
		expect(msg).toEqual({
			list: [],
			type: LAYOUT_TYPE.BAD_ARRAY,
		});
	});

	it("Rejects invalid JSON string", () => {
		const str = "{ c: 0; r: 0, t: 'P' }";
		const msg = new Layout(str);
		expect(msg).toEqual({
			list: [],
			type: LAYOUT_TYPE.BAD_JSON,
		});
	});
});
