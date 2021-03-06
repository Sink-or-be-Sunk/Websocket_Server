import { Board, Square, BOARD_STATE } from "./Board";
import Player from "./Player";
import { Move } from "./Move";
import { Layout, Position, POSITION_TYPE } from "./Layout";
import { Ship, SHIP_DESCRIPTOR } from "./Ship";
import logger from "../../util/logger";

export class Game {
	/** List of all players in the game */
	players: Player[];
	/** Boards have one to one mapping with player array */
	boards: Board[];
	/** unique game id */
	id: string;
	/** Indicated index of players array who has current turn */
	turn: number;
	/** sets up the game rules */
	rules: Rules;
	/** current state of the game */
	state: STATE;
	/** Most recent move that has been made by either player */
	lastMove: Move;

	constructor(id: string, type: GAME_TYPE) {
		this.id = id;
		this.rules = new Rules(type);
		this.players = new Array<Player>();
		this.boards = new Array<Board>();
		logger.info(`New ${this.rules.type} Game Created`);
		this.turn = 0;
		this.state = STATE.IDLE; //wait for ship positions to be locked in;
		this.lastMove = null;
	}

	isInProgress(): boolean {
		return this.isStarted() && this.lastMove != null;
	}

	isStarted(): boolean {
		return this.state == STATE.STARTED;
	}

	isOver(): boolean {
		return this.state == STATE.OVER;
	}

	shipsPositioned(uid: string): boolean {
		for (let i = 0; i < this.players.length; i++) {
			const player = this.players[i];
			if (player.id == uid) {
				return player.ready;
			}
		}
		throw new Error(`Invalid player uid <${uid}>.  Player not found`);
	}

	getPlayers(ignoreID?: string): Player[] {
		if (ignoreID) {
			return this.players.filter((player) => player.id != ignoreID);
		} else {
			return this.players;
		}
	}

	/**
	 *
	 * @param player - player to remove from game
	 * @returns true if game is empty, false otherwise
	 */
	remove(player: Player): boolean {
		for (let i = 0; i < this.players.length; i++) {
			const p = this.players[i];
			if (player == p) {
				this.players.splice(i, 1); // remove player from game
				this.boards.splice(i, 1); //remove players board from game
				logger.info(
					`Player <${player.id}> Removed From Game <${this.id}`,
				);
				if (this.players.length == 0) {
					return true; //game is empty
				}
			}
		}
		return false;
	}

	private newPlayer(player: Player): void {
		logger.info(`Player <${player.id}> added to Game <${this.id}>`);

		this.players.push(player);
		this.boards.push(new Board(player.id, this.rules));
	}

	/**
	 *
	 * @param player - Player to add to game
	 * @returns - true if player was added, false otherwise
	 */
	add(player: Player): boolean {
		for (let i = 0; i < this.players.length; i++) {
			const p = this.players[i];
			if (player.id == p.id) {
				return false;
			}
		}
		this.newPlayer(player);
		return true;
	}

	private readyUp(id: string): void {
		this.state = STATE.STARTED;
		for (let i = 0; i < this.players.length; i++) {
			const player = this.players[i];
			if (id == player.id) {
				player.ready = true;
			}
			if (!player.ready) {
				this.state = STATE.IDLE;
			}
		}
		if (this.players.length < this.rules.minPlayers) {
			this.state = STATE.IDLE;
		} else if (this.state == STATE.STARTED) {
			logger.info("Game Started");
		}
	}

	/**
	 * Checks if player is in the game
	 * @param id - id of player
	 * @returns player if player is in game, false otherwise
	 */
	getPlayerByID(id: string): Player | false {
		for (let i = 0; i < this.players.length; i++) {
			const player = this.players[i];
			if (player.id == id) {
				return player;
			}
		}
		return false;
	}

	/**
	 * Get the opposing player from the current players id
	 * //FIXME: THIS DOESN'T WORK FOR MORE THAN 2 PLAYERS
	 * @param id of target player
	 * @returns player object that is the opponent of player id
	 */
	getOpponent(id: string): Player | false {
		for (let i = 0; i < this.players.length; i++) {
			const player = this.players[i];
			if (player.id != id) {
				return player;
			}
		}
	}

	/**
	 * Gets a player's game board by their id
	 * @param id - id of player
	 * @returns board of player if player is in game, false otherwise
	 */
	getBoardByID(id: string): Board | false {
		for (let i = 0; i < this.players.length; i++) {
			const player = this.players[i];
			if (player.id == id) {
				return this.boards[i];
			}
		}
		return false;
	}

	getBoards(): ResponseBoard[] {
		const responses = [];
		for (let i = 0; i < this.boards.length; i++) {
			const board = this.boards[i];
			const opponent = this.getOpponent(board.id);
			let found = false;
			if (opponent) {
				const opponentBoard = this.getBoardByID(opponent.id);
				if (opponentBoard) {
					responses.push(new ResponseBoard(board, opponentBoard));
					found = true;
				}
			}

			if (!found) {
				throw new Error("Invalid Attempt to Build Response Board!");
			}
		}
		return responses;
	}

	/**
	 *
	 * @param id - id of player making move
	 * @param move - move being made
	 * @returns true if move is valid, false otherwise
	 */
	makeMove(id: string, move: Move): Response {
		if (this.players[this.turn].id == id) {
			if (this.isStarted()) {
				if (move.isValid(this.rules.boardSize)) {
					const board = this.getBoardByID(move.to);
					if (board) {
						const res = board.makeMove(move);
						if (res.valid) {
							logger.info(
								`player <${id}> made move ${move.toString()}`,
							);
							if (res.meta.includes(ResponseHeader.GAME_OVER)) {
								logger.info(`Game Over: Player <${id}> won`);
								this.state = STATE.OVER;
							} else {
								this.lastMove = move;
							}
							this.nextTurn();
						}
						return res;
					} else {
						return new Response(
							false,
							ResponseHeader.BAD_AT_PLAYER,
						);
					}
				} else {
					return new Response(false, ResponseHeader.MOVE_INVALID);
				}
			} else if (this.isOver()) {
				return new Response(false, ResponseHeader.GAME_OVER);
			} else {
				return new Response(false, ResponseHeader.GAME_NOT_STARTED);
			}
		} else {
			return new Response(false, ResponseHeader.TURN_ERROR);
		}
	}

	getShipPositions(id: string): Position[] {
		const board = this.getBoardByID(id);
		if (board) {
			return board.getShipPositions();
		} else {
			throw new Error(`Cannot find board for id: ${id}`);
		}
	}

	positionShips(id: string, positionsRaw: unknown): Response {
		if (this.isStarted()) {
			return new Response(false, ResponseHeader.GAME_IN_PROGRESS);
		} else {
			//NOTE: We don't check this.turn because player is allowed to continually change ship positions util game start
			const layout = new Layout(positionsRaw, this.rules);
			if (layout.isValid()) {
				const board = this.getBoardByID(id);
				if (board) {
					const res = board.updateShipLayout(layout, this.rules, id);
					if (res.valid) {
						this.readyUp(id);
						if (this.isStarted()) {
							res.addDetail(ResponseHeader.GAME_STARTED);
						}
						logger.info(`Player <${id}> Ready Up`);

						// this.nextTurn();
					}
					return res;
				} else {
					return new Response(false, ResponseHeader.BOARD_NOT_FOUND);
				}
			} else {
				return new Response(
					false,
					ResponseHeader.BAD_LAYOUT,
					layout.type,
				);
			}
		}
	}

	changeGameType(id: string, type: GAME_TYPE): Response {
		//TODO: do we want only the player that created the game to be able to change game type?
		let ready = false;
		for (let i = 0; i < this.players.length; i++) {
			const player = this.players[i];
			if (player.ready) {
				ready = true;
				break;
			}
		}
		if (this.isStarted()) {
			return new Response(false, ResponseHeader.GAME_IN_PROGRESS);
		} else if (ready) {
			return new Response(false, ResponseHeader.PLAYER_READY);
		} else {
			this.rules = new Rules(type);
			logger.info(`Game type changed to <${this.rules.type}>`);
			return new Response(
				true,
				ResponseHeader.GAME_TYPE_CHANGED,
				this.rules.type,
			);
		}
	}

	private nextTurn(): void {
		const prevTurn = this.turn;
		this.turn++;
		if (this.turn >= this.players.length) {
			this.turn = 0;
		}
		logger.info(
			`Turn changed from <${this.players[prevTurn].id}> to <${
				this.players[this.turn].id
			}>`,
		);
	}
}

export enum GAME_TYPE {
	CLASSIC = "CLASSIC",
	BASIC = "BASIC", //SMALL game mode for testing
	SOLO = "SOLO", // Play against AI
}

export enum STATE {
	IDLE = "IDLE", // before game has started
	STARTED = "STARTED",
	OVER = "OVER",
}

export function parseGameType(raw: string): GAME_TYPE {
	if (raw === GAME_TYPE.CLASSIC) {
		return GAME_TYPE.CLASSIC;
	} else if (raw === GAME_TYPE.BASIC) {
		return GAME_TYPE.BASIC;
	} else if (raw === GAME_TYPE.SOLO) {
		return GAME_TYPE.SOLO;
	} else {
		logger.warn("Invalid Game Type Request: Defaulting to Classic");
		return GAME_TYPE.CLASSIC;
	}
}

export enum ResponseHeader {
	GAME_NOT_STARTED = "GAME NOT STARTED",
	GAME_IN_PROGRESS = "GAME IN PROGRESS",
	TURN_ERROR = "TURN ERROR",
	MOVE_INVALID = "MOVE INVALID",
	MOVE_REPEATED = "MOVE REPEATED",
	NO_META = "NO META",
	NO_SUCH_GAME = "NO SUCH GAME",
	HIT = "HIT",
	MISS = "MISS",
	SUNK = "SUNK",
	SHIP_POSITIONED = "SHIPS POSITIONED",
	INVALID_SHIP_MARKERS = "INVALID SHIP MARKERS",
	BAD_SHIP_SIZE = "BAD SHIP SIZE",
	SHIP_POSITIONER_MISMATCH = "SHIP POSITIONER MISMATCH",
	GAME_OVER = "Game Over",
	BAD_LAYOUT = "BAD LAYOUT",
	BOARD_NOT_FOUND = "BOARD NOT FOUND",
	GAME_STARTED = "GAME STARTED",
	SHIP_BROKE_RULES = "SHIP BROKE RULES",
	GAME_TYPE_CHANGED = "GAME TYPE CHANGED",
	PLAYER_READY = "PLAYER READY",
	BAD_AT_PLAYER = "BAD AT PLAYER",

	ALREADY_IN_GAME = "ALREADY IN GAME",
}

export class Rules {
	/** Game type */
	type: GAME_TYPE;
	/** Number of ships per player */
	ships: POSITION_TYPE[];
	/** m x m size of game board */
	boardSize: number;

	/** minimum number of players that need to be in game before game start */
	minPlayers: number;
	constructor(type: GAME_TYPE) {
		this.type = type;
		this.ships = this.initShips(type);
		this.boardSize = this.initBoard(type);
		this.minPlayers = 2; //TODO: ALLOW FOR SOLO
	}

	private initShips(type: GAME_TYPE): POSITION_TYPE[] {
		if (type == GAME_TYPE.CLASSIC || type == GAME_TYPE.SOLO) {
			return [
				POSITION_TYPE.PATROL,
				POSITION_TYPE.SUBMARINE,
				// POSITION_TYPE.DESTROYER,
				POSITION_TYPE.BATTLESHIP,
				POSITION_TYPE.CARRIER,
			];
		} else if (type == GAME_TYPE.BASIC) {
			return [POSITION_TYPE.PATROL, POSITION_TYPE.DESTROYER];
		} else {
			throw new Error("Invalid Rule Type: This should never happen");
		}
	}

	private initBoard(type: GAME_TYPE): number {
		if (type == GAME_TYPE.CLASSIC || type == GAME_TYPE.SOLO) {
			return 8;
		} else if (type == GAME_TYPE.BASIC) {
			return 6;
		} else {
			throw new Error("Invalid Rule Type: This should never happen");
		}
	}

	/**
	 * Check ship for validity based on game rules
	 * @param ship ship to check if its valid to add to fleet
	 * @param curFleet current fleet of ships (before adding ship)
	 * @param grid game board squares grid
	 * @returns boolean on if the rules allow adding new ship to fleet
	 */
	validShip(ship: Ship, curFleet: Ship[], grid: Square[][]): boolean {
		//TODO: check if ships overlap
		//TODO: combine this logic with logic in Layout to check ship position validity
		const size = ship.type.size;
		if (this.type == GAME_TYPE.BASIC) {
			if (curFleet.length < 2) {
				if (
					ship.type.descriptor == SHIP_DESCRIPTOR.PATROL ||
					ship.type.descriptor == SHIP_DESCRIPTOR.DESTROYER
				) {
					for (let i = 0; i < curFleet.length; i++) {
						const s = curFleet[i];
						if (s.type.descriptor == ship.type.descriptor) {
							return false; //cannot have more than one ship per type
						}
					}
					return true;
				}
			}
		} else if (
			this.type == GAME_TYPE.CLASSIC ||
			this.type == GAME_TYPE.SOLO
		) {
			// class mode allows for one of each ship type/descriptor
			if (curFleet.length >= 4) {
				return false;
			}
			for (let i = 0; i < curFleet.length; i++) {
				const s = curFleet[i];
				if (s.type.descriptor == ship.type.descriptor) {
					return false; //cannot have more than one ship per type
				}
			}
			return true;
		} else {
			throw new Error(
				"Invalid Game Type When Checking if ship is allowed: This should never happen",
			);
		}
		return false;
	}

	count(size: number, ships: Ship[]): number {
		let count = 0;
		for (let i = 0; i < ships.length; i++) {
			const ship = ships[i];
			if (ship.type.size == size) {
				count++;
			}
		}
		return count;
	}
}

export class ResponseBoard {
	readonly id: string;
	readonly str: string;
	constructor(mine: Board, opponent: Board) {
		this.id = mine.id;
		this.str =
			this.boardToStr(mine, true) + this.boardToStr(opponent, false);
	}

	private boardToStr(board: Board, showFilled: boolean): string {
		let str = "";
		for (let r = board.grid.length - 1; r >= 0; r--) {
			for (let c = 0; c < board.grid.length; c++) {
				const square = board.grid[c][r];
				if (showFilled || square.state != BOARD_STATE.FILLED) {
					str += square.state;
				} else {
					str += BOARD_STATE.EMPTY;
				}
			}
		}
		return str;
	}
}
export class Response {
	valid: boolean;
	meta: string;

	constructor(
		valid: boolean,
		meta?: ResponseHeader | string,
		detail?: string,
	) {
		this.valid = valid;
		this.meta = meta ?? ResponseHeader.NO_META;
		if (detail) {
			this.addDetail(detail);
		}
	}

	addDetail(detail: string): void {
		this.meta += `-${detail}`;
	}
}
