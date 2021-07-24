import SceneManager from "./3D/SceneManager";

const sceneManager = new SceneManager(3);

function animate() {
	requestAnimationFrame(animate);
	sceneManager.update();
}
animate();
