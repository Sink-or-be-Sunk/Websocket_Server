import { Game, Response, ResponseHeader, parseGameType } from "./Game";
import { WSClientMessage, REQ_TYPE } from "../../util/WSClientMessage"
import { WSServerMessage, SERVER_HEADERS } from "../../util/WSServerMessage";
import Player from "./Player";
import { Move } from "./Move";

export default class Lobby {
	games: Map<string, Game>;

	constructor() {
		this.games = new Map<string, Game>();
	}

	public handleReq(
		message: WSClientMessage,
	): WSServerMessage[] {
		if (message.req == REQ_TYPE.NEW_GAME) {
			//attempt to create new game
			if (this.games.has(message.id)) {
				return [new WSServerMessage({
					header: SERVER_HEADERS.GAME_ALREADY_EXISTS,
					at: message.id,
				})];
			}
			const type = parseGameType(message.data); //if type is excluded, game defaults to classic mode
			const game = new Game(message.id, type); //use the unique username
			game.add(new Player(message.id));
			this.games.set(game.id, game);
			return [new WSServerMessage({
				header: SERVER_HEADERS.GAME_CREATED,
				at: message.id,
			})];
		} else if (message.req === REQ_TYPE.MAKE_MOVE) {
			const [resp, move] = this.makeMove(message.id, message.data);
			if (resp.valid) {
				const list = [new WSServerMessage({
					header: SERVER_HEADERS.MOVE_MADE,
					at: message.id,
					payload: move,
				})];
				list.push(...this.broadcastMove(message.id, move))
				return list;
			} else {
				return [new WSServerMessage({ header: SERVER_HEADERS.INVALID_MOVE, at: message.id, meta: resp.meta })];
			}
		} else if (message.req == REQ_TYPE.JOIN_GAME) {
			const resp = this.joinGame(new Player(message.id), message.data);
			if (resp.valid) {
				const list = [new WSServerMessage({ header: SERVER_HEADERS.JOINED_GAME, at: message.id, meta: message.data })];
				list.push(...this.broadcastJoin(message.id))
				return list;
			} else {
				return [new WSServerMessage({ header: SERVER_HEADERS.INVALID_JOIN, at: message.id, meta: resp.meta })]
			}
		} else if (message.req == REQ_TYPE.POSITION_SHIPS) {
			const resp = this.positionShips(message.id, message.data);
			if (resp.valid) {
				return [new WSServerMessage({ header: SERVER_HEADERS.POSITIONED_SHIPS, at: message.id })]; //FIXME: BROADCAST
			} else {
				return [new WSServerMessage({ header: SERVER_HEADERS.INVALID_LAYOUT, at: message.id, meta: resp.meta })];
			}
		} else if (message.req == REQ_TYPE.GAME_TYPE) {
			const resp = this.changeGameType(message.id, message.data);
			if (resp.valid) {
				return [new WSServerMessage({ header: SERVER_HEADERS.GAME_TYPE_APPROVED, at: message.id })]; //FIXME: BROADCAST
			} else {
				return [new WSServerMessage({ header: SERVER_HEADERS.INVALID_GAME_TYPE, at: message.id, meta: resp.meta })];
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
	private makeMove(playerID: string, moveRaw: Object): [Response, Move] {
		const move = new Move(moveRaw);
		move.from = playerID;
		if (move.isValid()) {
			for (const [gameID, game] of this.games) {
				const player = game.getPlayerByID(playerID);
				if (player) {
					const resp = game.makeMove(playerID, move);
					return [resp, move];
				}
			}
			return [new Response(false, ResponseHeader.NO_SUCH_GAME), move];
		} else {
			return [new Response(false, ResponseHeader.MOVE_INVALID), move];
		}

	}

	/**
	 * generate a Response obj for the other players in the game
	 * that were moved against by sourceID player
	 * @param sourceID 
	 * @param move 
	 */
	private broadcastMove(sourceID: string, move: Move): WSServerMessage[] {
		for (const [gameID, game] of this.games) {
			const player = game.getPlayerByID(sourceID);
			if (player) {
				//found game
				const list = [];
				const players = game.getPlayers(player.id);
				for (let i = 0; i < players.length; i++) {
					const p = players[i];
					list.push(new WSServerMessage({ header: SERVER_HEADERS.MOVE_MADE, at: p.id, payload: move }))
				}
				return list;
			}
		}
		throw new Error("Couldn't find source game to broadcast move: this should never happen")
	}

	private broadcastJoin(sourceID: string): WSServerMessage[] {
		for (const [gameID, game] of this.games) {
			const player = game.getPlayerByID(sourceID);
			if (player) {
				//found game
				const list = [];
				const players = game.getPlayers(player.id);
				for (let i = 0; i < players.length; i++) {
					const p = players[i];
					list.push(new WSServerMessage({ header: SERVER_HEADERS.JOINED_GAME, at: p.id, meta: sourceID }))
				}
				return list;
			}
		}
		throw new Error("Couldn't find source game to broadcast join: this should never happen")
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
