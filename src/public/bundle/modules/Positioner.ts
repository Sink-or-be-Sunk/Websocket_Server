import * as Statics from "./Statics";
import Transform from "./Transform";

export enum PositionState {
	SHIPS = "ships",
	ATTACK = "attack",
}
class ViewPositions {
	ship: THREE.Vector3;
	attack: THREE.Vector3;
	constructor(ship: THREE.Vector3, attack: THREE.Vector3) {
		this.ship = ship;
		this.attack = attack;
	}
}
export class PositionTransition {
	to: PositionSpreadObject;
	from: PositionSpreadObject;
	constructor(to: PositionSpreadObject, from: PositionSpreadObject) {
		this.to = to;
		this.from = from;
	}
}
class PositionSpreadObject {
	cx: number;
	cy: number;
	cz: number;
	lx: number;
	ly: number;
	lz: number;

	constructor(camera: ViewPositions, look: ViewPositions) {
		this.cx = camera.ship.x;
		this.cy = camera.ship.y;
		this.cz = camera.ship.z;
		this.lx = look.ship.x;
		this.ly = look.ship.y;
		this.lz = look.ship.z;
	}
}
export default class Positioner {
	state: PositionState;
	camera: ViewPositions;
	look: ViewPositions;
	mid: number;

	constructor(grid: number) {
		this.state = PositionState.SHIPS;
		this.mid = Statics.calcMid(grid);
		this.camera = new ViewPositions(
			Transform.tv(this.mid, -this.mid, this.mid),
			Transform.tv(this.mid, (3 / 2) * this.mid, (6 / 5) * this.mid),
		);
		this.look = new ViewPositions(
			Transform.tv(this.mid, this.mid / 2, 0),
			Transform.tv(this.mid, 3 * this.mid, (5 / 4) * this.mid),
		);
	}

	private stateToObj(state: PositionState): PositionSpreadObject {
		if (state == PositionState.SHIPS) {
			return {
				cx: this.camera.ship.x,
				cy: this.camera.ship.y,
				cz: this.camera.ship.z,
				lx: this.look.ship.x,
				ly: this.look.ship.y,
				lz: this.look.ship.z,
			};
		} else if (state == PositionState.ATTACK) {
			return {
				cx: this.camera.attack.x,
				cy: this.camera.attack.y,
				cz: this.camera.attack.z,
				lx: this.look.attack.x,
				ly: this.look.attack.y,
				lz: this.look.attack.z,
			};
		} else {
			throw Error("Invalid State when requesting Object");
		}
	}

	nextState() {
		if (this.state == PositionState.SHIPS) {
			this.state = PositionState.ATTACK;
		} else if (this.state == PositionState.ATTACK) {
			this.state = PositionState.SHIPS;
		}
	}

	transitionAttack() {
		const cur = this.stateToObj(this.state);
		const next = this.stateToObj(PositionState.ATTACK);
		if (this.state != PositionState.ATTACK) {
			this.state = PositionState.ATTACK;
			return new PositionTransition(next, cur);
		} else {
			return new PositionTransition(cur, cur);
		}
	}

	transitionShips() {
		const cur = this.stateToObj(this.state);
		const next = this.stateToObj(PositionState.SHIPS);
		if (this.state != PositionState.SHIPS) {
			this.state = PositionState.SHIPS;
			return new PositionTransition(next, cur);
		} else {
			return new PositionTransition(cur, cur);
		}
	}
}
