export class WSClientMessage {
	/** Request enum type */
	req: string;
	/** Client username */
	id: string;
	/** Optional data field holding json object */
	data: string; //TODO: MAYBE CHANGE THIS TO NULL OBJECT?

	constructor(data: string) {
		this.req = "";
		this.id = "";
		this.data = "";

		try {
			const parse = JSON.parse(data);
			if (this.isInstance(parse)) {
				this.req = parse.req;
				this.id = parse.id;
				if (parse.data) {
					this.data = parse.data;
				} else if (this.req == REQ_TYPE.MAKE_MOVE) {
					this.req = REQ_TYPE.INVALID;
					this.id = "";
				}
			} else {
				this.req = REQ_TYPE.INVALID;
			}
		} catch (err) {
			this.req = REQ_TYPE.BAD_FORMAT;
		}
	}

	public isInstance(object: any): boolean {
		if ("req" in object && "id" in object) {
			if (
				object.req === REQ_TYPE.NEW_GAME ||
				object.req === REQ_TYPE.MAKE_MOVE ||
				object.req === REQ_TYPE.JOIN_GAME ||
				object.req === REQ_TYPE.GAME_TYPE ||
				object.req === REQ_TYPE.POSITION_SHIPS ||
				object.req === REQ_TYPE.REGISTER ||
				object.req === REQ_TYPE.CONFIRM_REGISTER
			) {
				return true;
			}
		}
		return false;
	}

	isValid(): boolean {
		if (this.req == REQ_TYPE.INVALID || this.req == REQ_TYPE.BAD_FORMAT) {
			return false;
		} else {
			return true;
		}
	}

	toString(): string {
		return JSON.stringify({ req: this.req, id: this.id, data: this.data });
	}
}

export enum REQ_TYPE {
	INVALID = "INVALID",
	BAD_FORMAT = "BAD FORMAT",
	NEW_GAME = "NEW GAME",
	MAKE_MOVE = "MAKE MOVE",
	POSITION_SHIPS = "POSITION SHIPS",
	JOIN_GAME = "JOIN GAME",
	GAME_TYPE = "GAME TYPE",
	REGISTER = "REGISTER",
	CONFIRM_REGISTER = "CONFIRM REGISTER",
	GET_FRIENDS = "GET FRIENDS",
	INVITE_TO_GAME = "INVITE TO GAME",
}
