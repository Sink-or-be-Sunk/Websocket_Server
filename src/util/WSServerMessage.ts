import { Move } from "../models/gameplay/Move";
import { Response } from "../models/gameplay/Game";

type WSServerMessageOptions = {
	header: SERVER_HEADERS;
	at: string;
	meta?: string;
	payload?: Move;
};
export class WSServerMessage {
	header: SERVER_HEADERS;
	meta: string;
	payload: Move;
	at: string;
	constructor(options: WSServerMessageOptions) {
		this.header = options.header;
		this.at = options.at;
		this.meta = options.meta ?? "";
		this.payload = options.payload ?? null;
	}

	toString() {
		const obj = { header: this.header } as any;
		if (this.meta !== "") {
			obj.meta = this.meta;
		}
		if (this.payload) {
			obj.payload = this.payload;
		}
		return JSON.stringify(obj);
	}
}

export enum SERVER_HEADERS {
	REGISTER_PENDING = "REGISTER PENDING",
	REGISTER_SUCCESS = "REGISTER SUCCESS",
	REGISTER_ORDER_ERROR = "REGISTER ORDER ERROR",
	CONNECTED = "CONNECTED",
	BAD_CLIENT_MSG = "BAD CLIENT MSG",
	GAME_ALREADY_EXISTS = "GAME ALREADY EXISTS",
	GAME_CREATED = "GAME CREATED",
	MOVE_MADE = "MADE MOVE",
	INVALID_MOVE = "INVALID MOVE",
	JOINED_GAME = "JOINED GAME",
	INVALID_JOIN = "INVALID JOIN",
	POSITIONED_SHIPS = "POSITIONED SHIPS",
	INVALID_LAYOUT = "INVALID LAYOUT",
	GAME_TYPE_APPROVED = "GAME TYPE APPROVED",
	INVALID_GAME_TYPE = "INVALID GAME TYPE",
}
