import WSServerMessage from "./WSServerMessage";

export default class ServerMessenger {
	//HEADERS FOR DYNAMIC MESSAGES
	private static readonly REQ_ERROR_HEADER: string = "REQ ERROR";
	private static readonly JOINED_HEADER: string = "JOINED GAME";
	private static readonly INVALID_MOVE_HEADER: string = "INVALID MOVE";
	private static readonly INVALID_LAYOUT_HEADER: string = "INVALID LAYOUT";

	//STATIC MESSAGES
	static readonly MOVE_MADE: WSServerMessage = new WSServerMessage(
		"MOVE MADE",
	);
	static readonly LAYOUT_APPROVED: WSServerMessage = new WSServerMessage(
		"LAYOUT APPROVED",
	);
	static readonly CONNECTED: WSServerMessage = new WSServerMessage(
		"CONNECTED",
	);
	static readonly NO_SUCH_GAME: WSServerMessage = new WSServerMessage(
		"NO SUCH GAME",
	);
	static readonly FORMAT_ERROR: WSServerMessage = new WSServerMessage(
		"FORMAT ERROR",
	);
	static readonly TURN_ERROR: WSServerMessage = new WSServerMessage(
		"TURN ERROR",
	);
	static readonly GAME_CREATED: WSServerMessage = new WSServerMessage(
		"GAME CREATED",
	);

	// DYNAMIC MESSAGE BUILDERS
	static invalid_layout(meta: string): WSServerMessage {
		return new WSServerMessage(this.INVALID_LAYOUT_HEADER, meta);
	}
	static invalid_move(meta: string): WSServerMessage {
		return new WSServerMessage(this.INVALID_MOVE_HEADER, meta);
	}
	static joined(id: string): WSServerMessage {
		return new WSServerMessage(this.JOINED_HEADER, id);
	}

	static reqError(message: string): WSServerMessage {
		return new WSServerMessage(this.REQ_ERROR_HEADER, message);
	}
}
