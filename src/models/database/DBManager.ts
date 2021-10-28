import { WSClientMessage, REQ_TYPE } from "../../util/WSClientMessage";
import { WSServerMessage, SERVER_HEADERS } from "../../util/WSServerMessage";
import { DBRequest, DB_REQ_TYPE } from "./DBRequest";
import { User, UserDocument } from "../User";
import logger from "../../util/logger";
import { FriendDocument } from "../Friend";
import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
	static readonly TAG = "DATABASE";
	static readonly INVITE_SENT = "INVITE SENT";
	static readonly LIST_SENT = "LIST SENT";
	private pending: Map<string, DBRequest>;
	constructor() {
		this.pending = new Map<string, DBRequest>();
	}

	public static chooseUserDoc(
		doc: FriendDocument,
		username: string,
	): UserDocument {
		const recipient = doc.recipient as unknown as UserDocument;
		const requester = doc.requester as unknown as UserDocument;
		if (recipient.username == username) {
			return requester;
		} else if (requester.username == username) {
			return recipient;
		} else {
			throw new Error(
				"User not found in Friend Document.  This should never happen!",
			);
		}
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

					const friendUserDoc = DBManager.chooseUserDoc(
						friendDoc,
						userDoc.username,
					);

					list.push(
						new DBFriend(
							friendUserDoc.username,
							friendUserDoc.profile.name,
						),
					);
				}

				return [
					new WSServerMessage({
						header: SERVER_HEADERS.DATABASE_SUCCESS,
						at: message.id,
						payload: list,
						meta: DBManager.LIST_SENT,
					}),
				];
			} else if (req.type == DB_REQ_TYPE.INVITE_TO_GAME) {
				const userDoc = (await User.findOne({
					username: message.id,
				})) as UserDocument;

				const friendDoc = (await User.findOne({
					username: req.data,
				})) as UserDocument;

				const userDN = userDoc.profile.name
					? `${userDoc.profile.name} (${userDoc.username})`
					: userDoc.username;

				const friendDN = friendDoc.profile.name
					? `${friendDoc.profile.name} (${friendDoc.username})`
					: friendDoc.username;

				const mailOptions = {
					to: friendDoc.email,
					from: "SinkOrBeSunkRobot@gmail.com",
					subject: "Game Invite",
					text: `Hello ${friendDN}, ${userDN} invited you to play a game!`,
				};

				sgMail.send(mailOptions, undefined, (err) => {
					if (err) {
						logger.error(err);
					}
					logger.info(
						`Email invite sent from <${userDoc.username}> to <${mailOptions.to}>`,
					);
				});
				return [
					new WSServerMessage({
						header: SERVER_HEADERS.DATABASE_SUCCESS,
						at: message.id,
						meta: DBManager.INVITE_SENT,
					}),
				];
			}
		}
		//fall through case
		return [
			new WSServerMessage({
				header: SERVER_HEADERS.BAD_CLIENT_MSG,
				at: message.id,
				meta: DBManager.TAG,
			}),
		];
	}

	public handles(req: string): boolean {
		if (req === REQ_TYPE.DATABASE) {
			return true;
		} else {
			return false;
		}
	}
}
