import WebSocket from "ws";
import Board from "./Board";
import Player from "./Player";
import Move from "./Move";
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
	 * The m x m size of the game board matrix
	 */
	size: number;
	/**
	 * Indicated whether or not game is in progress
	 */
	started: boolean;

	constructor(id: string, socket: WebSocket, size: number) {
		this.id = id;
		this.size = size;
		this.players = new Array<Player>();
		this.boards = new Array<Board>();
		console.log(`New Game Created: <${this.id}>`);
		this.add(new Player(id, socket));
		this.turn = 0;
		this.started = false; //wait until another player joins before starting
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
		this.players.push(player);
		this.boards.push(new Board(player.id, this.size));
		if (this.players.length > 1) {
			this.started = true;
		}
		console.log(`Player <${player.id}> added to Game <${this.id}>`);
		return true;
	}

	/**
	 * Checks if player is in the game
	 * @param id - id of player
	 * @returns true if player is in game, false otherwise
	 */
	contains(id: string) {
		for (let i = 0; i < this.players.length; i++) {
			const player = this.players[i];
			if (player.id == id) {
				return true;
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
				if (move.isValid(this.size)) {
					const board = this.boards[this.turn];
					const res = board.makeMove(move);
					if (res.valid) {
						console.log(
							`player <${id}> made move ${move.toString()}`,
						);
						board.show();
						this.nextTurn();
						return res;
					} else {
						return new Game.Response(
							false,
							Game.ResponseHeader.MOVE_REPEATED,
						);
					}
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

	private nextTurn() {
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
	export enum ResponseHeader {
		GAME_NOT_STARTED = "GAME NOT STARTED",
		TURN_ERROR = "TURN ERROR",
		MOVE_INVALID = "MOVE INVALID",
		MOVE_REPEATED = "MOVE REPEATED",
		NO_META = "NO META",
		NO_SUCH_GAME = "NO SUCH GAME",
		HIT = "HIT",
		MISS = "MISS",
		SUNK = "SUNK",
	}
	export class Response {
		valid: boolean;
		meta: string;

		constructor(valid: boolean, meta?: ResponseHeader, detail?: string) {
			this.valid = valid;
			this.meta = meta ?? Game.ResponseHeader.NO_META;
			if (detail) {
				this.meta += `-${detail}`;
			}
		}
	}
}
export default Game;
