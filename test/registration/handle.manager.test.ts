import { RegistrationManager } from "../../src/models/registration/RegistrationManager";
import { REGISTER_TYPE } from "../../src/models/registration/RegisterRequest";
import { WSClientMessage, REQ_TYPE } from "../../src/util/WSClientMessage";
import { SERVER_HEADERS, WSServerMessage } from "../../src/util/WSServerMessage";

describe("Validate Registration Client Messages", () => {
	const manager = new RegistrationManager();

	it("Accepts First Client Init Message", () => {
		const register = { type: REGISTER_TYPE.INIT, ssid: "wifi" };
		const obj = { req: REQ_TYPE.REGISTER, id: "one", data: register };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const resp = manager.handleReq(msg);
		expect(resp).toEqual(new WSServerMessage({ header: SERVER_HEADERS.REGISTER_PENDING, at: obj.id }));
	});

	it("Accepts Repeat Client Init Message", () => {
		const register = { type: REGISTER_TYPE.INIT, ssid: "wifi" };
		const obj = { req: REQ_TYPE.REGISTER, id: "one", data: register };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const resp = manager.handleReq(msg);
		expect(resp).toEqual(new WSServerMessage({ header: SERVER_HEADERS.REGISTER_PENDING, at: obj.id }));
	});

	it("Accepts Client Confirm Message", () => {
		const register = { type: REGISTER_TYPE.CONFIRM, ssid: "wifi" };
		const obj = { req: REQ_TYPE.CONFIRM_REGISTER, id: "one", data: register };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const resp = manager.handleReq(msg);
		expect(resp).toEqual(new WSServerMessage({ header: SERVER_HEADERS.REGISTER_SUCCESS, at: obj.id }));
	});

	it("Reject Client Confirm Message before init message", () => {
		const register = { type: REGISTER_TYPE.CONFIRM, ssid: "wifi" };
		const obj = { req: REQ_TYPE.CONFIRM_REGISTER, id: "two", data: register };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const resp = manager.handleReq(msg);
		expect(resp).toEqual(new WSServerMessage({ header: SERVER_HEADERS.REGISTER_ORDER_ERROR, at: obj.id }));
	});

	it("Reject client invalid msg type", () => {
		const register = { type: "not a valid type", ssid: "wifi" };
		const obj = { req: REQ_TYPE.CONFIRM_REGISTER, id: "one", data: register };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const resp = manager.handleReq(msg);
		expect(resp).toEqual(new WSServerMessage({ header: SERVER_HEADERS.BAD_CLIENT_MSG, at: obj.id, meta: RegistrationManager.TAG }));
	});
});