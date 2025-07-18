import "./style.css";
import * as THREE from "three";
import fragmentShader from "./shaders/fragment.glsl";
import vertexShader from "./shaders/vertex.glsl";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
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
  let CurrentVariant = 1;
  let TotalBottle = 4;
  let IsAnimating = false;

  const qs = (rut = "") => document.querySelector(rut);

  const HeadingTargets = gsap.utils.toArray(".huge-text h1");
  const CounterTargets = gsap.utils.toArray(
    ".counter-container .counter .count h1"
  );
  const SplitedHeadings = setupSplitedHeading(HeadingTargets);
  const SplitedCounters = setupSplitedHeading(CounterTargets,{
    linesClass:'counter-line',
    charsClass:'counter-char',
    wordsClass:'counter-word'
  });

  SplitedHeadings.lines[0].classList.add("heading-line-one");
  SplitedHeadings.lines[1].classList.add("heading-line-two");
  gsap.set(SplitedHeadings.lines[1].querySelectorAll(".heading-char"), {
    y: "100%",
  });


  SplitedCounters.lines[0].classList.add("counter-line-one");
  SplitedCounters.lines[1].classList.add("counter-line-two");
  gsap.set(SplitedCounters.lines[1].querySelectorAll(".counter-char"), {
    y: "100%",
  });


  function UpdateLoading(progress = 0) {
    gsap.to(".line", {
      width: innerWidth * 0.6 * progress,
    });
  }

  function UpdateCurrentBottleNumber(num = 1) {
    if (IsAnimating) return;
    const MainTL = gsap.timeline({
      onComplete() {
        IsAnimating = false;
      },
    });
    IsAnimating = true;
    let CurrentBottle = num;
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
      num,
      2
    );
    MainTL.add([TL1,TL2],'<');
    return MainTL;
  }

  let Bottle = null;
  let BottleBody = null;
  let BottleCap = null;
  let BottleBrand = null;
  let HasContentShown = false;

  function ShowContent() {
    const BottleTL = gsap.timeline({
      onComplete:() => HasContentShown = true
    });
    gsap.fromTo(
      Bottle.position,
      {
        y: -1 / 10,
      },
      {
        y: 1 / 10,
        repeat: -1,
        yoyo: true,
        duration: 2,
        ease: "power1.inOut",
      },
      "<"
    );
    BottleTL.to(
      Bottle.position,
      {
        x: 0,
        duration: 1.5,
        ease: "power3.out",
      },
      "<"
    );
    BottleTL.to(
      Bottle.rotation,
      {
        x: 0.15,
        z: -0.2,
        y: 0.3,
        duration: 2,
        ease: "back.out",
      },
      "<"
    );
    UpdateCurrentBottleNumber(1);
  }

  function MouseMove(e) {
    if (!Bottle || !HasContentShown) return;
    const { clientX, clientY } = e;
    const NX = (clientX / innerWidth) * 2 - 1;
    const NY = -((clientY / innerHeight) * 2 - 1);

    gsap.to(Bottle.rotation, {
      y: 0.3 + NX * 0.5,
      ease: "power3.out",
      duration: 3,
    });
  }


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

  resize()


  const material = new THREE.ShaderMaterial({
    fragmentShader,
    vertexShader,
    uniforms: {
      uTime: { value: 0 },
    },
  });

  const gui = new GUI();
  gui
    .add({ variants: [] }, "variants", [1, 2, 3, 4])
    .setValue(1)
    .name("Bottle Varint")
    .onChange((variant) => {
      CurrentVariant = variant;
      UpdateCurrentBottleNumber(CurrentVariant);
      if (!BottleBody || !BottleBrand) return;
      const BodyVariantData = BottleData["body"].variants[variant - 1];
      const BodyColor = new THREE.Color(BodyVariantData.color);
      const BrandVariantData = BottleData["brand"].variants[variant - 1];
      const BrandColor = new THREE.Color(BrandVariantData.color);
      gsap.to(BottleBody.material, {
        metalness: BodyVariantData.metalness,
        roughness: BodyVariantData.roughness,
        duration: 1,
        ease: "power3.inOut",
      });
      gsap.to(BottleBody.material.color, {
        r: BodyColor.r,
        g: BodyColor.g,
        b: BodyColor.b,
        duration: 1,
        ease: "power3.inOut",
      });
      gsap.to(BottleBrand.material, {
        metalness: BrandVariantData.metalness,
        roughness: BrandVariantData.roughness,
        duration: 1,
        ease: "power3.inOut",
      });
      gsap.to(BottleBrand.material.color, {
        r: BrandColor.r,
        g: BrandColor.g,
        b: BrandColor.b,
        duration: 1,
        ease: "power3.inOut",
      });
    });
  gui.close();

  const Manager = new THREE.LoadingManager(
    // On Load Function
    () => {
      const ShowTL = gsap.timeline({
        onComplete: () => {
          ShowContent()
          gsap.to(".overlay", {
            display: "none",
          });
        },
      });
      ShowTL.to(".line", {
        width: 0,
      });
      ShowTL.to(".overlay", {
        opacity: 0,
      });
    },
    // While Load Function
    (_, loaded, total) => {
      let Progress = loaded / total;
      Progress = Math.min(Progress, 1);

      UpdateLoading(Progress);
    },
    // Error While Loading
    () => {}
  );

  const GlbLoader = new GLTFLoader(Manager);
  const RgbeLoader = new RGBELoader(Manager);

  RgbeLoader.load("/env.hdr", (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    // scene.background = texture;
    scene.environment = texture;
  });

  GlbLoader.load("/Bottle_1.glb", (glb) => {
    const model = glb.scene;
    Bottle = model;
    scene.add(Bottle);

    Bottle.scale.setScalar(1.5);
    Bottle.position.x = 20.04;
    Bottle.rotation.z = -Math.PI / 6;

    // Add a folder to organize the GUI

    // Traverse to find mesh and its material
    Bottle.traverse((child) => {
      if (child.isMesh && child.material && !!BottleData[child.name]) {
        // Default values if not present
        console.log(child.name);
        const MeshFolder = gui.addFolder(child.name);
        MeshFolder.close();

        if (child.name == "body") {
          BottleBody = child;
          MeshFolder.add(BottleBody.position, "x").min(-5).max(5);
          MeshFolder.add(BottleBody.position, "y").min(-5).max(5);
          MeshFolder.add(BottleBody.position, "z").min(-5).max(5);
        }
        if (child.name == "cap") {
          BottleCap = child;
          MeshFolder.add(BottleCap.position, "x").min(-5).max(5);
          MeshFolder.add(BottleCap.position, "y").min(-5).max(5);
          MeshFolder.add(BottleCap.position, "z").min(-5).max(5);
        }
        if (child.name == "brand") {
          BottleBrand = child;
          MeshFolder.add(BottleBrand.position, "x").min(-5).max(5);
          MeshFolder.add(BottleBrand.position, "y").min(-5).max(5);
          MeshFolder.add(BottleBrand.position, "z").min(-5).max(5);
        }
        if (BottleData[child.name]) {
          if (child.name == "body" || child.name == "brand") {
            child.material.roughness =
              BottleData[child.name].variants[0].roughness;
            child.material.metalness =
              BottleData[child.name].variants[0].metalness;
            child.material.color.set(BottleData[child.name].variants[0].color);
          } else {
            child.material.roughness = BottleData[child.name].roughness;
            child.material.metalness = BottleData[child.name].metalness;
          }
        }

        // Add GUI controllers
        MeshFolder.addColor(
          { color: `#${child.material.color.getHexString()}` },
          "color"
        )
          .name("Color")
          .onChange((val) => child.material.color.set(val));

        MeshFolder.add(child.material, "metalness", 0, 1)
          .step(0.01)
          .name("Metalness");
        MeshFolder.add(child.material, "roughness", 0, 1)
          .step(0.01)
          .name("Roughness");
        MeshFolder.add(child.material, "opacity", 0, 1)
          .step(0.01)
          .name("Opacity")
          .onChange((val) => (child.material.opacity = val));

        MeshFolder.add(child.material, "transparent").name("Transparent");
      }
    });
  });
  // AMB Light

  const AmbLight = new THREE.AmbientLight(0xffffff, 0.5);

  // Lightning Setup

  const FrontLight = new THREE.DirectionalLight(0xffffff, 4);
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
    renderer.setPixelRatio(Math.min(2,window.devicePixelRatio))
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    renderer.setSize(innerWidth, innerHeight);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", MouseMove);
});
