import { RegistrationManager } from "../../src/models/registration/RegistrationManager"
import { REGISTER_TYPE } from "../../src/models/registration/RegisterRequest"
import { WSClientMessage, REQ_TYPE } from "../../src/util/WSClientMessage"
import ServerMessenger from "../../src/util/ServerMessenger"

describe("Validate Registration Client Messages", () => {
    const manager = new RegistrationManager();

    it("Accepts First Client Init Message", () => {
        const register = { type: REGISTER_TYPE.INIT, ssid: "wifi" };
        const obj = { req: REQ_TYPE.REGISTER, id: "one", data: register };
        const msg = new WSClientMessage(JSON.stringify(obj));
        const resp = manager.handleReq(msg);
        expect(resp).toEqual(ServerMessenger.REGISTER_PENDING)
    });

    it("Accepts Repeat Client Init Message", () => {
        const register = { type: REGISTER_TYPE.INIT, ssid: "wifi" };
        const obj = { req: REQ_TYPE.REGISTER, id: "one", data: register };
        const msg = new WSClientMessage(JSON.stringify(obj));
        const resp = manager.handleReq(msg);
        expect(resp).toEqual(ServerMessenger.REGISTER_PENDING)
    });

    it("Accepts Client Confirm Message", () => {
        const register = { type: REGISTER_TYPE.CONFIRM, ssid: "wifi" };
        const obj = { req: REQ_TYPE.CONFIRM_REGISTER, id: "one", data: register };
        const msg = new WSClientMessage(JSON.stringify(obj));
        const resp = manager.handleReq(msg);
        expect(resp).toEqual(ServerMessenger.REGISTER_SUCCESS)
    });

    it("Reject Client Confirm Message before init message", () => {
        const register = { type: REGISTER_TYPE.CONFIRM, ssid: "wifi" };
        const obj = { req: REQ_TYPE.CONFIRM_REGISTER, id: "two", data: register };
        const msg = new WSClientMessage(JSON.stringify(obj));
        const resp = manager.handleReq(msg);
        expect(resp).toEqual(ServerMessenger.bad_client_msg(RegistrationManager.ORDER_ERROR, RegistrationManager.TAG))
    });

    it("Reject client invalid msg type", () => {
        const register = { type: "not a valid type", ssid: "wifi" };
        const obj = { req: REQ_TYPE.CONFIRM_REGISTER, id: "one", data: register };
        const msg = new WSClientMessage(JSON.stringify(obj));
        const resp = manager.handleReq(msg);
        expect(resp).toEqual(ServerMessenger.bad_client_msg(JSON.stringify(register), RegistrationManager.TAG))
    });
});