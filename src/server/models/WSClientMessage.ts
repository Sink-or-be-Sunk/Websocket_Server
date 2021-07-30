class WSClientMessage {
	req: string;
	id: string;
	data: string;

	constructor(data: string) {
		this.req = "";
		this.id = "";
		this.data = "";

		try {
			const parse = JSON.parse(data);
			if (WSClientMessage.isInstance(parse)) {
				this.req = parse.req;
				this.id = parse.id;
				if (parse.data) {
					this.data = parse.data;
				} else if (this.req == WSClientMessage.REQ_TYPE.MAKE_MOVE) {
					this.req = WSClientMessage.REQ_TYPE.INVALID;
					this.id = "";
				}
			} else {
				this.req = WSClientMessage.REQ_TYPE.INVALID;
			}
		} catch (err) {
			this.req = WSClientMessage.REQ_TYPE.BAD_FORMAT;
		}
	}

	toString() {
		return JSON.stringify({ req: this.req, id: this.id, data: this.data });
	}
}

namespace WSClientMessage {
	export enum REQ_TYPE {
		INVALID = "INVALID",
		BAD_FORMAT = "BAD FORMAT",
		NEW_GAME = "NEW GAME",
		MAKE_MOVE = "MAKE MOVE",
		POSITION_SHIPS = "POSITION SHIPS",
		JOIN_GAME = "JOIN GAME",
	}

	export function isInstance(object: any) {
		if ("req" in object && "id" in object) {
			if (
				object.req === WSClientMessage.REQ_TYPE.NEW_GAME ||
				object.req === WSClientMessage.REQ_TYPE.MAKE_MOVE ||
				object.req === WSClientMessage.REQ_TYPE.JOIN_GAME
			) {
				return true;
			}
		}
		return false;
	}
}

export default WSClientMessage;
