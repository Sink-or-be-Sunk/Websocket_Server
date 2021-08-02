import Board from "./Board";
import Game from "./Game";
import Layout from "./Layout";
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

	add(start: Layout.Position, end: Layout.Position): Game.Response {
		let size = -1;
		if (start.o == Layout.Orientation.HORIZONTAL) {
			size = end.c - start.c + 1;
		} else if (start.o == Layout.Orientation.VERTICAL) {
			size = end.r - start.r + 1;
		} else {
			throw new Error("Invalid orientation.  This should never happen");
		}
		const ship = this.rules.createShip(size, this.fleet, this.grid);
		if (ship) {
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
