import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
/** Engine 001: a superelliptic split chassis around a radial logic cartridge.
 * All geometry is authored here; repeated fasteners and fins are instanced. */
export function createEngine() {
  const root = new T.Group(),
    layers = [new T.Group(), new T.Group(), new T.Group()];
  layers.forEach((g) => root.add(g));
  const silver = new T.MeshStandardMaterial({
    color: 0xdce1e8,
    metalness: 0.87,
    roughness: 0.24,
  });
  const ceramic = new T.MeshPhysicalMaterial({
    color: 0xf4f5f0,
    metalness: 0.32,
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.18,
  });
  const dark = new T.MeshStandardMaterial({
    color: 0x202a39,
    metalness: 0.85,
    roughness: 0.3,
  });
  const blue = new T.MeshPhysicalMaterial({
    color: 0x1749ff,
    metalness: 0.58,
    roughness: 0.16,
    clearcoat: 1,
    emissive: 0x082bbd,
    emissiveIntensity: 0.25,
  });
  const signal = new T.MeshStandardMaterial({
    color: 0x80b8ff,
    emissive: 0x235fff,
    emissiveIntensity: 2.5,
    roughness: 0.25,
  });
  const copper = new T.MeshStandardMaterial({
    color: 0xb98b54,
    metalness: 0.9,
    roughness: 0.3,
  });
  const materials = [silver, ceramic, dark, blue, signal, copper];
  const shellParts = [],
    rotors = [];
  const sq = (a, r, n = 3.6) => [
    r * Math.sign(Math.cos(a)) * Math.pow(Math.abs(Math.cos(a)), 2 / n),
    r * Math.sign(Math.sin(a)) * Math.pow(Math.abs(Math.sin(a)), 2 / n),
  ];
  function panel(r1, r2, start, end, depth, bevel = 0.04, n = 3.6) {
    const shape = new T.Shape();
    for (let i = 0; i <= 40; i++) {
      const p = sq(start + ((end - start) * i) / 40, r2, n);
      i ? shape.lineTo(...p) : shape.moveTo(...p);
    }
    for (let i = 40; i >= 0; i--)
      shape.lineTo(...sq(start + ((end - start) * i) / 40, r1, n));
    shape.closePath();
    return new T.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: bevel,
      bevelThickness: bevel,
      curveSegments: 32,
    });
  }
  function mesh(geo, mat, parent, z = 0) {
    const m = new T.Mesh(geo, mat);
    m.position.z = z;
    parent.add(m);
    return m;
  }
  function ring(radius, tube, mat, parent, z) {
    return mesh(new T.TorusGeometry(radius, tube, 8, 96), mat, parent, z);
  }
  // Four individually machined shell quadrants, with a dark rebated edge.
  for (let i = 0; i < 4; i++) {
    const group = new T.Group();
    const start = (i * Math.PI) / 2 + 0.025,
      end = ((i + 1) * Math.PI) / 2 - 0.025;
    mesh(panel(1.29, 1.92, start, end, 0.27, 0.065), ceramic, group, 0.2);
    mesh(panel(1.24, 1.96, start, end, 0.07, 0.02), dark, group, 0.12);
    mesh(
      panel(1.73, 1.83, start + 0.03, end - 0.03, 0.025, 0.012),
      silver,
      group,
      0.55,
    );
    // Fine, inset cobalt seam follows each curved panel.
    mesh(
      panel(1.61, 1.635, start + 0.09, end - 0.09, 0.015, 0.005),
      blue,
      group,
      0.555,
    );
    group.userData.layer = 0;
    layers[0].add(group);
    shellParts.push(group);
  }
  // Rear carrier and a second offset silver frame create a deep, readable silhouette.
  mesh(panel(0.62, 1.82, 0, Math.PI * 2, 0.11, 0.035), dark, layers[2], -0.48);
  mesh(
    panel(1.5, 1.82, 0.03, Math.PI * 2 - 0.03, 0.07, 0.035),
    silver,
    layers[2],
    -0.65,
  );
  for (let i = 0; i < 4; i++) {
    const rail = mesh(
      new T.CylinderGeometry(0.085, 0.085, 0.95, 12),
      silver,
      layers[2],
    );
    rail.rotation.x = Math.PI / 2;
    rail.position.set((i % 2 ? 1 : -1) * 1.47, (i < 2 ? 1 : -1) * 1.47, -0.03);
  }
  // Dense cooling fins are instanced into the chassis, not independent scene objects.
  const dummy = new T.Object3D();
  function instances(geo, mat, count, place, parent) {
    const im = new T.InstancedMesh(geo, mat, count);
    for (let i = 0; i < count; i++) {
      dummy.position.set(0, 0, 0);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      place(dummy, i);
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
    }
    parent.add(im);
    return im;
  }
  instances(
    new T.BoxGeometry(0.025, 0.28, 0.43),
    silver,
    120,
    (d, i) => {
      const a = (i / 120) * Math.PI * 2;
      d.position.set(Math.cos(a) * 1.18, Math.sin(a) * 1.18, -0.08);
      d.rotation.z = a - Math.PI / 2;
    },
    layers[1],
  );
  ring(1.32, 0.055, dark, layers[1], 0.22);
  ring(1.08, 0.032, copper, layers[1], 0.25);
  ring(1.025, 0.022, signal, layers[1], 0.29);
  // Twisted turbine vanes use a custom curved 3D surface; merged into one rotor mesh.
  const rotor = new T.Group();
  layers[1].add(rotor);
  rotors.push(rotor);
  const vaneGeometries = [];
  for (let v = 0; v < 18; v++) {
    const positions = [],
      indices = [],
      base = (v / 18) * Math.PI * 2;
    for (let i = 0; i <= 12; i++) {
      const t = i / 12,
        r = 0.38 + t * 0.61,
        a = base + t * 0.37;
      for (let j = 0; j < 2; j++) {
        const aa = a + j * (0.17 - 0.09 * t);
        positions.push(
          Math.cos(aa) * r,
          Math.sin(aa) * r,
          0.1 + Math.sin(t * Math.PI) * 0.16 - j * 0.06,
        );
      }
    }
    for (let i = 0; i < 12; i++) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    vaneGeometries.push(g);
  }
  const vaneMat = silver.clone();
  vaneMat.side = T.DoubleSide;
  materials.push(vaneMat);
  mesh(mergeGeometries(vaneGeometries), vaneMat, rotor);
  vaneGeometries.forEach((g) => g.dispose());
  const core = mesh(
    new T.CylinderGeometry(0.41, 0.49, 0.24, 64),
    blue,
    layers[1],
    0.25,
  );
  core.rotation.x = Math.PI / 2;
  ring(0.36, 0.018, signal, layers[1], 0.39);
  // Etched RK mark on the core face, generated locally from typography.
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 512;
  labelCanvas.height = 512;
  const ctx = labelCanvas.getContext("2d");
  ctx.fillStyle = "#1647ed";
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = "#dfe8ff";
  ctx.font = "bold 145px Arial";
  ctx.textAlign = "center";
  ctx.fillText("RK", 256, 285);
  ctx.font = "21px monospace";
  ctx.fillText("ENGINE / 001", 256, 343);
  const labelTexture = new T.CanvasTexture(labelCanvas);
  labelTexture.colorSpace = T.SRGBColorSpace;
  const labelMat = new T.MeshStandardMaterial({
    map: labelTexture,
    metalness: 0.5,
    roughness: 0.24,
  });
  materials.push(labelMat);
  mesh(new T.CircleGeometry(0.33, 64), labelMat, layers[1], 0.397);
  // Flush fasteners, connector pins and the exposed lower circuit carrier.
  shellParts.forEach((g, q) =>
    instances(
      new T.CylinderGeometry(0.055, 0.055, 0.035, 6),
      dark,
      6,
      (d, i) => {
        const a = (q * Math.PI) / 2 + (((i + 0.5) / 6) * Math.PI) / 2,
          p = sq(a, 1.75);
        d.position.set(p[0], p[1], 0.595);
        d.rotation.x = Math.PI / 2;
      },
      g,
    ),
  );
  instances(
    new T.BoxGeometry(0.08, 0.024, 0.035),
    copper,
    52,
    (d, i) => {
      const side = i < 26 ? -1 : 1,
        k = i % 26;
      d.position.set(side * 1.69, (k - 12.5) * 0.108, -0.51);
    },
    layers[2],
  );
  const traces = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2,
      b = a + 0.08,
      rs = [0.62, 1.2, 1.43, 1.6];
    const points = rs.map(
      (r, j) =>
        new T.Vector3(
          Math.cos(j < 2 ? a : b) * r,
          Math.sin(j < 2 ? a : b) * r,
          -0.29,
        ),
    );
    const curve = new T.CatmullRomCurve3(points);
    traces.push(curve);
    mesh(
      new T.TubeGeometry(curve, 20, 0.009, 4, false),
      i % 3 ? copper : signal,
      layers[2],
    );
  }
  const packets = instances(
    new T.SphereGeometry(0.025, 6, 4),
    signal,
    24,
    () => {},
    layers[2],
  );
  // Diagonal board bridges and precision markings break up the radial structure.
  instances(
    new T.BoxGeometry(0.19, 0.36, 0.08),
    blue,
    8,
    (d, i) => {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      d.position.set(Math.cos(a) * 1.41, Math.sin(a) * 1.41, -0.22);
      d.rotation.z = a;
    },
    layers[2],
  );
  shellParts.forEach((g, q) =>
    instances(
      new T.BoxGeometry(0.008, 0.055, 0.01),
      dark,
      20,
      (d, i) => {
        const a = (q * Math.PI) / 2 + (((i + 0.5) / 20) * Math.PI) / 2,
          p = sq(a, 1.88);
        d.position.set(p[0], p[1], 0.56);
        d.rotation.z = a - Math.PI / 2;
      },
      g,
    ),
  );
  const pickables = [];
  layers.forEach((g, i) =>
    g.traverse((o) => {
      if (o.isMesh) {
        o.userData.layer = i;
        pickables.push(o);
      }
    }),
  );
  function update(time, explode, selected = -1, reduced = false) {
    layers[0].position.z = explode * 0.9;
    layers[1].position.z = explode * -0.25;
    layers[2].position.z = explode * -1.2;
    shellParts.forEach((g, i) => {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      g.position.x = Math.cos(a) * explode * 0.45;
      g.position.y = Math.sin(a) * explode * 0.45;
    });
    rotors[0].rotation.z = reduced ? 0 : time * 0.16;
    const p = new T.Vector3();
    for (let i = 0; i < 24; i++) {
      traces[i].getPointAt(reduced ? 0.4 : (time * 0.12 + i / 24) % 1, p);
      dummy.position.copy(p);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(selected === 2 ? 1.7 : 1);
      dummy.updateMatrix();
      packets.setMatrixAt(i, dummy.matrix);
    }
    packets.instanceMatrix.needsUpdate = true;
    blue.emissiveIntensity = selected === 1 ? 0.6 : 0.25;
  }
  function dispose() {
    const gs = new Set();
    root.traverse((o) => {
      if (o.geometry) gs.add(o.geometry);
    });
    gs.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    labelTexture.dispose();
  }
  return { root, layers, update, dispose, pickables };
}
