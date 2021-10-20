import { WSClientMessage, REQ_TYPE } from "../../util/WSClientMessage";
import { WSServerMessage, SERVER_HEADERS } from "../../util/WSServerMessage";
import { DBRequest } from "./DBRequest";
import { User } from "../User";
import logger from "../../util/logger";

export class DBManager {
	static readonly TAG = "REGISTRATION";
	static readonly ORDER_ERROR = "CONFIRM BEFORE REGISTER";
	private pending: Map<string, DBRequest>;
	constructor() {
		this.pending = new Map<string, DBRequest>();
	}

	// public async handleReq(message: WSClientMessage): WSServerMessage {
	// 	const req = new DBRequest(message.data);

	// 	if (req.isValid()) {
	// 		if (message.req == REQ_TYPE.GET_FRIENDS) {
	// 			//empty
	// 		}
	// 		// else if (message.req == REQ_TYPE.INVITE_TO_GAME) {
	// 		// 	//empty
	// 		// }
	// 	} else {
	// 		return new WSServerMessage({
	// 			header: SERVER_HEADERS.BAD_CLIENT_MSG,
	// 			at: message.id,
	// 			meta: DBManager.TAG,
	// 		});
	// 	}
	// }

	public handles(req: string): boolean {
		if (req === REQ_TYPE.GET_FRIENDS || req === REQ_TYPE.INVITE_TO_GAME) {
			return true;
		} else {
			return false;
		}
	}

	public async getFriends(id: string): Promise<void> {
		const doc = await User.findOne({ username: id });
		logger.info(doc);
	}
}
