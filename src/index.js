import { Drawing } from "le-sketcher";
import {
  floatRandomBetween,
  clamp,
} from "@liamegan1/le-utils";
import { Vec2, Vec3 } from "wtc-math";
import { Arc } from "./Arc.js";
import { ArcSet } from "./Arcset.js";
import * as dat from "dat.gui";

console.clear();

const config = {
  drawingType: 2,
  dimensions: new Vec2(window.innerWidth, window.innerHeight),
};
const vars = {
  drawing: null,
  mouse: new Vec2(0,0)
};

vars.drawing = new Drawing(config.drawingType)
  .addTo("#container")
  .size(config.dimensions);

const setup = () => {
  vars.drawing.clear();

  config.minΔ = Math.PI * 0.25 * Math.random();
  config.maxΔ = Math.min(
    Math.PI * 2,
    config.minΔ + Math.PI + Math.random() * Math.PI
  );

  config.minΔ = Math.PI * 0.25 + Math.PI * 0.5 * Math.random();
  config.maxΔ = config.minΔ + Math.PI * 0.5 + Math.PI * Math.random();

  config.minR = 10 + Math.random() * 20;
  config.maxR = config.minR + Math.random() * 150;

  vars.d = new Vec3(0.0, 0.1, 0.2);
  draw();
};

const guiopbj = {
  angle: 0.001,
  test: 0.001,
  id: 0.001,
};
const gui = new dat.GUI();
gui.add(guiopbj, "angle").listen();
gui.add(guiopbj, "test").listen();
gui.add(guiopbj, "id").listen();
guiopbj.id = Math.PI *.5;


const drawStep = () => {
  requestAnimationFrame(drawStep);
  
  vars.drawing.clear();

  const a = config.dimensions.scaleNew(0.5);
  const b = vars.mouse;
  const ab = a.subtractNew(b);
  const c = b.addNew(ab.scaleNew(.5));
  
  const sa = Math.PI * .25;
  // const sa = 0;
  const cao = sa - ab.angle;
  const coa = Math.PI - cao - 1.5708 + sa;

  const mcoa = coa - sa;

  const co = new Vec2(1, 0);
  co.angle = coa;
  co.length = ab.length * 0.5 * Math.tan(cao);
  const o = c.subtractNew(co);
  const ao = a.subtractNew(o);
  const bo = b.subtractNew(o);

  const r = ao.length;

  const arcc = a.subtractNew(new Vec2(Math.cos(sa) * r, Math.sin(sa) * r));
  const ea = Math.PI*2 + bo.angle - sa;

  
  const ca = Math.acos(o.subtractNew(c).length / o.subtractNew(b).length) * 2;

  const a1a = a.subtractNew(b).angle - sa;
  let arc;

  if(mcoa < 0 && mcoa > -Math.PI * .5) {
    arc = new Arc({
      c: o, // The center point
      rx: r, // Major radius
      ry: r, // Minor radius
      t1: sa + ea, // Start angle
      Δ: ca, // End angle - should always be positive
      φ: 0, // Rotation
    });
  } else if (mcoa < -Math.PI * 0.5 || mcoa > Math.PI) {
    arc = new Arc({
      c: o, // The center point
      rx: r, // Major radius
      ry: r, // Minor radius
      t1: sa + ea, // Start angle
      Δ: Math.PI * 2 - ca, // End angle - should always be positive
      φ: 0, // Rotation
    });
  } else {
    arc = new Arc({
      c: arcc, // The center point
      rx: r, // Major radius
      ry: r, // Minor radius
      t1: sa, // Start angle
      Δ: ea, // End angle - should always be positive
      φ: 0, // Rotation
    });
  }
  
  guiopbj.angle = ca;
  guiopbj.test = mcoa;
  

  vars.drawing.stroke = '#AAAAAA';
  vars.drawing.circle(a, 5);
  vars.drawing.circle(b, 5);
  vars.drawing.line(a, b);
  vars.drawing.stroke = "#FF0000";
  vars.drawing.circle(c, 5);
  vars.drawing.stroke = "#AAAAAA";
  vars.drawing.line(c, o);
  vars.drawing.line(a, o);
  vars.drawing.line(b, o);
  vars.drawing.stroke = "#00FF00";
  vars.drawing.circle(o, 5);
  vars.drawing.circle(arcc, 10);

  
  vars.drawing.stroke = "#333333";
  vars.drawing.path(arc.svgArc);
  // vars.drawing.stroke = "#66AA66";
  // vars.drawing.path(arc1.svgArc);
};
let interval;
const draw = () => {
  const p = config.dimensions.scaleNew(0.5);

  requestAnimationFrame(drawStep);


  const arcset = new ArcSet(p);
  let n = 30;
  while (n--) {
    arcset.addArc(config.minΔ, config.maxΔ, config.minR, config.maxR);
  }

  vars.drawing.stroke = { width: 1, color: "#33333344" };
  arcset.arcs.forEach((a) => {
    vars.drawing.circle(a.c, Math.max(10, a.rx - 50));
  });

  vars.drawing.stroke = { width: 5, color: "#AAFFAA" };
  arcset.arcs.forEach((a) => {
    vars.drawing.path(a.svgArc);
  });

  vars.drawing.stroke = { width: 1, color: "#3333FF88" };
  arcset.arcs.forEach((a) => {
    vars.drawing.circle(a.start, 3);
  });

  vars.drawing.stroke = { width: 1, color: "#FF333388" };
  arcset.arcs.forEach((a) => {
    vars.drawing.circle(a.end, 6);
  });
};

setTimeout(() => {
  setup();
  document.body
    .querySelector("#container>:first-child")
    .addEventListener("click", () => {
      setup();
    });
}, 500);

let timer;
window.addEventListener("resize", (e) => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    config.dimensions = new Vec2(window.innerWidth, window.innerHeight);
    vars.drawing.dimensions = config.dimensions;
    setup();
  }, 200);
});
window.addEventListener('pointermove', (e) => {
  vars.mouse.reset(e.x, e.y);
});
