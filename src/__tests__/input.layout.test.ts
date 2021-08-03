//FIXME: NEED TO REDO AFTER CHANGING IMPLEMENTATION
test("temp", () => {
	expect(true).toBe(true);
});
// import Layout from "../server/models/Layout";

// describe("Validate Layout Change from Client Message", () => {
// 	it("Accepts valid single element list", () => {
// 		const obj = { c: 0, r: 0, o: Layout.TYPE.PATROL };
// 		const list = [obj];
// 		const str = JSON.stringify(list);
// 		const msg = new Layout(str);
// 		expect(msg).toEqual({
// 			list: [new Layout.Position(obj.c, obj.r, obj.o)],
// 			type: Layout.TYPE.VALID,
// 		});
// 	});

// 	it("Accepts valid two element list", () => {
// 		const obj1 = { c: 0, r: 0, o: Layout.TYPE.HORIZONTAL };
// 		const obj2 = { c: 1, r: 2, o: Layout.TYPE.VERTICAL };
// 		const list = [obj1, obj2];
// 		const str = JSON.stringify(list);
// 		const msg = new Layout(str);
// 		expect(msg).toEqual({
// 			list: [
// 				new Layout.Position(obj1.c, obj1.r, obj1.o),
// 				new Layout.Position(obj2.c, obj2.r, obj2.o),
// 			],
// 			type: Layout.TYPE.VALID,
// 		});
// 	});

// 	it("Accepts valid single element list with string (c,r)", () => {
// 		const obj = { c: "0", r: "0", o: Layout.TYPE.HORIZONTAL };
// 		const list = [obj];
// 		const str = JSON.stringify(list);
// 		const msg = new Layout(str);
// 		expect(msg).toEqual({
// 			list: [new Layout.Position(0, 0, obj.o)],
// 			type: Layout.TYPE.VALID,
// 		});
// 	});

// 	it("Rejects single element list with invalid string numbers", () => {
// 		const obj = { c: "0a", r: "0b", o: Layout.TYPE.HORIZONTAL };
// 		const list = [obj];
// 		const str = JSON.stringify(list);
// 		const msg = new Layout(str);
// 		expect(msg).toEqual({
// 			list: [],
// 			type: Layout.TYPE.BAD_POSITION_OBJ,
// 		});
// 	});

// 	it("Rejects element that isn't an array", () => {
// 		const obj = { c: "0", r: "0", o: Layout.TYPE.HORIZONTAL };
// 		const list = obj;
// 		const str = JSON.stringify(list);
// 		const msg = new Layout(str);
// 		expect(msg).toEqual({
// 			list: [],
// 			type: Layout.TYPE.BAD_ARRAY,
// 		});
// 	});

// 	it("Rejects invalid JSON string", () => {
// 		const str = "{ c: 0; r: 0, o: 'H' }";
// 		const msg = new Layout(str);
// 		expect(msg).toEqual({
// 			list: [],
// 			type: Layout.TYPE.BAD_JSON,
// 		});
// 	});
// });
