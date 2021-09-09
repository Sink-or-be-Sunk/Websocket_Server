import { RegistrationManager } from "../../src/models/registration/RegistrationManager"
import { RegisterRequest, REGISTER_TYPE } from "../../src/models/registration/RegisterRequest"
import { WSClientMessage, REQ_TYPE } from "../../src/util/WSClientMessage"
import WSServerMessage from "../../src/util/WSServerMessage"
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
        const obj = { req: REQ_TYPE.REGISTER, id: "one", data: register };
        const msg = new WSClientMessage(JSON.stringify(obj));
        const resp = manager.handleReq(msg);
        expect(resp).toEqual(ServerMessenger.REGISTER_SUCCESS)
    });

});