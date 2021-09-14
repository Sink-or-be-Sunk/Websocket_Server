import { RegistrationManager } from "../../src/models/registration/RegistrationManager";
import { REGISTER_TYPE } from "../../src/models/registration/RegisterRequest";
import { WSClientMessage, REQ_TYPE } from "../../src/util/WSClientMessage";
import {
	SERVER_HEADERS,
	WSServerMessage,
} from "../../src/util/WSServerMessage";

describe("Validate Registration Client Messages", () => {
	const manager = new RegistrationManager();

	it("Accepts First MCU Init Message", () => {
		const register = { type: REGISTER_TYPE.ENQUEUE, ssid: "wifi" };
		const obj = { req: REQ_TYPE.REGISTRATION, id: "MCU", data: register };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const resp = manager.handleReq(msg);
		expect(resp).toEqual(
			new WSServerMessage({
				header: SERVER_HEADERS.REGISTER_PENDING,
				at: obj.id,
				meta: RegistrationManager.WAITING_FOR_WEB,
			}),
		);
	});

	it("Accepts Repeat MCU Init Message", () => {
		const register = { type: REGISTER_TYPE.ENQUEUE, ssid: "wifi" };
		const obj = { req: REQ_TYPE.REGISTRATION, id: "MCU", data: register };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const resp = manager.handleReq(msg);
		expect(resp).toEqual(
			new WSServerMessage({
				header: SERVER_HEADERS.REGISTER_PENDING,
				at: obj.id,
				meta: RegistrationManager.WAITING_FOR_WEB,
			}),
		);
	});

	it("Accepts WEB initiate Message", () => {
		const register = {
			type: REGISTER_TYPE.INITIATE,
			ssid: "wifi",
			data: "MCU",
		};
		const obj = {
			req: REQ_TYPE.REGISTRATION,
			id: "WEB",
			data: register,
		};
		const msg = new WSClientMessage(JSON.stringify(obj));
		const resp = manager.handleReq(msg);
		expect(resp).toEqual(
			new WSServerMessage({
				header: SERVER_HEADERS.REGISTER_PENDING,
				meta: RegistrationManager.WAITING_FOR_MCU,
				at: obj.id,
			}),
		);
	});

	it("Accepts MCU Confirm Message", () => {
		const register = { type: REGISTER_TYPE.CONFIRM, ssid: "wifi" };
		const obj = {
			req: REQ_TYPE.REGISTRATION,
			id: "MCU",
			data: register,
		};
		const msg = new WSClientMessage(JSON.stringify(obj));
		const resp = manager.handleReq(msg);
		expect(resp).toEqual(
			new WSServerMessage({
				header: SERVER_HEADERS.REGISTER_SUCCESS,
				at: obj.id,
			}),
		);
	});

	// it("Reject Client Confirm Message before init message", () => {
	// 	const register = { type: REGISTER_TYPE.CONFIRM, ssid: "wifi" };
	// 	const obj = {
	// 		req: REQ_TYPE.REGISTRATION,
	// 		id: "",
	// 		data: register,
	// 	};
	// 	const msg = new WSClientMessage(JSON.stringify(obj));
	// 	const resp = manager.handleReq(msg);
	// 	expect(resp).toEqual(
	// 		new WSServerMessage({
	// 			header: SERVER_HEADERS.REGISTER_ERROR,
	// 			at: obj.id,
	// 		}),
	// 	);
	// });

	// it("Reject client invalid msg type", () => {
	// 	const register = { type: "not a valid type", ssid: "wifi" };
	// 	const obj = {
	// 		req: REQ_TYPE.REGISTRATION,
	// 		id: "one",
	// 		data: register,
	// 	};
	// 	const msg = new WSClientMessage(JSON.stringify(obj));
	// 	const resp = manager.handleReq(msg);
	// 	expect(resp).toEqual(
	// 		new WSServerMessage({
	// 			header: SERVER_HEADERS.BAD_CLIENT_MSG,
	// 			at: obj.id,
	// 			meta: RegistrationManager.TAG,
	// 		}),
	// 	);
	// });
});
