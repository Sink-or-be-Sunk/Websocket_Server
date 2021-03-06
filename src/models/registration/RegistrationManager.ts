import { WSClientMessage, REQ_TYPE } from "../../util/WSClientMessage";
import { WSServerMessage, SERVER_HEADERS } from "../../util/WSServerMessage";
import { RegisterRequest, REGISTER_TYPE } from "./RegisterRequest";
import { RegisterInfo, REGISTER_STATE } from "./RegisterInfo";
import { User } from "../User";
import logger from "../../util/logger";

export class RegistrationManager {
	static readonly TAG = "REGISTRATION";
	static readonly DEVICE_NOT_FOUND = "DEVICE NOT FOUND";
	static readonly WAITING_FOR_MCU = "WAITING FOR MCU";
	static readonly WAITING_FOR_WEB = "WAITING FOR WEB";
	static readonly WAITING_FOR_CONFIRM = "WAITING FOR CONFIRM";
	static readonly NO_DEVICE = "NO DEVICE";
	private pending: Map<string, RegisterInfo>;
	constructor() {
		this.pending = new Map<string, RegisterInfo>();
	}

	public handles(req: string): boolean {
		if (req == REQ_TYPE.REGISTRATION) {
			return true;
		} else {
			return false;
		}
	}

	public async handleReq(
		message: WSClientMessage,
	): Promise<WSServerMessage[]> {
		const req = new RegisterRequest(message.data);

		if (req.isValid()) {
			const tempID = req.data ? req.data : message.id;
			const device = this.pending.get(tempID);
			if (device) {
				if (req.type == REGISTER_TYPE.INITIATE) {
					if (device.state == REGISTER_STATE.WAITING_WEB_USER) {
						device.state = REGISTER_STATE.WAITING_ESP_CONFIRM;
						device.username = message.id;
						//server to web
						const list = [
							new WSServerMessage({
								header: SERVER_HEADERS.REGISTER_PENDING,
								at: message.id,
								meta: RegistrationManager.WAITING_FOR_MCU,
							}),
						];
						//server to mcu
						list.push(
							new WSServerMessage({
								header: SERVER_HEADERS.REGISTER_PENDING,
								at: device.mcuID,
								meta: RegistrationManager.WAITING_FOR_CONFIRM,
								payload: { username: device.username },
							}),
						);
						return list;
					} else {
						return [
							new WSServerMessage({
								header: SERVER_HEADERS.REGISTER_ERROR,
								at: message.id,
								meta: device.state.toString(),
							}),
						];
					}
				} else if (req.type == REGISTER_TYPE.CONFIRM) {
					if (device.state == REGISTER_STATE.WAITING_ESP_CONFIRM) {
						if (process.env.NODE_ENV != "test") {
							const prevOwner = await User.updateMany(
								{
									"profile.device": device.mcuID,
								},
								{ $set: { "profile.device": "" } },
							);
							//TODO: SEND AN EMAIL TO PREV OWNER THAT THEY NEED TO RECONNECT DEVICE BECAUSE ITS CHANGED OWNERS
							logger.info("previous owner document:");
							logger.info(prevOwner);

							const newOwner = await User.findOneAndUpdate(
								{
									username: device.username,
								},
								{ "profile.device": device.mcuID },
							);
							logger.info("new owner document");
							logger.info(newOwner);
						}
						this.pending.delete(tempID);
						const list = [
							new WSServerMessage({
								header: SERVER_HEADERS.REGISTER_SUCCESS,
								at: message.id,
								payload: { username: device.username },
							}),
						];
						list.push(
							new WSServerMessage({
								header: SERVER_HEADERS.REGISTER_SUCCESS,
								at: device.username,
								meta: device.mcuID,
							}),
						);
						return list;
					} else {
						return [
							new WSServerMessage({
								header: SERVER_HEADERS.REGISTER_ERROR,
								at: message.id,
								meta: device.state.toString(),
							}),
						];
					}
				} else if (req.type == REGISTER_TYPE.ENQUEUE) {
					//request already in pending
					return [
						new WSServerMessage({
							header: SERVER_HEADERS.REGISTER_PENDING,
							at: message.id,
							meta: RegistrationManager.WAITING_FOR_WEB,
						}),
					];
				} else if (req.type == REGISTER_TYPE.DEQUEUE) {
					const list = [
						new WSServerMessage({
							header: SERVER_HEADERS.TERMINATED_REGISTER,
							at: message.id,
						}),
					];

					if (device.username) {
						list.push(
							new WSServerMessage({
								header: SERVER_HEADERS.TERMINATED_REGISTER,
								at: device.username,
							}),
						);
					}

					this.pending.delete(tempID);
					return list;
				}
			} else if (req.type == REGISTER_TYPE.ENQUEUE) {
				this.pending.set(message.id, new RegisterInfo(req, message.id));
				return [
					new WSServerMessage({
						header: SERVER_HEADERS.REGISTER_PENDING,
						at: message.id,
						meta: RegistrationManager.WAITING_FOR_WEB,
					}),
				];
			} else if (req.type == REGISTER_TYPE.GET_LIST) {
				const list = Array.from(this.pending, ([, value]) => ({
					ssid: value.ssid,
					mcuID: value.mcuID,
				}));

				return [
					new WSServerMessage({
						header: SERVER_HEADERS.WEB_REQ_SUCCESS,
						at: message.id,
						payload: list,
					}),
				];
			} else if (req.type == REGISTER_TYPE.DEQUEUE) {
				return [
					new WSServerMessage({
						header: SERVER_HEADERS.INVALID_CANCEL_REGISTER,
						at: message.id,
						meta: RegistrationManager.NO_DEVICE,
					}),
				];
			} else {
				return [
					new WSServerMessage({
						header: SERVER_HEADERS.REGISTER_ERROR,
						at: message.id,
						meta: RegistrationManager.DEVICE_NOT_FOUND,
					}),
				];
			}
		}
		//fall through case
		return [
			new WSServerMessage({
				header: SERVER_HEADERS.BAD_CLIENT_MSG,
				at: message.id,
				meta: RegistrationManager.TAG,
			}),
		];
	}
}
