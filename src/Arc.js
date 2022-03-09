import { Vec2, Vec3, Mat2 } from "wtc-math";

const τ = Math.PI * 2;
const ϵ = (0.000001 * Math.PI) / 180.0;
class Arc {
  constructor({
    c = new Vec2(0, 0), // The center point
    rx = 0, // Major radius
    ry = 0, // Minor radius
    t1 = 0, // Start angle
    Δ = Math.PI, // End angle - should always be positive
    φ = 0, // Rotation
  } = {}) {
    this.c = c;
    this.rx = rx;
    this.ry = ry;
    this.t1 = t1;
    this.Δ = Δ % τ;
    this.φ = φ;

    // Standard rotation matrix
    const rotMat = Mat2.identity().rotate(φ);
    // Start point
    this.start = c.addNew(
      new Vec2(
        this.rx * Math.cos(this.t1),
        this.ry * Math.sin(this.t1)
      ).transformByMat2(rotMat)
    );
    // End point
    this.end = c.addNew(
      new Vec2(
        this.rx * Math.cos(this.t1 + this.Δ),
        this.ry * Math.sin(this.t1 + this.Δ)
      ).transformByMat2(rotMat)
    );
    this.fA = this.Δ > Math.PI ? 1 : 0;
    this.fS = this.Δ > 0 ? 1 : 0;

    this.compute();
  }

  compute() {
    const rotMat = Mat2.identity().rotate(this.angle);
    const a = this.start.clone().transformByMat2(rotMat);
    const b = this.end.clone().transformByMat2(rotMat);
    const v = new Vec2();
    let l, db;
    let _sweep;
    let c, s, e;

    _sweep = this.fS;
    if (this.fA) {
      _sweep = !_sweep;
    }

    e = this.rx / this.ry;
    a.y *= e; // transform to circle
    b.y *= e;

    this.s = new Vec2(0.5 * (a.x + b.x), 0.5 * (a.y + b.y)); // mid point between A,B
    v.reset(a.y - b.y, b.x - a.x);
    l = (this.rx * this.rx) / v.lengthSquared - 0.25;
    if (l < 0) {
      l = 0;
    } else {
      l = Math.sqrt(l);
    }
    v.scale(l);

    if (_sweep) {
      this.s.add(v);
    } else {
      this.s.subtract(v);
    }

    this.a0 = Math.atan2(a.y - this.s.y, a.x - this.s.x);
    this.a1 = Math.atan2(b.y - this.s.y, b.x - this.s.x);
    this.s.y /= e;

    this.da = this.a1 - this.a0;
    if (Math.abs(Math.abs(this.da) - Math.PI) <= ϵ) {
      // half arc is without larc and sweep is not working instead change a0,a1
      db = 0.5 * (this.a0 + this.a1) - Math.atan2(b.y - a.y, b.x - a.x);
      while (db < -Math.PI) {
        db += τ; // db<0 CCW ... sweep=1
      }
      while (db > Math.PI) {
        db -= τ; // db>0  CW ... sweep=0
      }
      _sweep = false;
      if (db < 0.0 && !this.fS) {
        _sweep = true;
      }
      if (db > 0.0 && this.fS) {
        _sweep = true;
      }
      if (_sweep) {
        if (this.da >= 0.0) {
          this.a1 -= τ;
        }
        if (this.da < 0.0) {
          this.a0 -= τ;
        }
      }
    } else if (this.fA) {
      // big arc
      if (this.da < Math.PI && this.da >= 0.0) {
        this.a1 -= τ;
      }
      if (this.da > -Math.PI && this.da < 0.0) {
        this.a0 -= τ;
      }
    } else {
      // small arc
      if (this.da > Math.PI) {
        this.a1 -= τ;
      }
      if (this.da < -Math.PI) {
        this.a0 -= τ;
      }
    }
    this.da = this.a1 - this.a0;
  }

  getPoint(t) {
    t = this.a0 + this.da * t;
    const result = this.s.addNew(
      new Vec2(this.rx * Math.cos(t), this.ry * Math.sin(t))
    );

    const rotMat = Mat2.identity().rotate(-this.angle);
    result.transformByMat2(rotMat);

    return result;
  }

  getPoints(d) {
    const points = [];
    const segments = Math.floor(this.length / d) + 1;
    const seglength = 1 / segments;
    let i = 0;
    while (true) {
      i = Math.min(i, 1);
      const p = this.getPoint(i);
      points.push(p);
      if (i >= 1) break;
      i += seglength;
    }
    return points;
  }

  get svgArc() {
    return `M ${this.start.x} ${this.start.y} A ${this.rx} ${this.ry} ${
      (this.φ / τ) * 360
    } ${this.fA} ${this.fS} ${this.end.x} ${this.end.y}`;
  }
  get angle() {
    return Math.PI - this.φ;
  }

  get length() {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", this.svgArc);
    return path.getTotalLength();

    // This formula only works if both rx and ry are the same
    const t = Math.atan((this.ry / this.rx) * Math.tan(this.Δ));
    const l =
      this.Δ *
      Math.sqrt(
        Math.pow(this.rx, 2) * Math.pow(Math.sin(t), 2) +
          Math.pow(this.ry, 2) * Math.pow(Math.cos(t), 2)
      );
    return l;
  }
}

export { Arc };