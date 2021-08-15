import * as THREE from "three";
import * as Statics from "./Statics";
import Transform from "./Transform";

export default class Ship {
	mesh: THREE.Object3D;
	pos: number;
	length: number;

	constructor(mesh: THREE.Object3D) {
		this.pos = 0;
		this.mesh = mesh;
		this.mesh.scale.setScalar(5.5);
		var box = new THREE.Box3().setFromObject(this.mesh);
		var size = new THREE.Vector3();
		box.getSize(size);
		this.length = size.x;

		this.mesh.position.copy(
			Transform.tv(Statics.GRID_SPACING * 2, this.length / 2, 0),
		);
		this.mesh.rotation.z = -Math.PI / 2;
	}

	position(x: number, y: number) {}
}
