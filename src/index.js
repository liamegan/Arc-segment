import { Drawing } from "le-sketcher";
import {
  floatRandomBetween,
  clamp,
} from "@liamegan1/le-utils";
import { Vec2, Vec3 } from "wtc-math";
import { Arc } from "./Arc.js";
import { ArcSet } from "./Arcset.js";
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


const drawStep = () => {
  requestAnimationFrame(drawStep);
  
  vars.drawing.clear();

  const a = config.dimensions.scaleNew(0.5);
  const b = vars.mouse;
  const ab = a.subtractNew(b);
  const ba = b.subtractNew(a);
  const c = b.addNew(ab.scaleNew(.5));
  
  const sa = 0;
  const cao = sa - ab.angle;
  const coa = Math.PI - cao - 1.5708;

  const co = new Vec2(1, 0);
  co.angle = coa;
  co.length = ab.length * 0.5 * Math.tan(cao);
  const o = c.subtractNew(co);
  // o.length = a.subtractNew(o).length;
  
  
  // const p = config.dimensions.scaleNew(0.5);
  // const md = vars.mouse.subtractNew(p);

  const r = co.length * .5;

  // // const r = 100;
  // const sa = 0;
  const arcc = a.subtractNew(new Vec2(Math.cos(sa) * r, Math.sin(sa) * r));
  // // md.resetToVector(vars.mouse.subtractNew(c));
  const ea = Math.PI*2 + ba.angle;

  const arc = new Arc({
    c: arcc, // The center point
    rx: r, // Major radius
    ry: r, // Minor radius
    t1: sa, // Start angle
    Δ: ea, // End angle - should always be positive
    φ: 0, // Rotation
  });
  

  vars.drawing.stroke = '#CCCC00';
  vars.drawing.circle(a, 5);
  vars.drawing.circle(b, 5);
  vars.drawing.line(a, b);
  vars.drawing.circle(c, 5);
  // const cao = sa - p.subtractNew(vars.mouse).angle;
  // const coa = Math.PI - cao - 1.5708;
  // vars.drawing.line(a, a.subtractNew(ao));
  vars.drawing.line(c, o);
  vars.drawing.line(a, o);
  vars.drawing.circle(o, 5);

  
  vars.drawing.stroke = "#333333";
  vars.drawing.path(arc.svgArc);
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
