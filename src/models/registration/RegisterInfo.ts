import { RegisterRequest } from "./RegisterRequest";

export class RegisterInfo {
	ssid: string;
	mcuID: string;
	username: string;
	state: REGISTER_STATE;

	constructor(req: RegisterRequest, mcuID: string) {
		this.ssid = req.ssid;
		this.mcuID = mcuID;
		this.state = REGISTER_STATE.WAITING_WEB_USER;
	}
}

export enum REGISTER_STATE {
	WAITING_WEB_USER,
	WAITING_ESP_CONFIRM,
}
