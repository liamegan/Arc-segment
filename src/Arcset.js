import { floatRandomBetween, clamp } from "@liamegan1/le-utils";
import { Arc } from "./Arc.js";

class ArcSet {
  i;
  a;
  arcs;

  constructor(p) {
    this.p = p;

    this.arcs = [];
    this.a = Math.PI;
    this.i = 0;
    this.Δ = 0;
  }

  addArc(minΔ, maxΔ, minR, maxR) {
    let even = this.i % 2 == 0;
    const rdirection = even ? 1 : -1;
    const Δ = floatRandomBetween(minΔ, maxΔ);
    const r = this.r || floatRandomBetween(minR, maxR);

    const arc = new Arc({
      c: this.p.clone(), // The center point
      rx: r, // Major radius
      ry: r, // Minor radius
      t1: even ? this.a : this.a - Δ,
      Δ: Δ,
      φ: even ? 0 : Math.PI,
    });

    this.arcs.push(arc);

    this.a += even ? Δ : -Δ;
    this.r = floatRandomBetween(minR, maxR);

    if (even) {
      this.p.x = arc.end.x + Math.cos(this.a) * this.r;
      this.p.y = arc.end.y + Math.sin(this.a) * this.r;
    } else {
      this.p.x = arc.start.x - Math.cos(this.a) * this.r;
      this.p.y = arc.start.y - Math.sin(this.a) * this.r;
    }

    this.i++;
  }
}

export { ArcSet };
