import { GAME_TYPE, Rules } from "../../src/models/gameplay/Game";
import {
	Layout,
	LAYOUT_TYPE,
	Position,
} from "../../src/models/gameplay/Layout";

describe("Validate Layout Change from Client Message", () => {
	const basic = new Rules(GAME_TYPE.BASIC);
	const classic = new Rules(GAME_TYPE.CLASSIC);

	it("Accepts valid basic element list", () => {
		const list = [];
		list.push({ c: 0, r: 0, t: LAYOUT_TYPE.PATROL });
		list.push({ c: 0, r: 1, t: LAYOUT_TYPE.PATROL });
		list.push({ c: 1, r: 0, t: LAYOUT_TYPE.DESTROYER });
		list.push({ c: 1, r: 2, t: LAYOUT_TYPE.DESTROYER });
		const msg = new Layout(list, basic);
		expect(msg).toEqual({
			list: [
				new Position(list[0].c, list[0].r, list[0].t),
				new Position(list[1].c, list[1].r, list[1].t),
				new Position(list[2].c, list[2].r, list[2].t),
				new Position(list[3].c, list[3].r, list[3].t),
			],
			type: LAYOUT_TYPE.VALID,
		});
	});

	it("Accepts valid basic element list with string (c,r)", () => {
		const list = [];
		list.push({ c: "0", r: "0", t: LAYOUT_TYPE.PATROL });
		list.push({ c: "0", r: "1", t: LAYOUT_TYPE.PATROL });
		list.push({ c: "1", r: "0", t: LAYOUT_TYPE.DESTROYER });
		list.push({ c: "1", r: "2", t: LAYOUT_TYPE.DESTROYER });
		const msg = new Layout(list, basic);
		expect(msg).toEqual({
			list: [
				new Position(0, 0, list[0].t),
				new Position(0, 1, list[1].t),
				new Position(1, 0, list[2].t),
				new Position(1, 2, list[3].t),
			],
			type: LAYOUT_TYPE.VALID,
		});
	});

	it("Rejects single element list with invalid string numbers", () => {
		const list = [];
		list.push({ c: "0a", r: "0", t: LAYOUT_TYPE.PATROL });
		list.push({ c: "0", r: "1b", t: LAYOUT_TYPE.PATROL });
		list.push({ c: "1", r: "0", t: LAYOUT_TYPE.DESTROYER });
		list.push({ c: "1c", r: "2", t: LAYOUT_TYPE.DESTROYER });
		const msg = new Layout(list, basic);
		expect(msg).toEqual({
			list: [],
			type: LAYOUT_TYPE.BAD_POSITION_OBJ,
		});
	});

	it("Rejects invalid array object", () => {
		const list = {} as any;
		list.obj1 = { c: 0, r: 0, t: LAYOUT_TYPE.PATROL };
		list.obj2 = { c: 0, r: 1, t: LAYOUT_TYPE.PATROL };
		list.obj3 = { c: 1, r: 0, t: LAYOUT_TYPE.DESTROYER };
		list.obj4 = { c: 1, r: 2, t: LAYOUT_TYPE.DESTROYER };
		const msg = new Layout(list, basic);
		expect(msg).toEqual({
			list: [],
			type: LAYOUT_TYPE.BAD_ARRAY,
		});
	});
});
