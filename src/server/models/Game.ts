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

	constructor(id: string, socket: WebSocket, size: number) {
		this.id = id;
		this.size = size;
		this.players = new Array<Player>();
		this.boards = new Array<Board>();
		console.log(`New Game Created: <${this.id}>`);
		this.add(new Player(id, socket));
		this.turn = 0;
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
			const move = new Move(moveRaw);
			if (move.isValid(this.size)) {
				console.log(`player <${id}> made move ${move.toString()}`);
				this.nextTurn();
				return new Game.Response(true);
			} else {
				return new Game.Response(false, Game.ResponseHeader.MOVE_ERROR);
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
		TURN_ERROR = "TURN ERROR",
		MOVE_ERROR = "MOVE ERROR",
		NO_META = "NO META",
		NO_SUCH_GAME = "NO SUCH GAME",
	}
	export class Response {
		valid: boolean;
		meta: string;

		constructor(valid: boolean, meta?: string) {
			this.valid = valid;
			this.meta = meta ?? Game.ResponseHeader.NO_META;
		}
	}
}
export default Game;
