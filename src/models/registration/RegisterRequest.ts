export class RegisterRequest {
	type: REGISTER_TYPE;
	ssid: string;

	constructor(raw: Object) {
		this.type = REGISTER_TYPE.INVALID;
		this.ssid = "";

		try {
			if (isInstance(raw)) {
				const req = raw as RegisterRequest;
				this.ssid = req.ssid;
				this.type = req.type;
			} else {
				this.type = REGISTER_TYPE.INVALID;
			}
		} catch (err) {
			this.type = REGISTER_TYPE.BAD_FORMAT;
		}
	}

	isValid(): boolean {
		if (
			this.type == REGISTER_TYPE.BAD_FORMAT ||
			this.type == REGISTER_TYPE.INVALID
		) {
			return false;
		} else {
			return true;
		}
	}

	toString() {
		return JSON.stringify(this);
	}
}
export function isInstance(object: any) {
	if ("ssid" in object && "type" in object) {
		if (
			object.type === REGISTER_TYPE.INIT ||
			object.type === REGISTER_TYPE.CONFIRM
		) {
			return true;
		}
	}
	return false;
}

export enum REGISTER_TYPE {
	INIT = "INIT",
	CONFIRM = "CONFIRM",
	INVALID = "INVALID",
	BAD_FORMAT = "BAD FORMAT"
}