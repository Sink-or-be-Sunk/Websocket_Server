import * as THREE from "three";

export type OBJECT_MATERIAL = THREE.MeshStandardMaterial;

export const GRID_SPACING = 300;

export function calcMid(grid: number) {
	return ((grid - 1) / 2) * GRID_SPACING;
}
