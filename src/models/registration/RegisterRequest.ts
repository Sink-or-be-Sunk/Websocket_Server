export class RegisterRequest {
	type: REGISTER_TYPE;
	ssid: string;
	data: string;

	constructor(raw: any) {
		this.type = REGISTER_TYPE.INVALID;
		this.ssid = "";
		this.data = "";

		try {
			if (isInstance(raw)) {
				const req = raw as RegisterRequest;
				this.ssid = req.ssid;
				this.type = req.type;
				if (req.data) {
					this.data = req.data;
				}
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

	toString(): string {
		return JSON.stringify(this);
	}
}
export function isInstance(object: any): boolean {
	if ("ssid" in object && "type" in object) {
		if (
			object.type === REGISTER_TYPE.ENQUEUE ||
			object.type === REGISTER_TYPE.CONFIRM ||
			object.type === REGISTER_TYPE.INITIATE ||
			object.type === REGISTER_TYPE.GET_LIST
		) {
			return true;
		}
	}
	return false;
}

export enum REGISTER_TYPE {
	/** client wants on registration pending list */
	ENQUEUE = "ENQUEUE",
	/** web client initiate pairing */
	INITIATE = "INITIATE",
	/** client confirms registration match */
	CONFIRM = "CONFIRM",
	/** web client able to get list of pending devices */
	GET_LIST = "GET_LIST",
	INVALID = "INVALID",
	BAD_FORMAT = "BAD FORMAT",
}
