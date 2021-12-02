import { RegistrationManager } from "../../src/models/registration/RegistrationManager";
import { REGISTER_TYPE } from "../../src/models/registration/RegisterRequest";
import { WSClientMessage, REQ_TYPE } from "../../src/util/WSClientMessage";
import {
	SERVER_HEADERS,
	WSServerMessage,
} from "../../src/util/WSServerMessage";

describe("Validate Registration Client Cancellation Message After Enqueue", () => {
	const manager = new RegistrationManager();

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

	it("Accepts MCU Cancel Message", async () => {
		const register = { type: REGISTER_TYPE.DEQUEUE, ssid: "wifi" };
		const obj = { req: REQ_TYPE.REGISTRATION, id: "MCU", data: register };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const resp = await manager.handleReq(msg);
		expect(resp).toEqual([
			new WSServerMessage({
				header: SERVER_HEADERS.TERMINATED_REGISTER,
				at: obj.id,
			}),
		]);
	});
});

describe("Validate Registration Client Cancellation Message After Web Initiate", () => {
	const manager = new RegistrationManager();

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
				meta: RegistrationManager.WAITING_FOR_CONFIRM,
				payload: { username: obj.id },
			}),
		];
		for (let i = 0; i < results.length; i++) {
			const result = results[i];
			const resp = responses[i];
			expect(resp).toEqual(result);
		}
	});

	it("Accepts MCU Cancel Message after web initiation", async () => {
		const register = { type: REGISTER_TYPE.DEQUEUE, ssid: "wifi" };
		const obj = { req: REQ_TYPE.REGISTRATION, id: "MCU", data: register };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const responses = await manager.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.TERMINATED_REGISTER,
				at: obj.id,
			}),
			new WSServerMessage({
				header: SERVER_HEADERS.TERMINATED_REGISTER,
				at: "WEB",
			}),
		];

		for (let i = 0; i < responses.length; i++) {
			const resp = responses[i];
			const result = results[i];
			expect(resp).toEqual(result);
		}
	});
});

describe("Reject Registration Client Cancellation Message After MCU Confirm", () => {
	const manager = new RegistrationManager();

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
				meta: RegistrationManager.WAITING_FOR_CONFIRM,
				payload: { username: obj.id },
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
				payload: { username: "WEB" },
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

	it("Reject MCU Cancel Message after pairing complete", async () => {
		const register = { type: REGISTER_TYPE.DEQUEUE, ssid: "wifi" };
		const obj = { req: REQ_TYPE.REGISTRATION, id: "MCU", data: register };
		const msg = new WSClientMessage(JSON.stringify(obj));
		const responses = await manager.handleReq(msg);
		const results = [
			new WSServerMessage({
				header: SERVER_HEADERS.INVALID_CANCEL_REGISTER,
				at: obj.id,
				meta: RegistrationManager.NO_DEVICE,
			}),
		];

		for (let i = 0; i < responses.length; i++) {
			const resp = responses[i];
			const result = results[i];
			expect(resp).toEqual(result);
		}
	});
});
