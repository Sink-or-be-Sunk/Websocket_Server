import WebSocket from "ws";
import Player from "./Player";

export default class Game {
	players: Player[];
	id: string;
	turn: number;

	constructor(id: string, socket: WebSocket) {
		this.id = id;
		this.players = new Array();
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
	makeMove(id: string, move: string): GameResponse {
		if (this.players[this.turn].id == id) {
			//TODO: need to check for valid move
			console.log(`player <${id}> made move ${move}`);
			this.nextTurn();
			return new GameResponse(true);
		} else {
			return new GameResponse(false, GameResponse.TURN_ERROR);
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

export class GameResponse {
	static readonly TURN_ERROR = "TURN ERROR";
	static readonly MOVE_ERROR = "MOVE ERROR";
	static readonly NO_META = "NO META";
	static readonly NO_SUCH_GAME = "NO SUCH GAME";

	valid: boolean;
	meta: string;

	constructor(valid: boolean, meta?: string) {
		this.valid = valid;
		this.meta = meta ?? GameResponse.NO_META;
	}
}
