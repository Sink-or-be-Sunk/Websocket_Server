import Board from "./Board";
import Game from "./Game";
import Move from "./Move";
import Ship from "./Ship";

class Fleet {
	ships: Ship[];
	type: Fleet.TYPE;
	board: Board;

	constructor(type: Fleet.TYPE, board: Board) {
		this.type = type;
		this.board = board;

		if (type == Fleet.TYPE.DEFAULT) {
			this.ships = [
				new Ship(new Ship.Type(Ship.CLASS.PATROL), this.board),
				new Ship(new Ship.Type(Ship.CLASS.SUBMARINE), this.board),
				new Ship(new Ship.Type(Ship.CLASS.DESTROYER), this.board),
				new Ship(new Ship.Type(Ship.CLASS.BATTLESHIP), this.board),
				new Ship(new Ship.Type(Ship.CLASS.CARRIER), this.board),
			];
		} else if (type == Fleet.TYPE.SMALL) {
			this.ships = [
				new Ship(new Ship.Type(Ship.CLASS.PATROL), this.board),
				new Ship(new Ship.Type(Ship.CLASS.PATROL), this.board),
			];
		} else {
			this.ships = [];
		}
	}

	attack(move: Move) {
		for (let i = 0; i < this.ships.length; i++) {
			const ship = this.ships[i];
			const res = ship.attack(move);
			if (res) {
				if (ship.state == Ship.STATE.SUNK) {
					return new Game.Response(
						true,
						Game.ResponseHeader.SUNK,
						ship.type.toString(),
					);
				} else {
					return new Game.Response(true, Game.ResponseHeader.HIT);
				}
			}
		}
		return new Game.Response(true, Game.ResponseHeader.MISS);
	}
}

namespace Fleet {
	export enum TYPE {
		DEFAULT = "DEFAULT",
		SMALL = "SMALL",
		INVALID = "INVALID",
	}
}

export default Fleet;
