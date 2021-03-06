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
import { User } from "../User";
import sgMail from "@sendgrid/mail";
import { Position } from "./Layout";

export default class Lobby {
	public static readonly EMPTY_GAME_MSG = "Empty Game";
	public static readonly ADMIN_ACTION = "ADMIN ACTION";
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
			req === REQ_TYPE.POSITION_SHIPS ||
			req === REQ_TYPE.LEAVE_GAME ||
			req === REQ_TYPE.INIT_CONNECTION
		) {
			return true;
		} else {
			return false;
		}
	}

	public async handleReq(
		message: WSClientMessage,
	): Promise<WSServerMessage[]> {
		if (message.req == REQ_TYPE.NEW_GAME) {
			//attempt to create new game
			if (this.games.has(message.id)) {
				return [
					new WSServerMessage({
						header: SERVER_HEADERS.JOINED_GAME,
						at: message.id,
						payload: {
							opponent: Lobby.EMPTY_GAME_MSG,
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
						meta: resp.meta,
					}),
				];
				list.push(...this.broadcastMove(message.id, move, resp));

				list.push(...this.broadcastBoards(message.id));

				if (
					resp.meta.includes(Move.WINNER_TAG) ||
					resp.meta.includes(Move.LOSER_TAG)
				) {
					list.push(
						...this.broadcastGameEnded({ sourceID: message.id }),
					);
					this.endGame(message.id, true);
				}
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
			const [resp, positions] = this.positionShips(
				message.id,
				message.data,
			);
			if (resp.valid) {
				const list = [];
				list.push(
					new WSServerMessage({
						header: SERVER_HEADERS.POSITIONED_SHIPS,
						at: message.id,
						payload: positions,
					}),
				);

				if (resp.meta.includes(ResponseHeader.GAME_STARTED)) {
					list.push(...this.broadcastGameStarted(message.id));
					list.push(...this.broadcastBoards(message.id));
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
		} else if (message.req == REQ_TYPE.LEAVE_GAME) {
			return this.leaveGame(message.id);
		} else if (message.req == REQ_TYPE.INIT_CONNECTION) {
			const game = this.getGameByPlayerID(message.id);

			if (game) {
				return this.sendReconnect(game, message.id);
			} else {
				// player wasn't in game previously or game timed out
				return [
					new WSServerMessage({
						header: SERVER_HEADERS.CONNECTED,
						at: message.id,
						meta: SERVER_HEADERS.INITIAL_CONNECTION,
					}),
				];
			}
		} else {
			throw Error("WSMessage is not valid.  This should never occur");
		}
	}
	private getGameByPlayerID(playerID: string): Game | undefined {
		for (const [, game] of this.games) {
			const player = game.getPlayerByID(playerID);
			if (player) {
				return game;
			}
		}
		return undefined;
	}
	public async endGame(playerID: string, sendEmail: boolean): Promise<void> {
		const game = this.getGameByPlayerID(playerID);
		const winner = game.getPlayerByID(playerID);
		const looser = game.getOpponent(playerID);
		if (sendEmail && winner && looser) {
			const winnerDoc = await User.findOne({ username: winner.id });
			const looserDoc = await User.findOne({ username: looser.id });

			const winnerName = winnerDoc.profile?.name
				? winnerDoc.profile.name
				: winnerDoc.username;
			const looserName = looserDoc.profile?.name
				? looserDoc.profile.name
				: looserDoc.username;

			const winnerEmail = {
				to: winnerDoc.email,
				from: "SinkOrBeSunkRobot@gmail.com",
				templateId: "d-1e6cfed4fce14d6dab19c711cc3ee91d",
				dynamicTemplateData: {
					player: winnerName,
					opponent: looserName,
				},
			};

			sgMail.send(winnerEmail, undefined, (err) => {
				if (err) {
					logger.error(`Email Send Error: ${err.message}`);
				}
				logger.info(
					`Email to ${winnerEmail.to} has been sent successfully!`,
				);
			});

			const looserEmail = {
				to: looserDoc.email,
				from: "SinkOrBeSunkRobot@gmail.com",
				templateId: "d-95adbce222b2448d8aad5b92da617ad3",
				dynamicTemplateData: {
					player: looserName,
					opponent: winnerName,
				},
			};

			sgMail.send(looserEmail, undefined, (err) => {
				if (err) {
					logger.error(`Email Send Error: ${err.message}`);
				}
				logger.info(
					`Email to ${looserEmail.to} has been sent successfully!`,
				);
			});
			//TODO: get game summary (boats sunk for each player)
			//TODO: update wins/losses in db
		}
		this.games.delete(game.id);
		logger.warn(`Removed Game <${game.id}>`);
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
					if (resp.meta.includes(ResponseHeader.GAME_OVER)) {
						resp.meta = Move.WINNER_TAG;
					}
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
				if (resp.meta.includes(Move.WINNER_TAG)) {
					resp.meta = Move.LOSER_TAG;
				}
				const list = [];
				const players = game.getPlayers(player.id);
				for (let i = 0; i < players.length; i++) {
					const p = players[i];

					list.push(
						new WSServerMessage({
							header: SERVER_HEADERS.MOVE_MADE,
							at: p.id,
							payload: move,
							meta: resp.meta,
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

	private getBroadcastBoard(game: Game, playerID: string): WSServerMessage {
		const boards = game.getBoards();

		for (let i = 0; i < boards.length; i++) {
			const board = boards[i];
			if (board.id == playerID) {
				return new WSServerMessage({
					header: SERVER_HEADERS.BOARD_UPDATE,
					at: board.id,
					meta: board.str,
				});
			}
		}
		throw new Error(
			`Couldn't find player <${playerID}> in game <${game.id}>`,
		);
	}

	private broadcastBoards(sourceID: string): WSServerMessage[] {
		for (const [, game] of this.games) {
			const player = game.getPlayerByID(sourceID);
			if (player) {
				//found game
				const list = [];
				for (let i = 0; i < game.players.length; i++) {
					const pid = game.players[i].id;
					list.push(this.getBroadcastBoard(game, pid));
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

	private getBroadcastGame(playerID: string): WSServerMessage {
		return new WSServerMessage({
			header: SERVER_HEADERS.GAME_STARTED,
			at: playerID,
		});
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
					list.push(this.getBroadcastGame(p.id));
				}
				return list;
			}
		}
		throw new Error(
			"Couldn't find source game to broadcast started: this should never happen",
		);
	}

	private getBroadcastGameEnded(
		playerID: string,
		meta: string,
	): WSServerMessage {
		return new WSServerMessage({
			header: SERVER_HEADERS.GAME_OVER,
			meta: meta,
			at: playerID,
		});
	}

	public broadcastGameEnded(options: {
		sourceID?: string;
		game?: Game;
	}): WSServerMessage[] {
		if (options.sourceID) {
			for (const [, game] of this.games) {
				const player = game.getPlayerByID(options.sourceID);
				if (player) {
					//found game
					const list = [];
					const players = game.getPlayers();
					for (let i = 0; i < players.length; i++) {
						const p = players[i];
						if (p.id == options.sourceID) {
							list.push(
								this.getBroadcastGameEnded(
									p.id,
									Move.WINNER_TAG,
								),
							);
						} else {
							list.push(
								this.getBroadcastGameEnded(
									p.id,
									Move.LOSER_TAG,
								),
							);
						}
					}
					return list;
				}
			}
		} else if (options.game) {
			const list = [];
			const players = options.game.getPlayers();
			for (let i = 0; i < players.length; i++) {
				const p = players[i];
				list.push(this.getBroadcastGameEnded(p.id, Lobby.ADMIN_ACTION));
			}
			return list;
		}

		throw new Error(
			"Couldn't find source game to broadcast ended: this should never happen",
		);
	}

	private sendReconnect(game: Game, uid: string): WSServerMessage[] {
		const list = [];

		//send joined game
		if (game.players.length <= 1) {
			list.push(
				new WSServerMessage({
					header: SERVER_HEADERS.JOINED_GAME,
					at: uid,
					payload: {
						opponent: Lobby.EMPTY_GAME_MSG,
						gameType: game.rules.type,
					},
				}),
			);
		} else {
			const opponent = game.getOpponent(uid);
			if (opponent) {
				list.push(
					new WSServerMessage({
						header: SERVER_HEADERS.JOINED_GAME,
						at: uid,
						payload: {
							opponent: opponent.id,
							gameType: game.rules.type,
						},
					}),
				);
			} else {
				throw new Error(
					`Cannot Find Opponent In Game: ${game.id} for player ${uid}`,
				);
			}
		}

		if (game.isStarted()) {
			list.push(
				new WSServerMessage({
					header: SERVER_HEADERS.POSITIONED_SHIPS,
					at: uid,
					payload: game.getShipPositions(uid),
				}),
			);
			//send game board
			list.push(this.getBroadcastGame(uid));
			list.push(this.getBroadcastBoard(game, uid));

			// if (game.isInProgress()) {
			// 	list.push(
			// 		new WSServerMessage({
			// 			header: SERVER_HEADERS.MOVE_MADE,
			// 			at: uid,
			// 			payload: game.lastMove,
			// 			meta: resp.meta,
			// 		}),
			// 	);
		} else if (game.shipsPositioned(uid)) {
			list.push(
				new WSServerMessage({
					header: SERVER_HEADERS.POSITIONED_SHIPS,
					at: uid,
					payload: game.getShipPositions(uid),
				}),
			);
		}
		return list;
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

	private positionShips(
		playerID: string,
		positions: string,
	): [Response, Position[] | null] {
		for (const [, game] of this.games) {
			const player = game.getPlayerByID(playerID);
			if (player) {
				return [
					game.positionShips(playerID, positions),
					game.getShipPositions(playerID),
				];
			}
		}

		return [new Response(false, ResponseHeader.NO_SUCH_GAME), null];
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

	public leaveGame(socketID: string): WSServerMessage[] {
		const list = [];
		const game = this.games.get(socketID);
		if (game) {
			logger.warn(`Host <${socketID}> Ended Game by Leaving`);
			//player leaving game is the "game owner"/created the game
			for (let i = 0; i < game.players.length; i++) {
				const player = game.players[i];

				logger.warn(`Booting Player: <${player.id}>`);
				list.push(
					new WSServerMessage({
						header: SERVER_HEADERS.LEFT_GAME,
						at: player.id,
						meta: socketID,
					}),
				);
			}
			this.games.delete(socketID); //remove game from lobby
			logger.warn(`Game Removed <${socketID}>`);
		} else {
			for (const [gameID, game] of this.games) {
				const players = game.players;
				for (let j = 0; j < players.length; j++) {
					const player = players[j];
					if (player.id == socketID) {
						for (let k = 0; k < players.length; k++) {
							const player = players[k];
							list.push(
								new WSServerMessage({
									header: SERVER_HEADERS.LEFT_GAME,
									at: player.id,
									meta: socketID,
								}),
							);
						}
						if (game.remove(player)) {
							logger.warn(
								`Game #${gameID}<${game.id}> removed from Lobby`,
							);
						}
					}
				}
			}
		}
		return list;
	}
}
