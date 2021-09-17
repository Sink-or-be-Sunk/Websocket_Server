import {
	RegisterRequest,
	REGISTER_TYPE,
} from "../../src/models/registration/RegisterRequest";

describe("Handle Registration Requests", () => {
	it("Accepts Init Message", () => {
		const obj = { type: REGISTER_TYPE.ENQUEUE, ssid: "wifi" };
		const msg = new RegisterRequest(obj);
		expect(msg).toEqual({ type: obj.type, ssid: obj.ssid, data: "" });
		expect(msg.isValid()).toBe(true);
	});

	it("Accepts Confirm Message", () => {
		const obj = { type: REGISTER_TYPE.CONFIRM, ssid: "wifi" };
		const msg = new RegisterRequest(obj);
		expect(msg).toEqual({ type: obj.type, ssid: obj.ssid, data: "" });
		expect(msg.isValid()).toBe(true);
	});

	it("Rejects Message with bad register type", () => {
		const obj = { type: "some random type", ssid: "wifi" };
		const msg = new RegisterRequest(obj);
		expect(msg).toEqual({
			type: REGISTER_TYPE.INVALID,
			ssid: "",
			data: "",
		});
		expect(msg.isValid()).toBe(false);
	});

	it("Rejects Message with bad json formatting", () => {
		const str = '{"type": "CONFIRM": "ssid": "wifi" }';
		const msg = new RegisterRequest(str);
		expect(msg).toEqual({
			type: REGISTER_TYPE.BAD_FORMAT,
			ssid: "",
			data: "",
		});
		expect(msg.isValid()).toBe(false);
	});
});
