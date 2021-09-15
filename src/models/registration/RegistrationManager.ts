import { WSClientMessage, REQ_TYPE } from "../../util/WSClientMessage";
import { WSServerMessage, SERVER_HEADERS } from "../../util/WSServerMessage";
import { RegisterRequest, REGISTER_TYPE } from "./RegisterRequest";
import { RegisterInfo, REGISTER_STATE } from "./RegisterInfo";

export class RegistrationManager {
	static readonly TAG = "REGISTRATION";
	static readonly DEVICE_NOT_FOUND = "DEVICE NOT FOUND";
	static readonly WAITING_FOR_MCU = "WAITING FOR MCU";
	static readonly WAITING_FOR_WEB = "WAITING FOR WEB";
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

	public handleReq(message: WSClientMessage): WSServerMessage {
		const req = new RegisterRequest(message.data);

		if (req.isValid()) {
			const tempID = req.data ? req.data : message.id;
			const device = this.pending.get(tempID);
			if (device) {
				if (req.type == REGISTER_TYPE.INITIATE) {
					if (device.state == REGISTER_STATE.WAITING_WEB_USER) {
						device.state = REGISTER_STATE.WAITING_ESP_CONFIRM;
						return new WSServerMessage({
							header: SERVER_HEADERS.REGISTER_PENDING,
							at: message.id,
							meta: RegistrationManager.WAITING_FOR_MCU,
						});
					} else {
						return new WSServerMessage({
							header: SERVER_HEADERS.REGISTER_ERROR,
							at: message.id,
							meta: device.state.toString(),
						});
					}
				} else if (req.type == REGISTER_TYPE.CONFIRM) {
					if (device.state == REGISTER_STATE.WAITING_ESP_CONFIRM) {
						this.pending.delete(tempID);
						return new WSServerMessage({
							header: SERVER_HEADERS.REGISTER_SUCCESS,
							at: message.id,
						});
					} else {
						return new WSServerMessage({
							header: SERVER_HEADERS.REGISTER_ERROR,
							at: message.id,
							meta: device.state.toString(),
						});
					}
				} else if (req.type == REGISTER_TYPE.ENQUEUE) {
					//request already in pending
					return new WSServerMessage({
						header: SERVER_HEADERS.REGISTER_PENDING,
						at: message.id,
						meta: RegistrationManager.WAITING_FOR_WEB,
					});
				}
			} else if (req.type == REGISTER_TYPE.ENQUEUE) {
				this.pending.set(message.id, new RegisterInfo(req, message.id));
				return new WSServerMessage({
					header: SERVER_HEADERS.REGISTER_PENDING,
					at: message.id,
					meta: RegistrationManager.WAITING_FOR_WEB,
				});
			} else if (req.type == REGISTER_TYPE.GET_LIST) {
				const list = Array.from(this.pending, ([, value]) => ({
					ssid: value.ssid,
					mcuID: value.mcuID,
				}));

				return new WSServerMessage({
					header: SERVER_HEADERS.WEB_REQ_SUCCESS,
					at: message.id,
					payload: list,
				});
			} else {
				return new WSServerMessage({
					header: SERVER_HEADERS.REGISTER_ERROR,
					at: message.id,
					meta: RegistrationManager.DEVICE_NOT_FOUND,
				});
			}
		}
		//fall through case
		return new WSServerMessage({
			header: SERVER_HEADERS.BAD_CLIENT_MSG,
			at: message.id,
			meta: RegistrationManager.TAG,
		});
	}
}
