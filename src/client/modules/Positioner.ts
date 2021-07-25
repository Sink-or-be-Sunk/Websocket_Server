import * as Statics from "./Statics";
import Transform from "./Transform";

enum PositionState {
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
			Transform.tv(this.mid, 2 * this.mid, this.mid / 2),
		);
		this.look = new ViewPositions(
			Transform.tv(this.mid, this.mid / 2, 0),
			Transform.tv(this.mid, 3 * this.mid, this.mid / 2),
		);
	}

	private stateToObj(state: PositionState) {
		if (this.state == PositionState.SHIPS) {
			return {
				cx: this.camera.ship.x,
				cy: this.camera.ship.y,
				cz: this.camera.ship.z,
				lx: this.look.ship.x,
				ly: this.look.ship.y,
				lz: this.look.ship.z,
			};
		} else if (this.state == PositionState.ATTACK) {
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

	toggle() {
		const cur = this.stateToObj(this.state);
		this.nextState();
		const next = this.stateToObj(this.state);
		return { to: next, from: cur };
	}
}
