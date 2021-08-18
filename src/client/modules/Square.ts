import Board from "../../server/models/Board";

class Square_3D extends Board.Square {
	mesh: THREE.Mesh;

	constructor(c: number, r: number) {
		super(c, r);

		this.mesh = this.createSquare(); //TODO: LEFT OFF HERE, IMPLEMENT SQUARE CLASS TO HANDLE INTERACTIONS AND DIFFERENT TYPES(ATTACK, SHIPS)
	}

	private createSquare(x: number, y: number, z: number): THREE.Mesh {
		const geometry = new THREE.PlaneGeometry(
			Statics.GRID_SPACING,
			Statics.GRID_SPACING,
		);
		const material = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			transparent: true,
			opacity: 0.05,
		});

		const plane = new THREE.Mesh(geometry, material);

		plane.position.copy(Transform.tv(x, y, z));
		this.scene.add(plane);
		return plane;
	}
}

namespace Square_3D {}

export default Square_3D;
