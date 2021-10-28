import { Move } from "../models/gameplay/Move";
import { GAME_TYPE } from "../models/gameplay/Game";
import { DBFriend } from "../models/database/DBManager";

type payloadType =
	| Move
	| {
			ssid: string;
			mcuID: string;
	  }[]
	| { username: string }
	| { opponent: string; gameType: GAME_TYPE }
	| Array<DBFriend>;

type WSServerMessageOptions = {
	header: SERVER_HEADERS;
	at: string;
	meta?: string;
	payload?: payloadType;
};
export class WSServerMessage {
	header: SERVER_HEADERS;
	meta: string;
	payload: payloadType;
	at: string;
	constructor(options: WSServerMessageOptions) {
		this.header = options.header;
		this.at = options.at;
		this.meta = options.meta ?? "";
		this.payload = options.payload ?? null;
	}

	toString(): string {
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
	REFRESH = "REFRESH",
	WEB_REQ_SUCCESS = "WEB REQ SUCCESS",
	DATABASE_SUCCESS = "DATABASE SUCCESS",
	REGISTER_PENDING = "REGISTER PENDING",
	REGISTER_SUCCESS = "REGISTER SUCCESS",
	REGISTER_ERROR = "REGISTER ERROR",
	CONNECTED = "CONNECTED",
	BAD_CLIENT_MSG = "BAD CLIENT MSG",
	GAME_CREATED = "GAME CREATED",
	GAME_STARTED = "GAME STARTED",
	MOVE_MADE = "MADE MOVE",
	INVALID_MOVE = "INVALID MOVE",
	JOINED_GAME = "JOINED GAME",
	INVALID_JOIN = "INVALID JOIN",
	POSITIONED_SHIPS = "POSITIONED SHIPS",
	INVALID_LAYOUT = "INVALID LAYOUT",
	GAME_TYPE_APPROVED = "GAME TYPE APPROVED",
	INVALID_GAME_TYPE = "INVALID GAME TYPE",
}
