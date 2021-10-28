import {
	Game,
	Response,
	ResponseHeader,
	parseGameType,
	GAME_TYPE,
} from "./Game";
import { WSClientMessage, REQ_TYPE } from "../../util/WSClientMessage";
import { WSServerMessage, SERVER_HEADERS } from "../../util/WSServerMessage";
import Player from "./Player";
import { Move } from "./Move";
import logger from "../../util/logger";

export default class Lobby {
	games: Map<string, Game>;

	constructor() {
		this.games = new Map<string, Game>();
	}

	public handles(req: string): boolean {
		if (
			req === REQ_TYPE.NEW_GAME ||
			req === REQ_TYPE.MAKE_MOVE ||
			req === REQ_TYPE.JOIN_GAME ||
			req === REQ_TYPE.GAME_TYPE ||
			req === REQ_TYPE.POSITION_SHIPS
		) {
			return true;
		} else {
			return false;
		}
	}

	public handleReq(message: WSClientMessage): WSServerMessage[] {
		if (message.req == REQ_TYPE.NEW_GAME) {
			//attempt to create new game
			if (this.games.has(message.id)) {
				return [
					new WSServerMessage({
						header: SERVER_HEADERS.JOINED_GAME,
						at: message.id,
						payload: {
							opponent: "Empty Game",
							gameType: this.games.get(message.id).rules.type,
						},
					}),
				];
			}
			const type = parseGameType(message.data); //if type is excluded, game defaults to classic mode
			const game = new Game(message.id, type); //use the unique username
			game.add(new Player(message.id));
			this.games.set(game.id, game);
			return [
				new WSServerMessage({
					header: SERVER_HEADERS.GAME_CREATED,
					at: message.id,
				}),
			];
		} else if (message.req === REQ_TYPE.MAKE_MOVE) {
			const [resp, move] = this.makeMove(message.id, message.data);
			if (resp.valid) {
				const list = [
					new WSServerMessage({
						header: SERVER_HEADERS.MOVE_MADE,
						at: message.id,
						payload: move,
						meta: resp.meta.includes(ResponseHeader.GAME_OVER)
							? ResponseHeader.GAME_OVER
							: "",
					}),
				];
				list.push(...this.broadcastMove(message.id, move, resp));
				return list;
			} else {
				return [
					new WSServerMessage({
						header: SERVER_HEADERS.INVALID_MOVE,
						at: message.id,
						meta: resp.meta,
					}),
				];
			}
		} else if (message.req == REQ_TYPE.JOIN_GAME) {
			const [resp, type] = this.joinGame(
				new Player(message.id),
				message.data,
			);
			if (resp.valid) {
				const list = [
					new WSServerMessage({
						header: SERVER_HEADERS.JOINED_GAME,
						at: message.id,
						payload: { opponent: message.data, gameType: type },
					}),
				];
				list.push(...this.broadcastJoin(message.id));
				return list;
			} else {
				return [
					new WSServerMessage({
						header: SERVER_HEADERS.INVALID_JOIN,
						at: message.id,
						meta: resp.meta,
					}),
				];
			}
		} else if (message.req == REQ_TYPE.POSITION_SHIPS) {
			const resp = this.positionShips(message.id, message.data);
			if (resp.valid) {
				const list = [];
				if (resp.meta.includes(ResponseHeader.GAME_STARTED)) {
					list.push(...this.broadcastGameStarted(message.id));
				} else {
					list.push(
						new WSServerMessage({
							header: SERVER_HEADERS.POSITIONED_SHIPS,
							at: message.id,
						}),
					);
				}
				return list;
			} else {
				return [
					new WSServerMessage({
						header: SERVER_HEADERS.INVALID_LAYOUT,
						at: message.id,
						meta: resp.meta,
					}),
				];
			}
		} else if (message.req == REQ_TYPE.GAME_TYPE) {
			const [resp, type] = this.changeGameType(message.id, message.data);
			if (resp.valid) {
				const list = [
					new WSServerMessage({
						header: SERVER_HEADERS.GAME_TYPE_APPROVED,
						at: message.id,
						meta: type,
					}),
				];
				list.push(...this.broadcastGameType(message.id, type));
				return list;
			} else {
				return [
					new WSServerMessage({
						header: SERVER_HEADERS.INVALID_GAME_TYPE,
						at: message.id,
						meta: resp.meta,
					}),
				];
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
	private makeMove(playerID: string, moveRaw: unknown): [Response, Move] {
		const move = new Move(moveRaw);
		move.from = playerID;
		if (move.isValid()) {
			for (const [, game] of this.games) {
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
	private broadcastMove(
		sourceID: string,
		move: Move,
		resp: Response,
	): WSServerMessage[] {
		for (const [, game] of this.games) {
			const player = game.getPlayerByID(sourceID);
			if (player) {
				//found game
				const list = [];
				const players = game.getPlayers(player.id);
				for (let i = 0; i < players.length; i++) {
					const p = players[i];
					list.push(
						new WSServerMessage({
							header: SERVER_HEADERS.MOVE_MADE,
							at: p.id,
							payload: move,
							meta: resp.meta.includes(ResponseHeader.GAME_OVER)
								? ResponseHeader.GAME_OVER
								: "",
						}),
					);
				}
				return list;
			}
		}
		throw new Error(
			"Couldn't find source game to broadcast move: this should never happen",
		);
	}

	private broadcastJoin(sourceID: string): WSServerMessage[] {
		for (const [, game] of this.games) {
			const player = game.getPlayerByID(sourceID);
			if (player) {
				//found game
				const list = [];
				const players = game.getPlayers(player.id);
				for (let i = 0; i < players.length; i++) {
					const p = players[i];
					list.push(
						new WSServerMessage({
							header: SERVER_HEADERS.JOINED_GAME,
							at: p.id,
							payload: {
								opponent: sourceID,
								gameType: game.rules.type,
							},
						}),
					);
				}
				return list;
			}
		}
		throw new Error(
			"Couldn't find source game to broadcast join: this should never happen",
		);
	}

	private broadcastGameStarted(sourceID: string): WSServerMessage[] {
		for (const [, game] of this.games) {
			const player = game.getPlayerByID(sourceID);
			if (player) {
				//found game
				const list = [];
				const players = game.getPlayers();
				for (let i = 0; i < players.length; i++) {
					const p = players[i];
					list.push(
						new WSServerMessage({
							header: SERVER_HEADERS.GAME_STARTED,
							at: p.id,
						}),
					);
				}
				return list;
			}
		}
		throw new Error(
			"Couldn't find source game to broadcast started: this should never happen",
		);
	}

	private broadcastGameType(
		sourceID: string,
		type: GAME_TYPE,
	): WSServerMessage[] {
		for (const [, game] of this.games) {
			const player = game.getPlayerByID(sourceID);
			if (player) {
				//found game
				const list = [];
				const players = game.getPlayers(player.id);
				for (let i = 0; i < players.length; i++) {
					const p = players[i];
					list.push(
						new WSServerMessage({
							header: SERVER_HEADERS.GAME_TYPE_APPROVED,
							at: p.id,
							meta: type,
						}),
					);
				}
				return list;
			}
		}
		throw new Error(
			"Couldn't find source game to broadcast game type: this should never happen",
		);
	}

	private positionShips(playerID: string, positions: string): Response {
		for (const [, game] of this.games) {
			const player = game.getPlayerByID(playerID);
			if (player) {
				return game.positionShips(playerID, positions);
			}
		}

		return new Response(false, ResponseHeader.NO_SUCH_GAME);
	}

	private changeGameType(
		playerID: string,
		gameType: string,
	): [Response, GAME_TYPE] {
		const type = parseGameType(gameType);
		for (const [, game] of this.games) {
			const player = game.getPlayerByID(playerID);
			if (player) {
				return [game.changeGameType(playerID, type), type];
			}
		}
		return [new Response(false, ResponseHeader.NO_SUCH_GAME), type];
	}

	private joinGame(player: Player, toJoinID: string): [Response, GAME_TYPE] {
		const game = this.games.get(toJoinID);
		if (game) {
			if (game.add(player)) {
				return [new Response(true), game.rules.type];
			} else {
				return [
					new Response(false, ResponseHeader.ALREADY_IN_GAME),
					null,
				];
			}
		} else {
			return [new Response(false, ResponseHeader.NO_SUCH_GAME), null];
		}
	}

	public leaveGame(socketID: string): void {
		const game = this.games.get(socketID);
		if (game) {
			logger.warn(`Host <${socketID}> Ended Game by Leaving`);
			//player leaving game is the "game owner"/created the game
			for (let i = 0; i < game.players.length; i++) {
				const player = game.players[i];
				if (player.id != socketID) {
					logger.warn(`Booting Player: <${player.id}>`);
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
						logger.warn(
							`Game #${gameID}<${game.id}> removed from Lobby`,
						);
						//TODO: SEND WS MESSAGE TO PLAYERS STILL IN GAME
					}
				}
			}
		}
	}
}
