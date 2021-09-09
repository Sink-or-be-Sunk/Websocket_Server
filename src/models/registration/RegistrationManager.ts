import ServerMessenger from "../../util/ServerMessenger";
import { WSClientMessage, REQ_TYPE } from "../../util/WSClientMessage";
import WSServerMessage from "../../util/WSServerMessage";
import WebSocket from "ws";
import { RegisterRequest } from "./RegisterRequest";
export class RegistrationManager {
    private pending: Map<string, RegisterRequest>
    static readonly TAG = "REGISTRATION"

    constructor() {
        this.pending = new Map();
    }

    public handleReq(
        socket: WebSocket,
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
                    return ServerMessenger.bad_client_msg("CONFIRM BEFORE REGISTER", RegistrationManager.TAG);
                }
            }
        } else {
            return ServerMessenger.bad_client_msg(message.data, RegistrationManager.TAG);
        }

    }
}