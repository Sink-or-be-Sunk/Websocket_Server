import * as THREE from "three";
import * as Statics from "./Statics";

export default class InteractionManager {
	private camera: THREE.Camera;
	private scene: THREE.Scene;
	private renderer: THREE.Renderer;
	private raycaster = new THREE.Raycaster();
	private domElements = document;
	private objects: THREE.Mesh[];
	private active: THREE.Mesh[];

	constructor(
		camera: THREE.Camera,
		renderer: THREE.Renderer,
		scene: THREE.Scene,
	) {
		this.camera = camera;
		this.renderer = renderer;
		this.scene = scene;
		this.createListeners();
		this.objects = [];
		this.active = [];
	}

	add(object: THREE.Mesh[]) {
		this.objects.push(...object);
	}

	createListeners() {
		this.domElements.addEventListener(
			"mousemove",
			(event) => {
				this.updateObjects(event);
			},
			false,
		);
	}

	updateObjects(event: MouseEvent) {
		const mouse = new THREE.Vector2(
			(event.clientX / window.innerWidth) * 2 - 1,
			-(event.clientY / window.innerHeight) * 2 + 1,
		);
		this.raycaster.setFromCamera(mouse, this.camera);

		const intersections = this.raycaster.intersectObjects(this.objects);
		console.log(intersections);

		for (let i = 0; i < intersections.length; i++) {
			const intersection = intersections[i].object as THREE.Mesh;
			this.active.push(intersection);
			const material = intersection.material as Statics.OBJECT_MATERIAL;
			material.color.set(0xff0000);
		}
		this.renderer.render(this.scene, this.camera);
	}
}
