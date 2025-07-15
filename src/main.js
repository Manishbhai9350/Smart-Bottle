import "./style.css";
import * as THREE from "three";
import fragmentShader from "./shaders/fragment.glsl";
import vertexShader from "./shaders/vertex.glsl";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import {
  AnimateCounters,
  AnimateHeadings,
  setupSplitedHeading,
} from "./utils/gsap";
import GUI from "lil-gui";
import { BottleData } from "./bottle-data";

gsap.registerPlugin(SplitText);

window.addEventListener("DOMContentLoaded", () => {
  let CurrentBottle = 1;
  let TotalBottle = 4;
  let IsAnimating = false;

  const qs = (rut = "") => document.querySelector(rut);

  const HeadingTargets = gsap.utils.toArray(".huge-text h1");
  const CounterTargets = gsap.utils.toArray(
    ".counter-container .counter .count h1"
  );
  const SplitedHeadings = setupSplitedHeading(HeadingTargets);
  const SplitedCounters = setupSplitedHeading(CounterTargets, {
    charsClass: "counter-char",
    linesClass: "counter-line",
    wordsClass: "counter-word",
  });

  SplitedCounters.lines[0].classList.add("counter-line-one");
  SplitedCounters.lines[1].classList.add("counter-line-two");
  gsap.set(SplitedCounters.lines[1].querySelectorAll(".counter-char"), {
    y: "100%",
  });

  SplitedHeadings.lines[0].classList.add("heading-line-one");
  SplitedHeadings.lines[1].classList.add("heading-line-two");
  gsap.set(SplitedHeadings.lines[1].querySelectorAll(".heading-char"), {
    y: "100%",
  });

  function UpdateCurrentBottleNumber(num = 1) {
    if (IsAnimating) return;
    const MainTL = gsap.timeline({
      onComplete() {
        IsAnimating = false;
      },
    });
    IsAnimating = true;
    CurrentBottle = num;
    CurrentBottle = CurrentBottle % TotalBottle;
    CurrentBottle = CurrentBottle == 0 ? TotalBottle : CurrentBottle;
    const TL1 = AnimateHeadings(
      qs(".heading-line-one"),
      qs(".heading-line-two"),
      () => {}
    );
    const TL2 = AnimateCounters(
      qs(".counter-line-one"),
      qs(".counter-line-two"),
      () => {},
      CurrentBottle,
      2,
      CounterTargets
    );
    MainTL.add([TL1, TL2], "<");
  }

  setInterval(() => {
    UpdateCurrentBottleNumber(CurrentBottle + 1);
  }, 1000);

  const { PI } = Math;

  const canvas = qs("canvas");

  canvas.width = innerWidth;
  canvas.height = innerHeight;

  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });

  const camera = new THREE.PerspectiveCamera(
    75,
    innerWidth / innerHeight,
    1,
    1000
  );
  camera.position.z = 5;

  const material = new THREE.ShaderMaterial({
    fragmentShader,
    vertexShader,
    uniforms: {
      uTime: { value: 0 },
    },
  });

  const gui = new GUI();

  const GlbLoader = new GLTFLoader();

  let Bottle = null;

  GlbLoader.load("/Bottle.glb", (glb) => {
    const model = glb.scene;
    Bottle = model;
    scene.add(Bottle);

    Bottle.scale.setScalar(1.5);
    Bottle.rotation.x = -0.04;
    Bottle.rotation.z = -Math.PI / 6;

    // Add a folder to organize the GUI

    // Traverse to find mesh and its material
    Bottle.traverse((child) => {
      if (child.isMesh && child.material && !!BottleData[child.name]) {

        // Default values if not present
        if(BottleData[child.name]) {
          child.material.roughness = BottleData[child.name].roughness
          child.material.metalness = BottleData[child.name].metalness
          if(BottleData[child.name]?.color){
            console.log(child.material.color,BottleData[child.name].color)
            child.material.color.set(BottleData[child.name].color)
          }
        }

        const MeshFolder = gui.addFolder(child.name)

        // Add GUI controllers
        MeshFolder
          .addColor({ color: `#${child.material.color.getHexString()}` }, "color")
          .name("Color")
          .onChange((val) => child.material.color.set(val));

        MeshFolder
          .add(child.material, "metalness", 0, 1)
          .step(0.01)
          .name("Metalness");
        MeshFolder
          .add(child.material, "roughness", 0, 1)
          .step(0.01)
          .name("Roughness");
        MeshFolder
          .add(child.material, "opacity", 0, 1)
          .step(0.01)
          .name("Opacity")
          .onChange((val) => (child.material.opacity = val));

        MeshFolder.add(child.material, "transparent").name("Transparent");

        MeshFolder.open();
      }
    });
  });
  // AMB Light

  const AmbLight = new THREE.AmbientLight(0xffffff, 0.5);

  // Lightning Setup

  const FrontLight = new THREE.DirectionalLight(0xffffff, 5);
  FrontLight.position.set(0, 0, 2);

  const Backlight = new THREE.DirectionalLight(0xffffff, 2);
  Backlight.position.set(-3, 1, -5);

  const Keylight = new THREE.DirectionalLight(0xffffff, 4);
  Keylight.position.set(3, -1, -5);

  const Toplight = new THREE.SpotLight(0xffffff, 10, 12, Math.PI / 10, 1, 0.5);
  Toplight.position.set(0, 10, 2);

  scene.add(FrontLight, AmbLight, Backlight, Keylight, Toplight);

  // const controls = new OrbitControls(camera,canvas)

  const clock = new THREE.Clock();
  let PrevTime = clock.getElapsedTime();

  function Animate() {
    const ct = clock.getElapsedTime();
    const dt = ct - PrevTime;
    PrevTime = ct;

    // controls.update(dt)
    renderer.render(scene, camera);
    requestAnimationFrame(Animate);
  }

  requestAnimationFrame(Animate);

  function resize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    renderer.setSize(innerWidth, innerHeight);
  }

  window.addEventListener("resize", resize);
});
