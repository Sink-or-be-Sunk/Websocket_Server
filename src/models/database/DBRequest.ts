export class DBRequest {
	type: DB_REQ_TYPE;
	id: string;

	constructor(raw: unknown) {
		this.type = DB_REQ_TYPE.INVALID;
		this.id = "";

		try {
			if (isInstance(raw)) {
				const req = raw as DBRequest;
				this.id = req.id;
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
		if ("id" in object && "type" in object) {
			const instance = object as DBRequest;
			if (instance.type === DB_REQ_TYPE.GET_FRIENDS) {
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
