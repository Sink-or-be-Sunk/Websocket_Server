import WSServerMessage from "./WSServerMessage";

export default class ServerMessenger {
	//HEADERS FOR DYNAMIC MESSAGES
	private static readonly REQ_ERROR_HEADER: string = "REQ ERROR";
	private static readonly JOINED_HEADER: string = "JOINED GAME";
	private static readonly INVALID_MOVE_HEADER: string = "INVALID MOVE";
	private static readonly INVALID_JOIN_HEADER: string = "INVALID JOIN HEADER";
	private static readonly INVALID_LAYOUT_HEADER: string = "INVALID LAYOUT";
	private static readonly INVALID_GAME_TYPE_HEADER: string =
		"INVALID GAME TYPE";
	private static readonly FORMAT_ERROR_HEADER: string = "BAD CLIENT MESSAGE";

	//STATIC MESSAGES
	static readonly MOVE_MADE: WSServerMessage = new WSServerMessage(
		"MOVE MADE",
	);
	static readonly LAYOUT_APPROVED: WSServerMessage = new WSServerMessage(
		"LAYOUT APPROVED",
	);
	static readonly GAME_TYPE_APPROVED: WSServerMessage = new WSServerMessage(
		"GAME TYPE APPROVED",
	);
	static readonly CONNECTED: WSServerMessage = new WSServerMessage(
		"CONNECTED",
	);
	static readonly NO_SUCH_GAME: WSServerMessage = new WSServerMessage(
		"NO SUCH GAME",
	);
	static readonly TURN_ERROR: WSServerMessage = new WSServerMessage(
		"TURN ERROR",
	);
	static readonly GAME_CREATED: WSServerMessage = new WSServerMessage(
		"GAME CREATED",
	);
	static readonly REGISTER_PENDING: WSServerMessage = new WSServerMessage(
		"REGISTER PENDING",
	);
	static readonly REGISTER_SUCCESS: WSServerMessage = new WSServerMessage(
		"REGISTER SUCCESS",
	);

	// DYNAMIC MESSAGE BUILDERS
	static bad_client_msg(meta: string, tag?: string): WSServerMessage {
		const msg = tag ? `${tag}: ${meta}` : meta;
		return new WSServerMessage(this.FORMAT_ERROR_HEADER, msg);
	}
	static invalid_layout(meta: string): WSServerMessage {
		return new WSServerMessage(this.INVALID_LAYOUT_HEADER, meta);
	}
	static invalid_game_type(meta: string): WSServerMessage {
		return new WSServerMessage(this.INVALID_GAME_TYPE_HEADER, meta);
	}
	static invalid_move(meta: string): WSServerMessage {
		return new WSServerMessage(this.INVALID_MOVE_HEADER, meta);
	}
	static invalid_join(meta: string): WSServerMessage {
		return new WSServerMessage(this.INVALID_JOIN_HEADER, meta);
	}
	static joined(id: string): WSServerMessage {
		return new WSServerMessage(this.JOINED_HEADER, id);
	}

	static reqError(message: string): WSServerMessage {
		return new WSServerMessage(this.REQ_ERROR_HEADER, message);
	}
}
