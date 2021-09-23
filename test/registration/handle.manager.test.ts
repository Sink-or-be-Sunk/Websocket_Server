import { RegistrationManager } from "../../src/models/registration/RegistrationManager";
import { REGISTER_TYPE } from "../../src/models/registration/RegisterRequest";
import { WSClientMessage, REQ_TYPE } from "../../src/util/WSClientMessage";
import {
	SERVER_HEADERS,
	WSServerMessage,
} from "../../src/util/WSServerMessage";

describe("Validate Registration Client Messages", () => {
	const manager = new RegistrationManager();

	it("Accepts Web Get Empty List", async () => {
		const register = { type: REGISTER_TYPE.GET_LIST, ssid: "unknown" };
		const obj = { req: REQ_TYPE.REGISTRATION, id: "WEB", data: register };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const resp = await manager.handleReq(msg);
		expect(resp).toEqual([
			new WSServerMessage({
				header: SERVER_HEADERS.WEB_REQ_SUCCESS,
				at: obj.id,
				payload: [],
			}),
		]);
	});

	it("Accepts First MCU Init Message", async () => {
		const register = { type: REGISTER_TYPE.ENQUEUE, ssid: "wifi" };
		const obj = { req: REQ_TYPE.REGISTRATION, id: "MCU", data: register };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const resp = await manager.handleReq(msg);
		expect(resp).toEqual([
			new WSServerMessage({
				header: SERVER_HEADERS.REGISTER_PENDING,
				at: obj.id,
				meta: RegistrationManager.WAITING_FOR_WEB,
			}),
		]);
	});

	it("Accepts Repeat MCU Init Message", async () => {
		const register = { type: REGISTER_TYPE.ENQUEUE, ssid: "wifi" };
		const obj = { req: REQ_TYPE.REGISTRATION, id: "MCU", data: register };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const resp = await manager.handleReq(msg);
		expect(resp).toEqual([
			new WSServerMessage({
				header: SERVER_HEADERS.REGISTER_PENDING,
				at: obj.id,
				meta: RegistrationManager.WAITING_FOR_WEB,
			}),
		]);
	});

	it("Accepts Web Get One Entry List", async () => {
		const register = { type: REGISTER_TYPE.GET_LIST, ssid: "unknown" };
		const obj = { req: REQ_TYPE.REGISTRATION, id: "WEB", data: register };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const resp = await manager.handleReq(msg);
		expect(resp).toEqual([
			new WSServerMessage({
				header: SERVER_HEADERS.WEB_REQ_SUCCESS,
				at: obj.id,
				payload: [{ ssid: "wifi", mcuID: "MCU" }],
			}),
		]);
	});

	it("Accepts WEB initiate Message", async () => {
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
		const responses = await manager.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.REGISTER_PENDING,
				meta: RegistrationManager.WAITING_FOR_MCU,
				at: obj.id,
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.REGISTER_PENDING,
				at: "MCU",
				meta: obj.id,
			}),
		];
		for (let i = 0; i < results.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Accepts MCU Confirm Message", async () => {
		const register = { type: REGISTER_TYPE.CONFIRM, ssid: "wifi" };
		const obj = {
			req: REQ_TYPE.REGISTRATION,
			id: "MCU",
			data: register,
		};
		const msg = new WSClientMessage(JSON.stringify(obj));
		const responses = await manager.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.REGISTER_SUCCESS,
				at: obj.id,
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.REGISTER_SUCCESS,
				at: "WEB",
				meta: obj.id,
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Accepts MCU Enqueue Message", async () => {
		const obj = {
			id: "12345",
			req: REQ_TYPE.REGISTRATION,
			data: {
				type: REGISTER_TYPE.ENQUEUE,
				ssid: "test wifi",
			},
		};
		const msg = new WSClientMessage(JSON.stringify(obj));
		const responses = await manager.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.REGISTER_PENDING,
				at: obj.id,
				meta: RegistrationManager.WAITING_FOR_WEB,
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Accepts Web Initiate Message", async () => {
		const obj = {
			id: "WEB",
			req: REQ_TYPE.REGISTRATION,
			data: {
				type: REGISTER_TYPE.INITIATE,
				ssid: "test wifi",
				data: "12345",
			},
		};
		const msg = new WSClientMessage(JSON.stringify(obj));
		const responses = await manager.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.REGISTER_PENDING,
				at: obj.id,
				meta: RegistrationManager.WAITING_FOR_MCU,
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.REGISTER_PENDING,
				at: "12345",
				meta: obj.id,
			}),
		];
		for (let i = 0; i < responses.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
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
