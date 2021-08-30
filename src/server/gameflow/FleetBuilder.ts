import Board from "./Board";
import Game from "./Game";
import Ship from "./Ship";

class FleetBuilder {
	fleet: Ship[];
	grid: Board.Square[][];
	rules: Game.Rules;

	constructor(grid: Board.Square[][], rules: Game.Rules) {
		this.grid = grid;
		this.rules = rules;
		this.fleet = [];
	}

	add(ship: Ship): Game.Response {
		if (this.rules.validShip(ship, this.fleet, this.grid)) {
			this.fleet.push(ship);
			return new Game.Response(true);
		} else {
			return new Game.Response(
				false,
				Game.ResponseHeader.SHIP_BROKE_RULES,
			);
		}
	}
}

namespace FleetBuilder {}

export default FleetBuilder;
