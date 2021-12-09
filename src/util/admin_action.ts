import logger from "./logger";
import { lobby } from "../singletons";
import Lobby from "../models/gameplay/Lobby";
import { sendList } from "../server";

export async function clear(): Promise<void> {
	for (const [key] of this.games) {
		logger.info(`Ending Game <${key}>`);
		sendList(this.broadcastGameEnded(Lobby.ADMIN_ACTION));
		lobby.endGame(key, false);
	}
	logger.warn("Games have been cleared and all players booted");
}
