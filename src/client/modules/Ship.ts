import * as THREE from "three";
import * as Statics from "./Statics";
import Transform from "./Transform";

export default class Ship {
	mesh: THREE.Group;
	pos: number;
	length: number;

	constructor(mesh: THREE.Group) {
		this.pos = 0;
		this.mesh = mesh;
		const scale = 5.5;
		this.mesh.scale.set(scale, scale, scale);
		var box = new THREE.Box3().setFromObject(this.mesh);
		var size = new THREE.Vector3();
		box.getSize(size);
		this.length = size.x;

		this.mesh.position.copy(Transform.tv(0, this.length / 2, 0));
		this.mesh.rotation.y = -Math.PI / 2;
	}

	position(x: number, y: number) {}
}
