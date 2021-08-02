import WebSocket from "ws";
import Board from "./Board";
import Player from "./Player";
import Move from "./Move";
import Layout from "./Layout";
import Ship from "./Ship";
class Game {
	/**
	 * List of all players in the game
	 */
	players: Player[];
	/**
	 * Boards have one to one mapping with player array
	 */
	boards: Board[];
	/**
	 * unique game id
	 */
	id: string;
	/**
	 * Indicated index of players array who has current turn
	 */
	turn: number;
	/**
	 * Indicated whether or not game is in progress
	 */
	started: boolean;
	/**
	 * sets up the game rules
	 */
	rules: Game.Rules;

	constructor(id: string, socket: WebSocket, type?: Game.TYPE) {
		this.id = id;
		if (type) {
			this.rules = new Game.Rules(type);
		} else {
			this.rules = new Game.Rules(Game.TYPE.CLASSIC);
		}
		this.players = new Array<Player>();
		this.boards = new Array<Board>();
		console.log(`New ${this.rules.type} Game Created: <${this.id}>`);
		this.add(new Player(id, socket));
		this.turn = 0;
		this.started = false; //wait until ship positions are locked in
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
				console.log(
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
		console.log(`Player <${player.id}> added to Game <${this.id}>`);

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
			if (player == p) {
				return false;
			}
		}
		this.newPlayer(player);
		return true;
	}

	private readyUp(id: string): void {
		this.started = true;
		for (let i = 0; i < this.players.length; i++) {
			const player = this.players[i];
			if (id == player.id) {
				player.ready = true;
			}
			if (!player.ready) {
				this.started = false;
			}
		}
		if (this.started) {
			console.log("Game Started");
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

	/**
	 *
	 * @param id - id of player making move
	 * @param move - move being made
	 * @returns true if move is valid, false otherwise
	 */
	makeMove(id: string, moveRaw: string): Game.Response {
		if (this.players[this.turn].id == id) {
			if (this.started) {
				const move = new Move(moveRaw);
				if (move.isValid(this.rules.boardSize)) {
					const board = this.boards[this.turn];
					const res = board.makeMove(move);
					if (res.valid) {
						console.log(
							`player <${id}> made move ${move.toString()}`,
						);
						this.nextTurn();
					}
					return res;
				} else {
					return new Game.Response(
						false,
						Game.ResponseHeader.MOVE_INVALID,
					);
				}
			} else {
				return new Game.Response(
					false,
					Game.ResponseHeader.GAME_NOT_STARTED,
				);
			}
		} else {
			return new Game.Response(false, Game.ResponseHeader.TURN_ERROR);
		}
	}

	positionShips(id: string, positionsRaw: string): Game.Response {
		if (this.started) {
			return new Game.Response(
				false,
				Game.ResponseHeader.GAME_IN_PROGRESS,
			);
		} else {
			const layout = new Layout(positionsRaw);
			if (layout.type == Layout.TYPE.VALID) {
				const board = this.getBoardByID(id);
				if (board) {
					const res = board.updateShipLayout(layout, this.rules);
					if (res.valid) {
						this.readyUp(id);
						if (this.started) {
							res.addDetail(Game.ResponseHeader.GAME_STARTED);
						}
					}
					return res;
				} else {
					return new Game.Response(
						false,
						Game.ResponseHeader.BOARD_NOT_FOUND,
					);
				}
			} else {
				return new Game.Response(false, Game.ResponseHeader.BAD_LAYOUT);
			}
		}
	}

	private nextTurn(): void {
		const prevTurn = this.turn;
		this.turn++;
		if (this.turn >= this.players.length) {
			this.turn = 0;
		}
		console.log(
			`Turn changed from <${this.players[prevTurn].id}> to <${
				this.players[this.turn].id
			}>`,
		);
	}
}

namespace Game {
	export enum TYPE {
		CLASSIC = "CLASSIC",
		BASIC = "BASIC", //SMALL game mode for testing
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
		BAD_SHIP_SIZE = "BAD SHIP SIZE",
		SHIP_POSITIONER_MISMATCH = "SHIP POSITIONER MISMATCH",
		GAME_OVER = "GAME OVER",
		BAD_LAYOUT = "BAD LAYOUT",
		BOARD_NOT_FOUND = "BOARD NOT FOUND",
		GAME_STARTED = "GAME STARTED",
		SHIP_BROKE_RULES = "SHIP BROKE RULES",
	}

	export class Rules {
		/**
		 * Game type
		 */
		type: TYPE;
		/**
		 * Number of ships per player
		 */
		ships: number;
		/**
		 * m x m size of game board
		 */
		boardSize: number;

		constructor(type: TYPE) {
			this.type = type;
			this.ships = this.initShips(type);
			this.boardSize = this.initBoard(type);
		}

		private initShips(type: TYPE): number {
			if (type == TYPE.CLASSIC) {
				return 5;
			} else if (type == TYPE.BASIC) {
				return 2;
			} else {
				throw new Error("Invalid Rule Type: This should never happen");
			}
		}

		private initBoard(type: TYPE): number {
			if (type == TYPE.CLASSIC) {
				return 10; //TODO: Is this correct?
			} else if (type == TYPE.BASIC) {
				return 8;
			} else {
				throw new Error("Invalid Rule Type: This should never happen");
			}
		}

		private sizeToType(size: number, count: number): Ship.Type {
			if (size == 2) {
				return new Ship.Type(Ship.DESCRIPTOR.PATROL);
			} else if (size == 3) {
				if (count) {
					if (count > 0) {
						//TODO: this could use some refinement, maybe use enum for instance type
						return new Ship.Type(Ship.DESCRIPTOR.SUBMARINE);
					}
				}
				return new Ship.Type(Ship.DESCRIPTOR.DESTROYER);
			} else if (size == 4) {
				return new Ship.Type(Ship.DESCRIPTOR.BATTLESHIP);
			} else if (size == 5) {
				return new Ship.Type(Ship.DESCRIPTOR.CARRIER);
			} else {
				return new Ship.Type(Ship.DESCRIPTOR.INVALID_SIZE);
			}
		}

		/**
		 * Create Ship and Check for validity based on game rules
		 * @param size ship size
		 * @param fleet current fleet of ships
		 * @param grid game board squares grid
		 * @returns Ship or false if the rules don't allow adding new ship to fleet
		 */
		createShip(
			size: number,
			fleet: Ship[],
			grid: Board.Square[][],
		): Ship | false {
			if (this.type == Game.TYPE.BASIC) {
				if (size == 2) {
					if (fleet.length < 2) {
						//small mode allows for two patrol boats
						const type = new Ship.Type(Ship.DESCRIPTOR.PATROL);
						const ship = new Ship(type, grid);
						return ship;
					}
				}
			} else if (this.type == Game.TYPE.CLASSIC) {
				// class mode allows for one of each ship type
				const count = this.count(size, fleet);
				const type = this.sizeToType(size, count);
				const ship = new Ship(type, grid);
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
	export class Response {
		valid: boolean;
		meta: string;

		constructor(valid: boolean, meta?: ResponseHeader, detail?: string) {
			this.valid = valid;
			this.meta = meta ?? Game.ResponseHeader.NO_META;
			if (detail) {
				this.addDetail(detail);
			}
		}

		addDetail(detail: string) {
			this.meta += `-${detail}`;
		}
	}
}
export default Game;
