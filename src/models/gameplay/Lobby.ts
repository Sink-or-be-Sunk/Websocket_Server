import { Game, Response, ResponseHeader, parseGameType } from "./Game";
import ServerMessenger from "../../../src/util/ServerMessenger";
import { WSClientMessage, REQ_TYPE } from "../../../src/util/WSClientMessage";
import WSServerMessage from "../../util/WSServerMessage";
import Player from "./Player";

export default class Lobby {
	games: Map<string, Game>;

	constructor() {
		this.games = new Map<string, Game>();
	}

	public handleReq(
		message: WSClientMessage,
	): WSServerMessage {
		if (message.req == REQ_TYPE.NEW_GAME) {
			//attempt to create new game
			if (this.games.has(message.id)) {
				return ServerMessenger.reqError("Game Already Exists");
			}
			const type = parseGameType(message.data); //if type is excluded, game defaults to classic mode
			const game = new Game(message.id, type); //use the unique username
			game.add(new Player(message.id));
			this.games.set(game.id, game);
			return ServerMessenger.GAME_CREATED;
		} else if (message.req === REQ_TYPE.MAKE_MOVE) {
			const resp = this.makeMove(message.id, message.data);
			if (resp.valid) {
				return ServerMessenger.MOVE_MADE;
			} else {
				return ServerMessenger.invalid_move(resp.meta);
			}
		} else if (message.req == REQ_TYPE.JOIN_GAME) {
			const resp = this.joinGame(new Player(message.id), message.data);
			if (resp.valid) {
				return ServerMessenger.joined(message.data);
			} else {
				return ServerMessenger.invalid_join(resp.meta);
			}
		} else if (message.req == REQ_TYPE.POSITION_SHIPS) {
			const resp = this.positionShips(message.id, message.data);
			if (resp.valid) {
				return ServerMessenger.LAYOUT_APPROVED;
			} else {
				return ServerMessenger.invalid_layout(resp.meta);
			}
		} else if (message.req == REQ_TYPE.GAME_TYPE) {
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
	private makeMove(playerID: string, move: string): Response {
		for (const [gameID, game] of this.games) {
			const player = game.getPlayerByID(playerID);
			if (player) {
				return game.makeMove(playerID, move);
			}
		}
		return new Response(false, ResponseHeader.NO_SUCH_GAME);
	}

	private positionShips(playerID: string, positions: string): Response {
		for (const [gameID, game] of this.games) {
			const player = game.getPlayerByID(playerID);
			if (player) {
				return game.positionShips(playerID, positions);
			}
		}

		return new Response(false, ResponseHeader.NO_SUCH_GAME);
	}

	private changeGameType(playerID: string, positions: string): Response {
		for (const [gameID, game] of this.games) {
			const player = game.getPlayerByID(playerID);
			if (player) {
				return game.changeGameType(playerID, positions);
			}
		}
		return new Response(false, ResponseHeader.NO_SUCH_GAME);
	}

	private joinGame(player: Player, toJoinID: string): Response {
		const game = this.games.get(toJoinID);
		if (game) {
			if (game.add(player)) {
				return new Response(true);
			} else {
				return new Response(false, ResponseHeader.ALREADY_IN_GAME);
			}
		} else {
			return new Response(false, ResponseHeader.NO_SUCH_GAME);
		}
	}

	public leaveGame(socketID: string) {
		const game = this.games.get(socketID);
		if (game) {
			console.log(`Host <${socketID}> Ended Game by Leaving`);
			//player leaving game is the "game owner"/created the game
			for (let i = 0; i < game.players.length; i++) {
				const player = game.players[i];
				if (player.id != socketID) {
					console.log(`Booting Player: <${player.id}>`);
					//TODO: SEND WS MESSAGE TO PLAYERS KICKED FROM GAME
				}
			}
			this.games.delete(socketID); //remove game from lobby
		}
		for (const [gameID, game] of this.games) {
			const players = game.players;
			for (let j = 0; j < players.length; j++) {
				const player = players[j];
				if (player.id == socketID) {
					if (game.remove(player)) {
						console.log(`Game #${gameID}<${game.id}> removed from Lobby`);
						//TODO: SEND WS MESSAGE TO PLAYERS STILL IN GAME
					}
				}
			}
		}
	}
}
