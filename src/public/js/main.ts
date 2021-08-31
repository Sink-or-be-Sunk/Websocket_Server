import SomeClass from "./modules/something";
import * as THREE from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader"
const str = new SomeClass("string");

const vect = new THREE.Vector2();

const loader = new GLTFLoader();
loader.load("something", (gltf)=> {
  console.log("loaded"), undefined, (err: ErrorEvent)=> {
    console.error(err);
  } 
})