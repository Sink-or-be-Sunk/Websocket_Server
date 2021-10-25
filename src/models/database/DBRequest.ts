export class DBRequest {
	type: DB_REQ_TYPE;
	data: string;

	constructor(raw: unknown) {
		this.type = DB_REQ_TYPE.INVALID;
		this.data = "";

		try {
			if (isInstance(raw)) {
				const req = raw as DBRequest;
				this.data = req.data;
				this.type = req.type;
			} else {
				this.type = DB_REQ_TYPE.INVALID;
			}
		} catch (err) {
			this.type = DB_REQ_TYPE.BAD_FORMAT;
		}
	}

	isValid(): boolean {
		if (
			this.type == DB_REQ_TYPE.BAD_FORMAT ||
			this.type == DB_REQ_TYPE.INVALID
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
export function isInstance(object: unknown): boolean {
	if (typeof object === "object" && object !== null) {
		if ("type" in object) {
			const instance = object as DBRequest;
			if (
				instance.type === DB_REQ_TYPE.GET_FRIENDS ||
				instance.type == DB_REQ_TYPE.INVITE_TO_GAME
			) {
				return true;
			}
		}
	}
	return false;
}

export enum DB_REQ_TYPE {
	GET_FRIENDS = "GET FRIENDS",
	INVITE_TO_GAME = "INVITE TO GAME",
	INVALID = "INVALID",
	BAD_FORMAT = "BAD FORMAT",
}
