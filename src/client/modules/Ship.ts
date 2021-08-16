import * as THREE from "three";
import * as Statics from "./Statics";
import Transform from "./Transform";

class Ship {
	mesh: THREE.Object3D;
	pos: number;
	length: number;
	orientation: Ship.ORIENTATION;
	private bow_stern: "y" | "x";
	private port_starboard: "y" | "x";

	constructor(mesh: THREE.Object3D) {
		this.pos = 0;
		this.mesh = mesh;
		this.orientation = Ship.ORIENTATION.HORIZONTAL;
		this.bow_stern = "x";
		this.port_starboard = "y";
		this.mesh.traverse((node) => {
			if (node instanceof THREE.Mesh) {
				node.castShadow = true;
				node.receiveShadow = true;
			}
		});
		this.mesh.scale.setScalar(5);
		var box = new THREE.Box3().setFromObject(this.mesh);
		var size = new THREE.Vector3();
		box.getSize(size);
		this.length = size.x;

		// this.mesh.position.copy(
		// 	Transform.tv(Statics.GRID_SPACING * 2, this.length / 2, 0),
		// );
		this.setOrientation(Ship.ORIENTATION.VERTICAL);
		this.position(7, 1);
	}

	position(x: number, y: number) {
		x *= Statics.GRID_SPACING;
		y *= Statics.GRID_SPACING;
		if (this.orientation === Ship.ORIENTATION.HORIZONTAL) {
			x += this.length / 2 - Statics.GRID_SPACING / 2;
		} else if (this.orientation === Ship.ORIENTATION.VERTICAL) {
			y += this.length / 2 - Statics.GRID_SPACING / 2;
		} else {
			throw Error("Invalid Ship Orientation: this should never happen");
		}
		this.mesh.position.copy(Transform.tv(x, y, 0));
	}

	setOrientation(o: Ship.ORIENTATION) {
		this.orientation = o;
		if (o == Ship.ORIENTATION.HORIZONTAL) {
			this.mesh.rotation.z = 0;
			this.bow_stern = "x";
			this.port_starboard = "y";
		} else if (o == Ship.ORIENTATION.VERTICAL) {
			this.mesh.rotation.z = Math.PI / 2;
			this.bow_stern = "y";
			this.port_starboard = "x";
		} else {
			throw Error("invalid orientation: this should never happen");
		}
	}

	wave(time: number) {
		const freq = 1.75;
		const intensity = 5;
		this.mesh.position.y = Math.sin(freq * time) * intensity;

		const rockIntensity = 0.0005;
		this.mesh.rotation[this.bow_stern] +=
			Math.sin(freq * time) * 2 * rockIntensity;
		this.mesh.rotation[this.port_starboard] +=
			Math.sin(freq * time) * 0.5 * rockIntensity;
	}
}

namespace Ship {
	export enum ORIENTATION {
		HORIZONTAL,
		VERTICAL,
	}
}

export default Ship;
