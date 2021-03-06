import * as THREE from "three";
import * as Statics from "./Statics";

export default class InteractionManager {
	private camera: THREE.Camera;
	private raycaster = new THREE.Raycaster();
	private domElements = document;
	private objects: THREE.Mesh[];
	private active: THREE.Mesh[];

	constructor(camera: THREE.Camera) {
		this.camera = camera;
		this.createListeners();
		this.objects = [];
		this.active = [];
	}

	add(object: THREE.Mesh[]) {
		this.objects.push(...object);
	}

	createListeners() {
		this.domElements.addEventListener("mousemove", (event) => {
			const intersections = this.getIntersections(event);
			this.clear();
			for (let i = 0; i < intersections.length; i++) {
				const intersection = intersections[i].object as THREE.Mesh;
				this.active.push(intersection);
				const material =
					intersection.material as Statics.OBJECT_MATERIAL;
				material.color.set(0xff0000);
				(material.opacity = 0.1), (intersection.visible = true);
			}
		});
		this.domElements.addEventListener("click", (event) => {
			const intersections = this.getIntersections(event);
			for (let i = 0; i < intersections.length; i++) {
				const intersection = intersections[i].object as THREE.Mesh;
				console.log(intersection.position);
			}
		});
	}

	clear() {
		for (let i = 0; i < this.objects.length; i++) {
			const object = this.objects[i];
			object.visible = false;
		}
	}

	getIntersections(event: MouseEvent) {
		const mouse = new THREE.Vector2(
			(event.clientX / window.innerWidth) * 2 - 1,
			-(event.clientY / window.innerHeight) * 2 + 1,
		);
		this.raycaster.setFromCamera(mouse, this.camera);
		return this.raycaster.intersectObjects(this.objects);
	}
}
