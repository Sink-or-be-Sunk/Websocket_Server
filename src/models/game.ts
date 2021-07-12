import * as WebSocket from "ws";
import Player from "./Player";

export default class Game {
	players: Player[];
	id: string;

	constructor(id: string, socket: WebSocket) {
		this.id = id;
		this.players = new Array();
		console.log(`New Game Created: <${this.id}>`);
		this.add(new Player(id, socket));
	}

	/**
	 *
	 * @param player
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
}
