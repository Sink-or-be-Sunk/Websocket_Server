// import SceneManager from "./3D/SceneManager";

// const sceneManager = new SceneManager(3);

// @ts-nocheck
import * as THREE from "three";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

class SceneManager {
	constructor(canvas) {
		this.scene = new THREE.Scene();
		this.renderer = this.buildRenderer(canvas);
		this.camera = this.buildCamera();
		this.sphere = this.buildSphere();
		this.sky = this.buildSky();
		this.sun = this.buildSun();
		this.water = this.buildWater();
		this.orbitCon = this.setOrbitControls();

		window.addEventListener("resize", () => {
			this.onWindowResize;
		});
	}

	buildRenderer(canvas) {
		const renderer = new THREE.WebGLRenderer();
		// renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		canvas.appendChild(renderer.domElement);
		return renderer;
	}

	buildCamera() {
		const camera = new THREE.PerspectiveCamera(
			55,
			window.innerWidth / window.innerHeight,
			1,
			20000,
		);
		camera.position.set(30, 30, 100);
		return camera;
	}

	// Objects
	buildSky() {
		const sky = new Sky();
		sky.scale.setScalar(10000);
		this.scene.add(sky);
		return sky;
	}

	buildSun() {
		const pmremGenerator = new THREE.PMREMGenerator(this.renderer);

		const sun = new THREE.Vector3();

		const theta = Math.PI * (0.49 - 0.5);
		const phi = 2 * Math.PI * (0.205 - 0.5);

		sun.x = Math.cos(phi);
		sun.y = Math.sin(phi) * Math.sin(theta);
		sun.z = Math.sin(phi) * Math.cos(theta);

		this.sky.material.uniforms["sunPosition"].value.copy(sun);

		this.scene.environment = pmremGenerator.fromScene(this.scene).texture;
		return sun;
	}

	buildWater() {
		const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
		const water = new Water(waterGeometry, {
			textureWidth: 512,
			textureHeight: 512,
			waterNormals: new THREE.TextureLoader().load(
				"https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg",
				function (texture) {
					texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
				},
			),
			alpha: 1.0,
			sunDirection: new THREE.Vector3(),
			sunColor: 0xffffff,
			waterColor: 0x001e0f,
			distortionScale: 3.7,
			fog: this.scene.fog !== undefined,
		});
		water.rotation.x = -Math.PI / 2;
		this.scene.add(water);
		return water;
	}

	buildSphere() {
		const geometry = new THREE.SphereGeometry(20, 20, 20);
		const material = new THREE.MeshStandardMaterial({
			color: 0xfcc742,
		});

		const sphere = new THREE.Mesh(geometry, material);
		this.scene.add(sphere);
		return sphere;
	}

	setOrbitControls() {
		const controls = new OrbitControls(
			this.camera,
			this.renderer.domElement,
		);
		controls.maxPolarAngle = Math.PI * 0.495;
		controls.target.set(0, 10, 0);
		controls.minDistance = 40.0;
		controls.maxDistance = 200.0;
		controls.update();
		return controls;
	}

	update = function () {
		// Animates water
		this.water.material.uniforms["time"].value += 1.0 / 60.0;

		const time = performance.now() * 0.001;
		this.sphere.position.y = Math.sin(time) * 2;
		this.sphere.rotation.x = time * 0.3;
		this.sphere.rotation.z = time * 0.3;
		this.renderer.render(this.scene, this.camera);
	};

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}
}

const canvas = document.createElement("div");
document.body.appendChild(canvas);

const sceneManager = new SceneManager(canvas);

function animate() {
	requestAnimationFrame(animate);
	sceneManager.update();
}
animate();
