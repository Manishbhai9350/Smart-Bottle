import "./style.css";
import * as THREE from "three";
import fragmentShader from "./shaders/fragment.glsl";
import vertexShader from "./shaders/vertex.glsl";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { AnimateHeadings, setupSplitedHeading } from "./utils/gsap";

gsap.registerPlugin(SplitText);

window.addEventListener("DOMContentLoaded", () => {


  const qs = (rut='') => document.querySelector(rut)


  const HeadingTargets = gsap.utils.toArray('.huge-text h1')
  const SplitedHeadings = setupSplitedHeading(HeadingTargets)

  SplitedHeadings.lines[0].classList.add('heading-line-one')
  SplitedHeadings.lines[1].classList.add('heading-line-two')
  gsap.set(SplitedHeadings.lines[1].querySelectorAll('.heading-char'),{
    y:'100%'
  })
  AnimateHeadings(qs('.heading-line-one'),qs('.heading-line-two'),() => {
  AnimateHeadings(qs('.heading-line-one'),qs('.heading-line-two'))
  })


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

  const GlbLoader = new GLTFLoader();

  let Bottle = null;

  GlbLoader.load("/bottle.glb", (glb) => {
    const model = glb.scene;
    Bottle = model;
    scene.add(Bottle);
    Bottle.receiveShadow = true;
    Bottle.castShadow = true;
    Bottle.scale.setScalar(1.5);
    Bottle.rotation.x = -0.04;
    Bottle.rotation.z = -Math.PI / 6;
    if (Bottle?.material) {
      Bottle.material.metalness = 0.7;
      Bottle.material.roughness = 0.4;
    }
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
