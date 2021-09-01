import { Square } from "./Board";
import { Rules, Response, ResponseHeader } from "./Game";
import { Ship } from "./Ship";

export default class FleetBuilder {
  fleet: Ship[];
  grid: Square[][];
  rules: Rules;

  constructor(grid: Square[][], rules: Rules) {
    this.grid = grid;
    this.rules = rules;
    this.fleet = [];
  }

  add(ship: Ship): Response {
    if (this.rules.validShip(ship, this.fleet, this.grid)) {
      this.fleet.push(ship);
      return new Response(true);
    } else {
      return new Response(false, ResponseHeader.SHIP_BROKE_RULES);
    }
  }
}
