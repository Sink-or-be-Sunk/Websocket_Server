import * as THREE from "three";
import * as Statics from "./Statics";
import Transform from "./Transform";

class Ship {
	mesh: THREE.Object3D | null;
	length_3D: number;
	orientation: Ship.ORIENTATION;
	config: Ship.Config;
	squares: THREE.Mesh[];
	private bow_stern: "y" | "x";
	private port_starboard: "y" | "x";

	constructor(config: Ship.Config) {
		this.config = config;
		this.mesh = null;
		this.squares = [];
		this.orientation = Ship.ORIENTATION.VERTICAL; //FIXME: THIS IS USELESS CODE
		this.bow_stern = "x";
		this.port_starboard = "y";

		this.length_3D = -1;
	}

	addSquare(square: THREE.Mesh) {
		this.squares.push(square);
	}

	add3D(mesh: THREE.Object3D, x: number, y: number) {
		this.mesh = mesh;
		this.mesh.traverse((node) => {
			if (node instanceof THREE.Mesh) {
				node.castShadow = true;
				node.receiveShadow = true;
			}
		});
		this.mesh.scale.setScalar(this.config.scale);

		var box = new THREE.Box3().setFromObject(this.mesh);

		var size = new THREE.Vector3();
		box.getSize(size);
		this.length_3D = size.x;

		this.setOrientation(Ship.ORIENTATION.VERTICAL);
		this.position(x, y);
	}

	position(x: number, y: number) {
		if (!this.mesh) {
			throw Error("Tried to Position Ship Mesh that is Null");
		}
		x *= Statics.GRID_SPACING;
		y *= Statics.GRID_SPACING;
		if (this.orientation === Ship.ORIENTATION.HORIZONTAL) {
			x +=
				this.length_3D / 2 -
				Statics.GRID_SPACING / 2 +
				this.config.length_off;
		} else if (this.orientation === Ship.ORIENTATION.VERTICAL) {
			y +=
				this.length_3D / 2 -
				Statics.GRID_SPACING / 2 +
				this.config.length_off;
		} else {
			throw Error("Invalid Ship Orientation: this should never happen");
		}

		this.mesh.position.copy(Transform.tv(x, y, this.config.z_off));
	}

	setOrientation(o: Ship.ORIENTATION) {
		if (!this.mesh) {
			throw Error("Tried to Orient Ship Mesh that is Null");
		}
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
		if (!this.mesh) {
			return; //ignore wave before ship mesh has been loaded
		}

		const freq = 1;
		// const intensity = 1;
		// this.mesh.position.y += Math.sin(freq * time) * intensity;

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

	export class Config {
		path: String;
		scale: number;
		z_off: number;
		length_off: number;
		num_squares: number;

		constructor(
			path: String,
			scale: number,
			z_off: number,
			length_off: number,
			num_squares: number,
		) {
			this.path = path;
			this.scale = scale;
			this.z_off = z_off;
			this.length_off = length_off;
			this.num_squares = num_squares;
		}
	}
}

export default Ship;
