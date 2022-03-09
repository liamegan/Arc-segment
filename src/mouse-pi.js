import { Drawing } from "le-sketcher";
import { floatRandomBetween, clamp } from "@liamegan1/le-utils";
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
  mouse: null,
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

  vars.c = config.dimensions.scaleNew(0.5);

  vars.sp = new Vec2(0, 0);
  vars.mouse = new Vec2(0, 0);
  window.addEventListener("pointermove", (e) => {
    vars.mouse.reset(e.x - vars.c.x, e.y - vars.c.y);
    drawStep();
  });

  draw();
};

const drawStep = () => {
  vars.drawing.clear();

  const a = vars.sp.clone();
  const b = vars.mouse.clone();
  const c = b.subtractNew(a);
  const r = c.length * 0.5;
  const d = c.angle;
  const t1 = c.angle - Math.PI;
  const Δ = Math.PI;
  const φ = 0;
  c.scale(0.5);

  // console.log(c.angle)

  c.add(vars.c);

  vars.drawing.stroke = { width: 1, color: "#33333388" };
  vars.drawing.circle(c, Math.max(10, r * 0.3));

  const arc = new Arc({
    c, // The center point
    rx: r, // Major radius
    ry: r, // Minor radius
    t1,
    Δ,
    φ,
  });

  vars.drawing.stroke = { width: 3, color: "#AAFFAA" };
  vars.drawing.path(arc.svgArc);

  vars.drawing.stroke = { width: 1, color: "#3333FF88" };
  vars.drawing.circle(a.addNew(vars.c), 3);

  vars.drawing.stroke = { width: 1, color: "#FF333388" };
  vars.drawing.circle(b.addNew(vars.c), 6);
};
let interval;
const draw = () => {
  const p = config.dimensions.scaleNew(0.5);

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
