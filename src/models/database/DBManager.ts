import { WSClientMessage, REQ_TYPE } from "../../util/WSClientMessage";
import { WSServerMessage, SERVER_HEADERS } from "../../util/WSServerMessage";
import { DBRequest, DB_REQ_TYPE } from "./DBRequest";
import { User, UserDocument } from "../User";
import logger from "../../util/logger";
import { FriendDocument } from "../Friend";

export class DBFriend {
	/** Username */
	user: string;
	/** Profile display name (profile.name) */
	display: string;
	constructor(user: string, display: string) {
		this.user = user;
		if (display) {
			this.display = display;
		} else {
			this.display = user;
		}
	}
}

export class DBManager {
	static readonly TAG = "REGISTRATION";
	static readonly ORDER_ERROR = "CONFIRM BEFORE REGISTER";
	private pending: Map<string, DBRequest>;
	constructor() {
		this.pending = new Map<string, DBRequest>();
	}

	public async handleReq(
		message: WSClientMessage,
	): Promise<WSServerMessage[]> {
		const req = new DBRequest(message.data);
		if (req.isValid()) {
			if (req.type == DB_REQ_TYPE.GET_FRIENDS) {
				const userDoc = (await User.findOne({ username: message.id })
					.populate({
						path: "friends",
						populate: {
							path: "recipient requester",
							select: "username profile.name",
						},
					})
					.exec()) as UserDocument;
				const list = [];
				for (let i = 0; i < userDoc.friends.length; i++) {
					const friendDoc = userDoc.friends[
						i
					] as unknown as FriendDocument;
					const recipient =
						friendDoc.recipient as unknown as UserDocument;
					const requester =
						friendDoc.requester as unknown as UserDocument;
					logger.debug(recipient);
					if (recipient.username == userDoc.username) {
						list.push(
							new DBFriend(
								requester.username,
								requester.profile.name,
							),
						);
					} else if (requester.username == userDoc.username) {
						list.push(
							new DBFriend(
								recipient.username,
								recipient.profile.name,
							),
						);
					} else {
						throw new Error(
							"User not found in Friend Document.  This should never happen!",
						);
					}
				}
				return [
					new WSServerMessage({
						header: SERVER_HEADERS.DATABASE,
						at: message.id,
						payload: list,
					}),
				];
			} else if (message.req == DB_REQ_TYPE.INVITE_TO_GAME) {
				//empty
				return [];
			}
		} else {
			//fall through case
			return [
				new WSServerMessage({
					header: SERVER_HEADERS.BAD_CLIENT_MSG,
					at: message.id,
					meta: DBManager.TAG,
				}),
			];
		}
	}

	public handles(req: string): boolean {
		if (req === REQ_TYPE.DATABASE) {
			return true;
		} else {
			return false;
		}
	}
}
