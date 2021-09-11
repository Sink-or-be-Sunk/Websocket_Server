import { WSClientMessage, REQ_TYPE } from "../../util/WSClientMessage";
import { WSServerMessage, SERVER_HEADERS } from "../../util/WSServerMessage";
import { RegisterRequest } from "./RegisterRequest";
export class RegistrationManager {
    static readonly TAG = "REGISTRATION";
    static readonly ORDER_ERROR = "CONFIRM BEFORE REGISTER";
    private pending: Map<string, RegisterRequest>
    constructor() {
    	this.pending = new Map<string, RegisterRequest>();
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

    			return new WSServerMessage({ header: SERVER_HEADERS.REGISTER_PENDING, at: message.id });
    		} else if (message.req == REQ_TYPE.CONFIRM_REGISTER) {
    			if (this.pending.has(message.id)) {
    				return new WSServerMessage({ header: SERVER_HEADERS.REGISTER_SUCCESS, at: message.id });
    			} else {
    				return new WSServerMessage({ header: SERVER_HEADERS.REGISTER_ORDER_ERROR, at: message.id });
    			}
    		}
    	} else {
    		return new WSServerMessage({ header: SERVER_HEADERS.BAD_CLIENT_MSG, at: message.id, meta: RegistrationManager.TAG });
    	}

    }
}