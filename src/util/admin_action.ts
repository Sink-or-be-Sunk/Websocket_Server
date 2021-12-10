import logger from "./logger";
import { lobby } from "../singletons";
import Lobby from "../models/gameplay/Lobby";
import { sendList } from "../server";

export async function clear(): Promise<void> {
	for (const [key, game] of lobby.games) {
		logger.info(`Ending Game <${key}>`);
		sendList(lobby.broadcastGameEnded({ game: game }));
		lobby.endGame(key, false);
	}
	logger.warn("Games have been cleared and all players booted");
}
