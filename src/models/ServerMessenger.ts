import WSServerMessage from "./WSServerMessage";

export default class ServerMessenger {
	private static readonly REQ_ERROR_HEADER: string = "REQ ERROR";
	private static readonly GAME_CREATED_HEADER: string = "GAME CREATED";

	static readonly FORMAT_ERROR: WSServerMessage = new WSServerMessage(
		"FORMAT ERROR",
	);
	static readonly TURN_ERROR: WSServerMessage = new WSServerMessage(
		"TURN ERROR",
	);

	static gameCreated(): WSServerMessage {
		return new WSServerMessage(this.GAME_CREATED_HEADER);
	}

	static reqError(message: string): WSServerMessage {
		return new WSServerMessage(this.REQ_ERROR_HEADER, message);
	}
}
