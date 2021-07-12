import Game from "./Game";
import ServerMessenger from "./ServerMessenger";
import WSClientMessage from "./WSClientMessage";
import WSServerMessage from "./WSServerMessage";
import * as WebSocket from "ws";

export default class Lobby {
	games: Game[];

	constructor() {
		this.games = [];
	}

	public handleReq(
		socket: WebSocket,
		message: WSClientMessage,
	): WSServerMessage {
		if (message.req === WSClientMessage.NEW_GAME) {
			//attempt to create new game
			if (this.getGame(message.id)) {
				return ServerMessenger.reqError("Game Already Exists");
			}
			const game = new Game(message.id, socket); //use the unique MAC address of MCU to generate game id
			this.games.push(game);
			return ServerMessenger.gameCreated();
			// TODO: MAKE MOVE CODE
			// } else if (message.req === WSClientMessage.MAKE_MOVE) {
			// 	//attempt to make move in a game
			// 	return "make move";
		} else {
			throw Error("WSMessage is not valid.  This should never occur");
		}
	}

	public leaveGame(socket: WebSocket) {
		for (let i = 0; i < this.games.length; i++) {
			const game = this.games[i];
			const players = game.players;
			for (let j = 0; j < players.length; j++) {
				const player = players[j];

				if (player.socket == socket) {
					if (game.remove(player)) {
						this.games.splice(i, 1); //remove game from lobby
						console.log(`Game <${game.id}> removed from Lobby`);
					}
				}
			}
		}
	}

	private getGame(id: string): Game | null {
		for (let i = 0; i < this.games.length; i++) {
			const game = this.games[i];
			if (game.id == id) {
				return game;
			}
		}
		return null;
	}

	private addGame(game: Game) {
		this.games.push(game);
	}
}
