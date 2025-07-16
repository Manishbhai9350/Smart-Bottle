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
  let CurrentVariant = 1;
  let TotalBottle = 4;
  let IsAnimating = false;

  const qs = (rut = "") => document.querySelector(rut);

  const HeadingTargets = gsap.utils.toArray(".huge-text h1");
  const CounterTargets = gsap.utils.toArray(
    ".counter-container .counter .count h1"
  );
  const ProgressTargets = gsap.utils.toArray(".loading-progress h1");

  const SplitedHeadings = setupSplitedHeading(HeadingTargets);
  const SplitedCounters = setupSplitedHeading(CounterTargets, {
    charsClass: "counter-char",
    linesClass: "counter-line",
    wordsClass: "counter-word",
  });
  const SplitedProgress = setupSplitedHeading(ProgressTargets, {
    charsClass: "progress-char",
    linesClass: "progress-line",
    wordsClass: "progress-word",
  });

  SplitedCounters.lines[0].classList.add("counter-line-one");
  SplitedCounters.lines[1].classList.add("counter-line-two");
  gsap.set(SplitedCounters.lines[0].querySelectorAll(".counter-char"), {
    y: "100%",
  });
  gsap.set(SplitedCounters.lines[1].querySelectorAll(".counter-char"), {
    y: "100%",
  });

  SplitedHeadings.lines[0].classList.add("heading-line-one");
  SplitedHeadings.lines[1].classList.add("heading-line-two");
  gsap.set(SplitedHeadings.lines[0].querySelectorAll(".heading-char"), {
    y: "100%",
  });
  gsap.set(SplitedHeadings.lines[1].querySelectorAll(".heading-char"), {
    y: "100%",
  });

  SplitedProgress.lines[0].classList.add("progress-line-one");
  SplitedProgress.lines[1].classList.add("progress-line-two");
  gsap.set(SplitedProgress.lines[1].querySelectorAll(".progress-char"), {
    y: "100%",
  });

  function IsPrevsZero(Prog, j) {
    let IsZeros = true;
    for (let i = 0; i < j; i++) {
      if (Number(Prog[i]) !== 0) {
        IsZeros = false;
        return IsZeros;
      }
    }
    return IsZeros;
  }

  let HasLoadingFinished = false;
  let LoadingUpdates = [];
  let LoadingUpdateIndex = 0;

  function UpdateLoading() {
    let Prog = LoadingUpdates[LoadingUpdateIndex].toString().split("");
    if (Prog.length < 3) {
      for (let i = 0; i < 3; i++) {
        if (!Prog[i]) {
          Prog.unshift("0");
        }
      }
    }
    Prog = Prog.join("");

    const ProgLineOne = qs(".progress-line-one");
    const ProgLineTwo = qs(".progress-line-two");

    const ProgLineOneChars = gsap.utils.toArray(
      ".progress-line-one .progress-char"
    );
    const ProgLineTwoChars = gsap.utils.toArray(
      ".progress-line-two .progress-char"
    );

    ProgLineTwoChars.forEach((Item, i) => {
      const Val = Prog[i];
      Item.innerText = Val;
      if (Val == "0" && IsPrevsZero(Prog, i) && i < 1) {
        gsap.set(Item, {
          opacity: 0,
        });
      } else {
        gsap.set(Item, {
          opacity: 1,
        });
      }
    });

    const ProgTL = gsap.timeline({
      onComplete() {
        ProgLineOne.classList.remove("progress-line-one");
        ProgLineOne.classList.add("progress-line-two");
        ProgLineTwo.classList.remove("progress-line-two");
        ProgLineTwo.classList.add("progress-line-one");
        
        gsap.set(ProgLineOneChars, {
          y: "100%",
        });
        LoadingUpdateIndex++;
        HasLoadingFinished = LoadingUpdateIndex > LoadingUpdates.length ;
        if (HasLoadingFinished) {
          const OutTL = gsap.timeline({
            onComplete:ShowContent
          })
          OutTL.to('.progress-line-one .progress-char',{
            y:'-100%',
            stagger:.04
          })
          OutTL.to('.loading-progress',{
            display:'none'
          })
          OutTL.to('.overlay .line',{
            width:'70vw'
          })
          OutTL.to('.overlay .line',{
            opacity:0
          })
          OutTL.to('.overlay',{
            opacity:0
          })
        }
        if (LoadingUpdateIndex <= LoadingUpdates.length - 1) {
          UpdateLoading();
        }
      },
    });

    ProgTL.to(ProgLineOneChars, {
      y: "-100%",
      stagger: 0.08,
      duration: 0.6,
    });
    ProgTL.to(
      ProgLineTwoChars,
      {
        y: 0,
        stagger: 0.08,
        duration: 0.6,
      },
      "<"
    );
    return ProgTL;
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
      CurrentBottle,
      2,
      CounterTargets
    );
    MainTL.add([TL1,TL2],'<');
  }

  let Bottle = null;
  let BottleBody = null;
  let BottleCap = null;
  let BottleBrand = null;
  let HasContentShown = false

  function ShowContent(){
    gsap.to(SplitedCounters.lines[0].querySelectorAll(".counter-char"), {
      y:0,
      stagger:.07,
      duration:.5
    });
    gsap.to(SplitedHeadings.lines[0].querySelectorAll(".heading-char"), {
      y:0,
      stagger:.05,
      duration:.7
    });

    const BottleTL = gsap.timeline({
      onComplete(){
        HasContentShown = true 
      }
    })
    gsap.fromTo(Bottle.position,{
      y:-1/10,
    },{
      y:1/10,
      repeat:-1,
      yoyo:true,
      duration:2,
      ease:'power1.inOut'
    },'<')
    BottleTL.to(Bottle.position,{
      x:0,
      duration:1.5,
      ease:'power3.out'
    },'<')
    BottleTL.to(Bottle.rotation,{
      x:.15,
      z:-.2,
      y:.3,
      duration:2,
      ease:'back.out'
    },'<')
    // UpdateCurrentBottleNumber(1);
  }

  function MouseMove(e){
    if(!Bottle || !HasContentShown) return;
    const {clientX,clientY} = e;
    const NX = (clientX / innerWidth) * 2 - 1;
    const NY = -((clientY / innerHeight) * 2 - 1);

    gsap.to(Bottle.rotation,{
      y:.3 + NX * .5,
      ease:'power3.out',
      duration:3
    })

  }



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
  gui.add({variants:[]},'variants',[1,2,3,4]).setValue(1).name("Bottle Varint").onChange((variant) => {
    CurrentVariant = variant
    UpdateCurrentBottleNumber(CurrentVariant)
    if(!BottleBody || !BottleBrand) return;
    const BodyVariantData = BottleData['body'].variants[variant - 1] 
    const BodyColor = new THREE.Color(BodyVariantData.color)
    const BrandVariantData = BottleData['brand'].variants[variant - 1] 
    const BrandColor = new THREE.Color(BrandVariantData.color)
    gsap.to(BottleBody.material,{
      metalness:BodyVariantData.metalness,
      roughness:BodyVariantData.roughness,
      duration:1,
      ease:'power3.inOut'
    })
    gsap.to(BottleBody.material.color,{
      r:BodyColor.r,
      g:BodyColor.g,
      b:BodyColor.b,
      duration:1,
      ease:'power3.inOut'
    })
    gsap.to(BottleBrand.material,{
      metalness:BrandVariantData.metalness,
      roughness:BrandVariantData.roughness,
      duration:1,
      ease:'power3.inOut'
    })
    gsap.to(BottleBrand.material.color,{
      r:BrandColor.r,
      g:BrandColor.g,
      b:BrandColor.b,
      duration:1,
      ease:'power3.inOut'
    })
  })
  gui.close();

  const Manager = new THREE.LoadingManager(
    // On Load Function
    () => {
    },
    // While Load Function
    (_, loaded, total) => {
      let Progress = Math.ceil((loaded / total) * 100);
      Progress = Math.min(Progress, 100);

      LoadingUpdates.push(Progress);

      if (LoadingUpdateIndex == 0) {
        UpdateLoading();
      } else if (HasLoadingFinished) {
        LoadingUpdateIndex = LoadingUpdates.length - 1;
        UpdateLoading();
      }
    },
    // Error While Loading
    () => {}
  );

  const GlbLoader = new GLTFLoader(Manager);


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
        console.log(child.name)
        const MeshFolder = gui.addFolder(child.name);
        MeshFolder.close()

        if(child.name == 'body') {
          BottleBody = child;
          MeshFolder.add(BottleBody.position,'x').min(-5).max(5)
          MeshFolder.add(BottleBody.position,'y').min(-5).max(5)
          MeshFolder.add(BottleBody.position,'z').min(-5).max(5)
        }
        if(child.name == 'cap') {
          BottleCap = child
          MeshFolder.add(BottleCap.position,'x').min(-5).max(5)
          MeshFolder.add(BottleCap.position,'y').min(-5).max(5)
          MeshFolder.add(BottleCap.position,'z').min(-5).max(5)
        }
        if(child.name == 'brand') {
          BottleBrand = child
          MeshFolder.add(BottleBrand.position,'x').min(-5).max(5)
          MeshFolder.add(BottleBrand.position,'y').min(-5).max(5)
          MeshFolder.add(BottleBrand.position,'z').min(-5).max(5)
        }
        if (BottleData[child.name]) {
          if(child.name == 'body' || child.name == 'brand'){
            child.material.roughness = BottleData[child.name].variants[0].roughness;
            child.material.metalness = BottleData[child.name].variants[0].metalness;
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
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    renderer.setSize(innerWidth, innerHeight);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", MouseMove);
});
