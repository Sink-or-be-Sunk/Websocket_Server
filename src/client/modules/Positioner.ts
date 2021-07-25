import Statics from "./Statics";
import Transform from "./Transform";

enum PositionState {
	SHIPS,
	ATTACK,
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
		this.mid = ((grid - 1) / 2) * Statics.GRID_SPACING;
		this.camera = new ViewPositions(
			Transform.tv(this.mid, -300, 300),
			Transform.tv(this.mid, 100, 100),
		);
		this.look = new ViewPositions(
			Transform.tv(this.mid, this.mid / 2, 0),
			Transform.tv(this.mid, 100, 100),
		);
	}
}
