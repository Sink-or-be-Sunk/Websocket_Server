import ServerMessenger from "../../util/ServerMessenger";
import { WSClientMessage, REQ_TYPE } from "../../util/WSClientMessage";
import WSServerMessage from "../../util/WSServerMessage";
import WebSocket from "ws";
import { RegisterRequest } from "./RegisterRequest";
export class RegistrationManager {
    static readonly TAG = "REGISTRATION";
    static readonly ORDER_ERROR = "CONFIRM BEFORE REGISTER";
    private pending: Map<string, RegisterRequest>
    constructor() {
        this.pending = new Map();
    }

    public handleReq(
        message: WSClientMessage,
    ): WSServerMessage {
        const req = new RegisterRequest(message.data);

        if (req.isValid()) {
            if (message.req == REQ_TYPE.REGISTER) {
                if (!this.pending.has(message.id)) {
                    this.pending.set(message.id, req);
                }
                return ServerMessenger.REGISTER_PENDING;
            } else if (message.req == REQ_TYPE.CONFIRM_REGISTER) {
                if (this.pending.has(message.id)) {
                    return ServerMessenger.REGISTER_SUCCESS;
                } else {
                    return ServerMessenger.bad_client_msg(RegistrationManager.ORDER_ERROR, RegistrationManager.TAG);
                }
            }
        } else {
            return ServerMessenger.bad_client_msg(JSON.stringify(message.data), RegistrationManager.TAG);
        }

    }
}