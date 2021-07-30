import Layout from "../server/models/Layout";

describe("Validate Layout Change from Client Message", () => {
	it("Accepts valid single element list", () => {
		const obj = { c: 0, r: 0, o: Layout.Orientation.HORIZONTAL };
		const list = [obj];
		const str = JSON.stringify(list);
		const msg = new Layout(str);
		expect(msg).toEqual({
			list: [new Layout.Position(obj.c, obj.r, obj.o)],
			type: Layout.TYPE.VALID,
		});
	});

	//TODO: ADD MORE TEST CASES
});
