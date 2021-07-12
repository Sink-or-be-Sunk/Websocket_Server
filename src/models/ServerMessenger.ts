import WSServerMessage from "./WSServerMessage";

export default class ServerMessenger {
	//HEADERS FOR DYNAMIC MESSAGES
	private static readonly REQ_ERROR_HEADER: string = "REQ ERROR";
	private static readonly GAME_CREATED_HEADER: string = "GAME CREATED";
	private static readonly JOINED_HEADER: string = "JOINED GAME";

	//STATIC MESSAGES
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

	// DYNAMIC MESSAGE BUILDERS
	static gameCreated(): WSServerMessage {
		return new WSServerMessage(this.GAME_CREATED_HEADER);
	}

	static joined(id: string): WSServerMessage {
		return new WSServerMessage(this.JOINED_HEADER, id);
	}

	static reqError(message: string): WSServerMessage {
		return new WSServerMessage(this.REQ_ERROR_HEADER, message);
	}
}
