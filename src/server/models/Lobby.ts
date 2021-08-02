import Game from "./Game";
import ServerMessenger from "./ServerMessenger";
import WSClientMessage from "./WSClientMessage";
import WSServerMessage from "./WSServerMessage";
import WebSocket from "ws";
import Player from "./Player";
import Statics from "./Statics";

export default class Lobby {
	games: Game[];

	constructor() {
		this.games = [];
	}

	public handleReq(
		socket: WebSocket,
		message: WSClientMessage,
	): WSServerMessage {
		if (message.req == WSClientMessage.REQ_TYPE.NEW_GAME) {
			//attempt to create new game
			if (this.getGame(message.id)) {
				return ServerMessenger.reqError("Game Already Exists");
			}
			const game = new Game(message.id, socket); //use the unique MAC address of MCU to generate game id //TODO: Allow for multiple game types
			this.games.push(game);
			return ServerMessenger.GAME_CREATED;
		} else if (message.req === WSClientMessage.REQ_TYPE.MAKE_MOVE) {
			const resp = this.makeMove(message.id, message.data);
			if (resp.valid) {
				return ServerMessenger.MOVE_MADE;
			} else {
				return ServerMessenger.invalid_move(resp.meta);
			}
		} else if (message.req == WSClientMessage.REQ_TYPE.JOIN_GAME) {
			if (this.joinGame(new Player(message.id, socket), message.data)) {
				return ServerMessenger.joined(message.data);
			} else {
				return ServerMessenger.NO_SUCH_GAME;
			}
		} else if (message.req == WSClientMessage.REQ_TYPE.POSITION_SHIPS) {
			const resp = this.positionShips(message.id, message.data);
			if (resp.valid) {
				return ServerMessenger.LAYOUT_APPROVED;
			} else {
				return ServerMessenger.invalid_layout(resp.meta);
			}
		} else if (message.req == WSClientMessage.REQ_TYPE.GAME_TYPE) {
			const resp = this.changeGameType(message.id, message.data);
			if (resp.valid) {
				return ServerMessenger.GAME_TYPE_APPROVED;
			} else {
				return ServerMessenger.invalid_game_type(resp.meta);
			}
		} else {
			throw Error("WSMessage is not valid.  This should never occur");
		}
	}

	/**
	 *
	 * @param playerID - id of player making move
	 * @param move - move to be made
	 * @returns - true if move is valid, false otherwise
	 */
	private makeMove(playerID: string, move: string): Game.Response {
		for (let i = 0; i < this.games.length; i++) {
			const game = this.games[i];
			const player = game.getPlayerByID(playerID);
			if (player) {
				return game.makeMove(playerID, move);
			}
		}
		return new Game.Response(false, Game.ResponseHeader.NO_SUCH_GAME);
	}

	private positionShips(playerID: string, positions: string): Game.Response {
		for (let i = 0; i < this.games.length; i++) {
			const game = this.games[i];
			const player = game.getPlayerByID(playerID);
			if (player) {
				return game.positionShips(playerID, positions);
			}
		}
		return new Game.Response(false, Game.ResponseHeader.NO_SUCH_GAME);
	}

	private changeGameType(playerID: string, positions: string): Game.Response {
		for (let i = 0; i < this.games.length; i++) {
			const game = this.games[i];
			const player = game.getPlayerByID(playerID);
			if (player) {
				return game.changeGameType(playerID, positions);
			}
		}
		return new Game.Response(false, Game.ResponseHeader.NO_SUCH_GAME);
	}

	private joinGame(player: Player, toJoinID: string): boolean {
		for (let i = 0; i < this.games.length; i++) {
			const game = this.games[i];
			if (game.id == toJoinID) {
				return game.add(player);
			}
		}
		return false;
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
