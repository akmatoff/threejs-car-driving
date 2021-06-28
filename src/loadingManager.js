import * as THREE from "three";

const loadingScreenContainer = document.querySelector(
  "#loadingScreenContainer"
);
const progressContainer = document.querySelector("#progressContainer");
const progressBar = document.querySelector("#progressBar");

const manager = new THREE.LoadingManager();
manager.onProgress = (item, loaded, total) => {
  console.log(`Loading file ${item} \n ${loaded} items loaded of ${total}.`);
  progressBar.style.width = (loaded / total) * 100 + "%";
};

manager.onLoad = () => {
  loadingScreenContainer.style.display = "none";
  console.log("loaded");
};

export { manager };
