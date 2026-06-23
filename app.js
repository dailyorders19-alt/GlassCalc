const shapeType = document.getElementById("shapeType");
const rectangleFields = document.getElementById("rectangleFields");
const trapezoidFields = document.getElementById("trapezoidFields");

const rectWidthInput = document.getElementById("rectWidth");
const rectHeightInput = document.getElementById("rectHeight");
const glassThicknessInput = document.getElementById("glassThickness");

const trapTopInput = document.getElementById("trapTop");
const trapBottomInput = document.getElementById("trapBottom");
const trapModeInput = document.getElementById("trapMode");
const trapNormalFields = document.getElementById("trapNormalFields");
const trapRightAngleFields = document.getElementById("trapRightAngleFields");

const trapHeightInput = document.getElementById("trapHeight");
const trapAlignInput = document.getElementById("trapAlign");

const trapTopRAInput = document.getElementById("trapTopRA");
const trapBottomRAInput = document.getElementById("trapBottomRA");
const trapLeftInput = document.getElementById("trapLeft");
const trapRightInput = document.getElementById("trapRight");
const trapRightAngleSideInput = document.getElementById("trapRightAngleSide");
const trapFreeTopInput = document.getElementById("trapFreeTop");
const trapFreeBottomInput = document.getElementById("trapFreeBottom");
const trapFreeLeftInput = document.getElementById("trapFreeLeft");
const trapFreeRightInput = document.getElementById("trapFreeRight");
const trapFreeAlignInput = document.getElementById("trapFreeAlign");
const trapFreeFields = document.getElementById("trapFreeFields");

const holeXInput = document.getElementById("holeX");
const holeYInput = document.getElementById("holeY");
const holeDInput = document.getElementById("holeD");

const cutoutTypeInput = document.getElementById("cutoutType");
const rectCutoutFields = document.getElementById("rectCutoutFields");
const lCutoutFields = document.getElementById("lCutoutFields");
const cutoutRectModeInput = document.getElementById("cutoutRectMode");
const cutoutRectSizeFields = document.getElementById("cutoutRectSizeFields");
const cutoutRectEdgeFields = document.getElementById("cutoutRectEdgeFields");
const cutoutRectReferenceFields = document.getElementById("cutoutRectReferenceFields");

const cutoutRefLeftInput = document.getElementById("cutoutRefLeft");
const cutoutRefRightInput = document.getElementById("cutoutRefRight");
const cutoutRefBottomInput = document.getElementById("cutoutRefBottom");
const cutoutRefTopInput = document.getElementById("cutoutRefTop");
const cutoutXInput = document.getElementById("cutoutX");
const cutoutYInput = document.getElementById("cutoutY");
const cutoutWInput = document.getElementById("cutoutW");
const cutoutHInput = document.getElementById("cutoutH");
const cutoutLeftGapInput = document.getElementById("cutoutLeftGap");
const cutoutRightGapInput = document.getElementById("cutoutRightGap");
const cutoutBottomGapInput = document.getElementById("cutoutBottomGap");
const cutoutTopGapInput = document.getElementById("cutoutTopGap");
const cutoutRInput = document.getElementById("cutoutR");
const lCutoutWInput = document.getElementById("lCutoutW");
const lCutoutHInput = document.getElementById("lCutoutH");
const lInnerRInput = document.getElementById("lInnerR");
const lCornerInput = document.getElementById("lCorner");
const uCutoutFields = document.getElementById("uCutoutFields");
const uSideInput = document.getElementById("uSide");
const uOffsetInput = document.getElementById("uOffset");
const uWidthInput = document.getElementById("uWidth");
const uDepthInput = document.getElementById("uDepth");
const uRadiusInput = document.getElementById("uRadius");
const holeAllowanceInput = document.getElementById("holeAllowance");
const cutoutAllowanceInput = document.getElementById("cutoutAllowance");

const drawBtn = document.getElementById("drawBtn");
const addHoleBtn = document.getElementById("addHoleBtn");
const addCutoutBtn = document.getElementById("addCutoutBtn");
const exportPdfBtn = document.getElementById("exportPdfBtn");
const exportDxfBtn = document.getElementById("exportDxfBtn");

const holeList = document.getElementById("holeList");
const cutoutList = document.getElementById("cutoutList");
const statusBox = document.getElementById("statusBox");

const canvas = document.getElementById("glassCanvas");

function resizeCanvas() {
  const workspace = document.querySelector(".workspace");

  if (!workspace) return;

  const rect = workspace.getBoundingClientRect();

  canvas.width = rect.width - 20;
  canvas.height = rect.height - 20;
}

const ctx = canvas.getContext("2d");

let holes = [];
let cutouts = [];

let viewZoom = 1;
let viewPanX = 0;
let viewPanY = 0;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;

function setStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.className = isError ? "status error" : "status ok";
}

function round2(value) {
  return Math.round(value * 100) / 100;
}
function getHoleAllowance() {
  if (!holeAllowanceInput) return 1;
  const value = Number(holeAllowanceInput.value);
  if (Number.isNaN(value) || value < 0) return 0;
  return value;
}

function getCutoutAllowance() {
  if (!cutoutAllowanceInput) return 0.5;
  const value = Number(cutoutAllowanceInput.value);
  if (Number.isNaN(value) || value < 0) return 0;
  return value;
}

function updateShapeFields() {
  const isRectangle = shapeType.value === "rectangle";
  rectangleFields.classList.toggle("hidden", !isRectangle);
  trapezoidFields.classList.toggle("hidden", isRectangle);
  resizeCanvas();
  drawScene();
}

function updateTrapModeFields() {
  const mode = trapModeInput.value;

  const isNormal = mode === "normal";
  const isRightAngle = mode === "rightAngle";
  const isFree = mode === "free";

  trapNormalFields.classList.toggle("hidden", !isNormal);
  trapRightAngleFields.classList.toggle("hidden", !isRightAngle);
  trapFreeFields.classList.toggle("hidden", !isFree);
}

function updateCutoutFields() {
  const type = cutoutTypeInput.value;
  const isRect = type === "rectangle";
  const isL = type === "lcorner";
  const isU = type === "ucutout";

  const mode = cutoutRectModeInput ? cutoutRectModeInput.value : "size";
  const useSizeMode = mode === "size";
  const useEdgeMode = mode === "edgeOffsets";
  const useRefMode = mode === "reference";

  rectCutoutFields.classList.toggle("hidden", !isRect);
  lCutoutFields.classList.toggle("hidden", !isL);

  if (uCutoutFields) {
    uCutoutFields.classList.toggle("hidden", !isU);
  }

  if (cutoutRectSizeFields) {
    cutoutRectSizeFields.classList.toggle("hidden", !isRect || !useSizeMode);
  }

  if (cutoutRectEdgeFields) {
    cutoutRectEdgeFields.classList.toggle("hidden", !isRect || !useEdgeMode);
  }

  if (cutoutRectReferenceFields) {
    cutoutRectReferenceFields.classList.toggle("hidden", !isRect || !useRefMode);
  }
}

function getShapeData() {
  const type = shapeType.value;
  const thickness = Number(glassThicknessInput.value);

  if (thickness <= 0 || Number.isNaN(thickness)) {
    throw new Error("A vastagság legyen 0-nál nagyobb.");
  }

  if (type === "rectangle") {
    const width = Number(rectWidthInput.value);
    const height = Number(rectHeightInput.value);

    if (width <= 0 || height <= 0 || Number.isNaN(width) || Number.isNaN(height)) {
      throw new Error("A téglalap szélessége és magassága legyen 0-nál nagyobb.");
    }

    return {
      type: "rectangle",
      templateName: "Téglalap",
      thickness,
      width,
      height,
      points: [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: width, y: height },
        { x: 0, y: height }
      ]
    };
  }

 const trapMode = trapModeInput.value;

 if (trapMode === "free") {
  const top = Number(trapFreeTopInput.value);
  const bottom = Number(trapFreeBottomInput.value);
  const left = Number(trapFreeLeftInput.value);
  const right = Number(trapFreeRightInput.value);
  const align = trapFreeAlignInput.value;

  if ([top, bottom, left, right].some(v => Number.isNaN(v) || v <= 0)) {
    throw new Error("A szabad forma minden oldala legyen 0-nál nagyobb.");
  }

  const baseDiff = bottom - top;
  let offsetX;
  let height;
  let calculatedLeft;
  let calculatedRight;

  if (align === "left") {
    offsetX = 0;
    height = left;
  } else if (align === "center") {
    offsetX = baseDiff / 2;
    height = Math.sqrt(Math.max(0, left * left - offsetX * offsetX));
  } else if (align === "right") {
    offsetX = baseDiff;
    height = right;
  } else if (Math.abs(baseDiff) < 0.001) {
    if (Math.abs(left - right) > 2) {
      throw new Error("Egyenlő felső és alsó oldalnál a bal és jobb oldalnak is egyeznie kell.");
    }

    offsetX = 0;
    height = left;
  } else {
    offsetX = (left * left - right * right + baseDiff * baseDiff) / (2 * baseDiff);
    const heightSquared = left * left - offsetX * offsetX;

    if (heightSquared <= 0) {
      throw new Error("Ez a 4 oldal nem rajzolható ki trapézként.");
    }

    height = Math.sqrt(heightSquared);
  }

  if (!Number.isFinite(height) || height <= 0) {
    throw new Error("Ez a döntés ezekkel a méretekkel nem rajzolható ki.");
  }

  const A = { x: 0, y: 0 };
  const B = { x: bottom, y: 0 };
  const C = { x: offsetX + top, y: height };
  const D = { x: offsetX, y: height };

  calculatedLeft = Math.sqrt(D.x * D.x + D.y * D.y);
  calculatedRight = Math.sqrt((B.x - C.x) * (B.x - C.x) + (B.y - C.y) * (B.y - C.y));

  if (align === "auto" && (Math.abs(calculatedLeft - left) > 2 || Math.abs(calculatedRight - right) > 2)) {
    throw new Error("Ez a 4 oldal nem rajzolható ki trapézként.");
  }

  return {
    type: "trapezoid",
    templateName: "Szabad forma",
    thickness,
    trapMode,
    top,
    bottom,
    left: round2(calculatedLeft),
    right: round2(calculatedRight),
    align,
    height,
    points: [A, B, C, D]
  };

}

if (trapMode === "normal") {
  const top = Number(trapTopInput.value);
  const bottom = Number(trapBottomInput.value);
  const height = Number(trapHeightInput.value);
  const align = trapAlignInput.value;

  if ([top, bottom, height].some(v => Number.isNaN(v) || v <= 0)) {
    throw new Error("A normál trapéz minden mérete legyen 0-nál nagyobb.");
  }

  let offsetX = 0;
  if (align === "center") offsetX = (bottom - top) / 2;
  if (align === "right") offsetX = bottom - top;

  return {
    type: "trapezoid",
    templateName: "Trapéz - normál",
    thickness,
    trapMode,
    top,
    bottom,
    height,
    align,
    points: [
      { x: 0, y: 0 },
      { x: bottom, y: 0 },
      { x: offsetX + top, y: height },
      { x: offsetX, y: height }
    ]
  };
}

const top = Number(trapTopRAInput.value);
const bottom = Number(trapBottomRAInput.value);
const left = Number(trapLeftInput.value);
const right = Number(trapRightInput.value);
const rightAngleSide = trapRightAngleSideInput.value;

if ([top, bottom, left, right].some(v => Number.isNaN(v) || v <= 0)) {
  throw new Error("A 90°-os trapéz minden oldalmérete legyen 0-nál nagyobb.");
}

const diff = bottom - top;
let points;
let actualLeft = left;
let actualRight = right;
let height;

if (rightAngleSide === "left") {
  height = left;
  actualRight = Math.sqrt(left * left + diff * diff);

  points = [
    { x: 0, y: 0 },
    { x: bottom, y: 0 },
    { x: top, y: left },
    { x: 0, y: left }
  ];
} else {
  height = right;
  actualLeft = Math.sqrt(right * right + diff * diff);

  points = [
    { x: 0, y: 0 },
    { x: bottom, y: 0 },
    { x: bottom, y: right },
    { x: bottom - top, y: right }
  ];
}

return {
  type: "trapezoid",
  templateName: "Trapéz - 90°",
  thickness,
  trapMode,
  top,
  bottom,
  left: round2(actualLeft),
  right: round2(actualRight),
  height,
  rightAngleSide,
  points
};
}

function getBounds(points) {
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys)
  };
}

function mmRadiusToCanvas(radiusMm, transform) {
  const p0 = transform({ x: 0, y: 0 });
  const p1 = transform({ x: radiusMm, y: 0 });
  return Math.abs(p1.x - p0.x);
}

function buildRoundedRectPath(context, x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  context.beginPath();
  if (r === 0) {
    context.rect(x, y, width, height);
    return;
  }
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.arcTo(x + width, y, x + width, y + r, r);
  context.lineTo(x + width, y + height - r);
  context.arcTo(x + width, y + height, x + width - r, y + height, r);
  context.lineTo(x + r, y + height);
  context.arcTo(x, y + height, x, y + height - r, r);
  context.lineTo(x, y + r);
  context.arcTo(x, y, x + r, y, r);
  context.closePath();
}

function validateRectCutout(width, height, radius) {
  if (radius < 0) {
    throw new Error("A kivágás sugara nem lehet negatív.");
  }
  if (radius > Math.min(width, height) / 2) {
    throw new Error("A kivágás sugara legfeljebb a kisebbik oldal fele lehet.");
  }
}

function validateLCutout(width, height, innerR) {
  if ([width, height, innerR].some(v => Number.isNaN(v))) {
    throw new Error("Az L kivágás adatainál csak számérték adható meg.");
  }
  if (width <= 0 || height <= 0) {
    throw new Error("Az L kivágás szélessége és magassága legyen 0-nál nagyobb.");
  }
  if (innerR < 0) {
    throw new Error("Az L kivágás belső sugara nem lehet negatív.");
  }
  if (innerR > Math.min(width, height) / 2) {
    throw new Error("Az L kivágás belső sugara legfeljebb a kisebbik oldal fele lehet.");
  }
}

function validateUCutout(offset, width, depth, radius) {
  if ([offset, width, depth, radius].some(v => Number.isNaN(v))) {
    throw new Error("Az U kivágás adatainál csak számérték adható meg.");
  }

  if (offset < 0) {
    throw new Error("Az U kivágás kezdő távolsága nem lehet negatív.");
  }

  if (width <= 0 || depth <= 0) {
    throw new Error("Az U kivágás nyílása és mélysége legyen 0-nál nagyobb.");
  }

  if (radius < 0) {
    throw new Error("Az U kivágás sugara nem lehet negatív.");
  }

  if (radius > Math.min(width, depth) / 2) {
    throw new Error("Az U kivágás sugara legfeljebb a nyílás vagy mélység fele lehet.");
  }
}

function pointInPolygon(point, points) {
  const epsilon = 0.001;

  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const cross = (point.y - a.y) * (b.x - a.x) - (point.x - a.x) * (b.y - a.y);
    const isBetweenX = point.x >= Math.min(a.x, b.x) - epsilon && point.x <= Math.max(a.x, b.x) + epsilon;
    const isBetweenY = point.y >= Math.min(a.y, b.y) - epsilon && point.y <= Math.max(a.y, b.y) + epsilon;

    if (Math.abs(cross) <= epsilon && isBetweenX && isBetweenY) {
      return true;
    }
  }

  let inside = false;

  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const pi = points[i];
    const pj = points[j];
    const intersects = ((pi.y > point.y) !== (pj.y > point.y)) &&
      point.x < ((pj.x - pi.x) * (point.y - pi.y)) / (pj.y - pi.y) + pi.x;

    if (intersects) inside = !inside;
  }

  return inside;
}

function validatePointInsideShape(point, shapeData, label) {
  if (!pointInPolygon(point, shapeData.points)) {
    throw new Error(`${label} a külső formán kívül van.`);
  }
}

function validateCircleInsideShape(x, y, diameter, shapeData, label) {
  const r = diameter / 2;
  const points = [
    { x, y },
    { x: x - r, y },
    { x: x + r, y },
    { x, y: y - r },
    { x, y: y + r }
  ];

  points.forEach(point => validatePointInsideShape(point, shapeData, label));
}

function validateRectInsideShape(x, y, width, height, shapeData, label) {
  const points = [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height }
  ];

  points.forEach(point => validatePointInsideShape(point, shapeData, label));
}

function getUCutoutBounds(shapeData, cutout) {
  const bounds = getBounds(shapeData.points);
  const plateW = bounds.width;
  const plateH = bounds.height;
  const offset = cutout.actualOffset ?? cutout.offset;
  const width = cutout.actualWidth ?? cutout.width;
  const depth = cutout.actualDepth ?? cutout.depth;

  if (cutout.side === "bottom") {
    return { x: offset, y: 0, w: width, h: depth };
  }

  if (cutout.side === "top") {
    return { x: offset, y: plateH - depth, w: width, h: depth };
  }

  if (cutout.side === "left") {
    return { x: 0, y: offset, w: depth, h: width };
  }

  return { x: plateW - depth, y: offset, w: depth, h: width };
}

function validateCutoutInsideShape(cutout, shapeData, label) {
  if (cutout.type === "lcorner") {
    const bounds = getBounds(shapeData.points);
    const plateW = bounds.width;
    const plateH = bounds.height;
    const w = cutout.actualW ?? cutout.w;
    const h = cutout.actualH ?? cutout.h;

    if (cutout.corner === "topRight") {
      validateRectInsideShape(plateW - w, plateH - h, w, h, shapeData, label);
      return;
    }

    if (cutout.corner === "topLeft") {
      validateRectInsideShape(0, plateH - h, w, h, shapeData, label);
      return;
    }

    if (cutout.corner === "bottomRight") {
      validateRectInsideShape(plateW - w, 0, w, h, shapeData, label);
      return;
    }

    validateRectInsideShape(0, 0, w, h, shapeData, label);
    return;
  }

  if (cutout.type === "ucutout") {
    const box = getUCutoutBounds(shapeData, cutout);
    validateRectInsideShape(box.x, box.y, box.w, box.h, shapeData, label);
    return;
  }

  validateRectInsideShape(
    cutout.actualX ?? cutout.x,
    cutout.actualY ?? cutout.y,
    cutout.actualW ?? cutout.w,
    cutout.actualH ?? cutout.h,
    shapeData,
    label
  );
}

function resolveRectCutoutInputs(shapeData) {
  const mode = cutoutRectModeInput ? cutoutRectModeInput.value : "size";
  const r = Number(cutoutRInput.value);

  if (mode === "reference") {
    const left = Number(cutoutRefLeftInput.value);
    const right = Number(cutoutRefRightInput.value);
    const bottom = Number(cutoutRefBottomInput.value);
    const top = Number(cutoutRefTopInput.value);

    if ([left, right, bottom, top, r].some(v => Number.isNaN(v))) {
      throw new Error("Referencia méreteknél csak számérték adható meg.");
    }

    if (right <= left || top <= bottom) {
      throw new Error("A referencia méretek nem helyesek (jobb > bal, felső > alsó kell legyen).");
    }

    const x = left;
    const y = bottom;
    const w = right - left;
    const h = top - bottom;

    validateRectCutout(w, h, r);

    return {
      mode,
      x,
      y,
      w,
      h,
      r,
      refLeft: left,
      refRight: right,
      refBottom: bottom,
      refTop: top
    };
  }

  if (mode === "edgeOffsets") {
    if (shapeData.type !== "rectangle") {
      throw new Error("A széltávolság alapú téglalap kivágás jelenleg csak téglalap külső formánál használható.");
    }

    const leftGap = Number(cutoutLeftGapInput.value);
    const rightGap = Number(cutoutRightGapInput.value);
    const bottomGap = Number(cutoutBottomGapInput.value);
    const topGap = Number(cutoutTopGapInput.value);

    if ([leftGap, rightGap, bottomGap, topGap, r].some(v => Number.isNaN(v))) {
      throw new Error("A széltávolság alapú kivágás adatainál csak számérték adható meg.");
    }

    const x = leftGap;
    const y = bottomGap;
    const w = shapeData.width - leftGap - rightGap;
    const h = shapeData.height - bottomGap - topGap;

    if (w <= 0 || h <= 0) {
      throw new Error("A megadott széltávolságokból a kivágás szélessége vagy magassága nem lehet 0 vagy negatív.");
    }

    validateRectCutout(w, h, r);

    return {
      mode,
      x,
      y,
      w,
      h,
      r,
      leftGap,
      rightGap,
      bottomGap,
      topGap
    };
  }

  const x = Number(cutoutXInput.value);
  const y = Number(cutoutYInput.value);
  const w = Number(cutoutWInput.value);
  const h = Number(cutoutHInput.value);

  if ([x, y, w, h, r].some(v => Number.isNaN(v))) {
    throw new Error("A téglalap kivágás adatainál csak számérték adható meg.");
  }

  if (w <= 0 || h <= 0) {
    throw new Error("A kivágás szélessége és magassága legyen nagyobb 0-nál.");
  }

  validateRectCutout(w, h, r);

  return {
    mode,
    x,
    y,
    w,
    h,
    r
  };
}

function mmToCanvasTransformer(points) {
  const bounds = getBounds(points);
  const padding = 80;
  const availableWidth = canvas.width - padding * 2;
  const availableHeight = canvas.height - padding * 2;

  const baseScale = Math.min(
    availableWidth / Math.max(bounds.width, 1),
    availableHeight / Math.max(bounds.height, 1)
  );

  const scale = baseScale * viewZoom;

  const drawWidth = bounds.width * scale;
  const drawHeight = bounds.height * scale;

  const offsetX = padding + (availableWidth - drawWidth) / 2 + viewPanX;
  const offsetY = padding + (availableHeight - drawHeight) / 2 + viewPanY;

  return function transformPoint(p) {
    return {
      x: offsetX + (p.x - bounds.minX) * scale,
      y: canvas.height - offsetY - drawHeight + (bounds.maxY - p.y) * scale
    };
  };
}

function drawPolygon(points, transform) {
  if (!points.length) return;
  ctx.beginPath();
  const first = transform(points[0]);
  ctx.moveTo(first.x, first.y);
  for (let i = 1; i < points.length; i++) {
    const pt = transform(points[i]);
    ctx.lineTo(pt.x, pt.y);
  }
  ctx.closePath();
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 2;
  ctx.stroke();

  points.forEach((p, index) => {
    const pt = transform(p);
    ctx.beginPath();
    ctx.fillStyle = "#dc2626";
    ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "13px Arial";
    ctx.fillStyle = "#991b1b";
    ctx.fillText(`S${index + 1}`, pt.x + 8, pt.y - 8);
  });
}

function isRightAngle(prev, current, next) {
  const v1 = { x: prev.x - current.x, y: prev.y - current.y };
  const v2 = { x: next.x - current.x, y: next.y - current.y };

  const dot = v1.x * v2.x + v1.y * v2.y;
  const len1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const len2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

  if (len1 === 0 || len2 === 0) return false;

  const cos = dot / (len1 * len2);
  const angle = Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI;
  return Math.abs(angle - 90) < 0.5;
}

function drawRightAngleMarks(points, transform) {
  points.forEach((point, index) => {
    const prev = points[(index - 1 + points.length) % points.length];
    const next = points[(index + 1) % points.length];

    if (!isRightAngle(prev, point, next)) return;

    const p = transform(point);

    ctx.font = "13px Arial";
    ctx.fillStyle = "#2563eb";
    ctx.fillText("90°", p.x + 10, p.y + 18);
  });
}

function drawOrigin(transform) {
  const origin = transform({ x: 0, y: 0 });
  ctx.fillStyle = "#2563eb";
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = "14px Arial";
  ctx.fillStyle = "#2563eb";
  ctx.fillText("Origó (0,0)", origin.x - 20, origin.y + 42);
}

function drawHoles(transform, shapeData) {
  const refA = transform({ x: 0, y: 0 });
  const bounds = getBounds(shapeData.points);
  const baseWidth = bounds.width;
  const refB = transform({ x: baseWidth, y: 0 });
  const scaleApprox = Math.abs(refB.x - refA.x) / Math.max(baseWidth, 1);

  holes.forEach((hole, index) => {
    const pt = transform({ x: hole.x, y: hole.y });
    const radius = ((hole.actualD ?? hole.d) / 2) * scaleApprox;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = "13px Arial";
    ctx.fillStyle = "#dc2626";
    ctx.fillText(`F${index + 1}`, pt.x + 8, pt.y - 8);
  });
}

function drawRectCutout(cutout, transform, index) {
  const x = cutout.actualX ?? cutout.x;
  const y = cutout.actualY ?? cutout.y;
  const w = cutout.actualW ?? cutout.w;
  const h = cutout.actualH ?? cutout.h;
  const r = cutout.actualR ?? cutout.r ?? 0;

  const p1 = transform({ x, y });
  const p2 = transform({ x: x + w, y: y + h });
  const left = Math.min(p1.x, p2.x);
  const top = Math.min(p1.y, p2.y);
  const width = Math.abs(p2.x - p1.x);
  const height = Math.abs(p2.y - p1.y);
  const radius = mmRadiusToCanvas(r, transform);

  buildRoundedRectPath(ctx, left, top, width, height, radius);
  ctx.strokeStyle = "#16a34a";
  ctx.lineWidth = 2;
  ctx.stroke();

  const radiusText = r > 0 ? ` R${r}` : "";
  ctx.font = "13px Arial";
  ctx.fillStyle = "#16a34a";
  ctx.fillText(`K${index + 1}${radiusText}`, left + 6, top - 6);
}

function getCornerLabel(corner) {
  return {
    topRight: "jobb felső",
    topLeft: "bal felső",
    bottomRight: "jobb alsó",
    bottomLeft: "bal alsó"
  }[corner] || corner;
}

function getLCutoutLabelAnchor(cutout, shapeData) {
  const bounds = getBounds(shapeData.points);
  const plateW = bounds.width;
  const plateH = bounds.height;

  const actualW = cutout.actualW ?? cutout.w;
  const actualH = cutout.actualH ?? cutout.h;

  if (cutout.corner === "topRight") {
    return { x: plateW - actualW - 10, y: plateH - actualH + 10 };
  }
  if (cutout.corner === "topLeft") {
    return { x: actualW + 10, y: plateH - actualH + 10 };
  }
  if (cutout.corner === "bottomRight") {
    return { x: plateW - actualW - 10, y: actualH + 18 };
  }
  return { x: actualW + 10, y: actualH + 18 };
}

function buildLCutoutSegments(shapeData, cutout) {
  const bounds = getBounds(shapeData.points);
  const plateW = bounds.width;
  const plateH = bounds.height;

  const actualW = cutout.actualW ?? cutout.w;
  const actualH = cutout.actualH ?? cutout.h;
  const actualInnerR = cutout.actualInnerR ?? cutout.innerR ?? 0;

  const r = Math.max(0, Math.min(actualInnerR, actualW / 2, actualH / 2));

  if (cutout.corner === "topRight") {
    return {
      line1: {
        x1: plateW - actualW,
        y1: plateH,
        x2: plateW - actualW,
        y2: plateH - actualH + r
      },
      line2: {
        x1: plateW - actualW + r,
        y1: plateH - actualH,
        x2: plateW,
        y2: plateH - actualH
      },
      arc: r > 0 ? {
        cx: plateW - actualW + r,
        cy: plateH - actualH + r,
        r,
        start: 180,
        end: 270
      } : null
    };
  }

  if (cutout.corner === "topLeft") {
    return {
      line1: {
        x1: actualW,
        y1: plateH,
        x2: actualW,
        y2: plateH - actualH + r
      },
      line2: {
        x1: 0,
        y1: plateH - actualH,
        x2: actualW - r,
        y2: plateH - actualH
      },
      arc: r > 0 ? {
        cx: actualW - r,
        cy: plateH - actualH + r,
        r,
        start: 270,
        end: 360
      } : null
    };
  }

  if (cutout.corner === "bottomRight") {
    return {
      line1: {
        x1: plateW - actualW,
        y1: 0,
        x2: plateW - actualW,
        y2: actualH - r
      },
      line2: {
        x1: plateW - actualW + r,
        y1: actualH,
        x2: plateW,
        y2: actualH
      },
      arc: r > 0 ? {
        cx: plateW - actualW + r,
        cy: actualH - r,
        r,
        start: 90,
        end: 180
      } : null
    };
  }

  return {
    line1: {
      x1: actualW,
      y1: 0,
      x2: actualW,
      y2: actualH - r
    },
    line2: {
      x1: 0,
      y1: actualH,
      x2: actualW - r,
      y2: actualH
    },
    arc: r > 0 ? {
      cx: actualW - r,
      cy: actualH - r,
      r,
      start: 0,
      end: 90
    } : null
  };
}

function drawCanvasArcFromMm(arc, transform) {
  const center = transform({ x: arc.cx, y: arc.cy });
  const radiusPx = mmRadiusToCanvas(arc.r, transform);
  const startRad = (arc.start * Math.PI) / 180;
  const endRad = (arc.end * Math.PI) / 180;
  ctx.arc(center.x, center.y, radiusPx, -startRad, -endRad, true);
}

function drawLCutout(cutout, transform, index, shapeData) {
  const seg = buildLCutoutSegments(shapeData, cutout);

  const p1a = transform({ x: seg.line1.x1, y: seg.line1.y1 });
  const p1b = transform({ x: seg.line1.x2, y: seg.line1.y2 });
  const p2a = transform({ x: seg.line2.x1, y: seg.line2.y1 });
  const p2b = transform({ x: seg.line2.x2, y: seg.line2.y2 });

  ctx.beginPath();
  ctx.moveTo(p1a.x, p1a.y);
  ctx.lineTo(p1b.x, p1b.y);
  ctx.moveTo(p2a.x, p2a.y);
  ctx.lineTo(p2b.x, p2b.y);

  if (seg.arc) {
    drawCanvasArcFromMm(seg.arc, transform);
  }

  ctx.strokeStyle = "#16a34a";
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();

  const labelAnchor = transform(getLCutoutLabelAnchor(cutout, shapeData));
  ctx.font = "13px Arial";
  ctx.fillStyle = "#16a34a";
  ctx.fillText(`K${index + 1} L R${cutout.innerR || 0}`, labelAnchor.x, labelAnchor.y);
}

function buildUCutoutSegments(shapeData, cutout) {
  const bounds = getBounds(shapeData.points);
  const plateW = bounds.width;
  const plateH = bounds.height;

  const offset = cutout.actualOffset ?? cutout.offset;
  const width = cutout.actualWidth ?? cutout.width;
  const depth = cutout.actualDepth ?? cutout.depth;
  const radius = cutout.actualRadius ?? cutout.radius ?? 0;

  const r = Math.max(0, Math.min(radius, width / 2, depth / 2));

  // ALSÓ OLDAL (befelé = felfelé)
  if (cutout.side === "bottom") {
    return [
      { type: "line", x1: offset, y1: 0, x2: offset, y2: depth - r },
      { type: "arc", cx: offset + r, cy: depth - r, r, start: 180, end: 270 },
      { type: "line", x1: offset + r, y1: depth, x2: offset + width - r, y2: depth },
      { type: "arc", cx: offset + width - r, cy: depth - r, r, start: 270, end: 360 },
      { type: "line", x1: offset + width, y1: depth - r, x2: offset + width, y2: 0 }
    ];
  }

  // FELSŐ OLDAL (befelé = lefelé)
  if (cutout.side === "top") {
    return [
      { type: "line", x1: offset, y1: plateH, x2: offset, y2: plateH - depth + r },
      { type: "arc", cx: offset + r, cy: plateH - depth + r, r, start: 90, end: 180 },
      { type: "line", x1: offset + r, y1: plateH - depth, x2: offset + width - r, y2: plateH - depth },
      { type: "arc", cx: offset + width - r, cy: plateH - depth + r, r, start: 0, end: 90 },
      { type: "line", x1: offset + width, y1: plateH - depth + r, x2: offset + width, y2: plateH }
    ];
  }

  // BAL OLDAL (befelé = jobbra)
  if (cutout.side === "left") {
    return [
      { type: "line", x1: 0, y1: offset, x2: depth - r, y2: offset },
      { type: "arc", cx: depth - r, cy: offset + r, r, start: 180, end: 270 },
      { type: "line", x1: depth, y1: offset + r, x2: depth, y2: offset + width - r },
      { type: "arc", cx: depth - r, cy: offset + width - r, r, start: 90, end: 180 },
      { type: "line", x1: depth - r, y1: offset + width, x2: 0, y2: offset + width }
    ];
  }

  // JOBB OLDAL (befelé = balra)
  return [
    { type: "line", x1: plateW, y1: offset, x2: plateW - depth + r, y2: offset },
    { type: "arc", cx: plateW - depth + r, cy: offset + r, r, start: 270, end: 360 },
    { type: "line", x1: plateW - depth, y1: offset + r, x2: plateW - depth, y2: offset + width - r },
    { type: "arc", cx: plateW - depth + r, cy: offset + width - r, r, start: 0, end: 90 },
    { type: "line", x1: plateW - depth + r, y1: offset + width, x2: plateW, y2: offset + width }
  ];
}

function drawUCutout(cutout, transform, index, shapeData) {
  const bounds = getBounds(shapeData.points);
  const plateW = bounds.width;
  const plateH = bounds.height;

  const offset = cutout.actualOffset ?? cutout.offset;
  const width = cutout.actualWidth ?? cutout.width;
  const depth = cutout.actualDepth ?? cutout.depth;
  const radius = cutout.actualRadius ?? cutout.radius ?? 0;
  const r = Math.max(0, Math.min(radius, width / 2, depth / 2));
  const radiusPx = mmRadiusToCanvas(r, transform);

  let p0;
  let p1;
  let p2;
  let p3;

  if (cutout.side === "bottom") {
    p0 = { x: offset, y: 0 };
    p1 = { x: offset, y: depth };
    p2 = { x: offset + width, y: depth };
    p3 = { x: offset + width, y: 0 };
  } else if (cutout.side === "top") {
    p0 = { x: offset, y: plateH };
    p1 = { x: offset, y: plateH - depth };
    p2 = { x: offset + width, y: plateH - depth };
    p3 = { x: offset + width, y: plateH };
  } else if (cutout.side === "left") {
    p0 = { x: 0, y: offset };
    p1 = { x: depth, y: offset };
    p2 = { x: depth, y: offset + width };
    p3 = { x: 0, y: offset + width };
  } else {
    p0 = { x: plateW, y: offset };
    p1 = { x: plateW - depth, y: offset };
    p2 = { x: plateW - depth, y: offset + width };
    p3 = { x: plateW, y: offset + width };
  }

  const c0 = transform(p0);
  const c1 = transform(p1);
  const c2 = transform(p2);
  const c3 = transform(p3);

  ctx.beginPath();
  ctx.moveTo(c0.x, c0.y);

  if (r > 0) {
    ctx.arcTo(c1.x, c1.y, c2.x, c2.y, radiusPx);
    ctx.arcTo(c2.x, c2.y, c3.x, c3.y, radiusPx);
    ctx.lineTo(c3.x, c3.y);
  } else {
    ctx.lineTo(c1.x, c1.y);
    ctx.lineTo(c2.x, c2.y);
    ctx.lineTo(c3.x, c3.y);
  }

  ctx.strokeStyle = "#16a34a";
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.font = "13px Arial";
  ctx.fillStyle = "#16a34a";
  ctx.fillText(`K${index + 1} U R${cutout.radius || 0}`, c0.x + 8, c0.y - 8);
}

function drawCutouts(transform, shapeData) {
  cutouts.forEach((cutout, index) => {
    if (cutout.type === "lcorner") {
      drawLCutout(cutout, transform, index, shapeData);
    } else if (cutout.type === "ucutout") {
      drawUCutout(cutout, transform, index, shapeData);
    } else {
      drawRectCutout(cutout, transform, index);
    }
  });
}

function renderHoleList() {
  holeList.innerHTML = "";
  holes.forEach((hole, index) => {
    const row = document.createElement("div");
    row.className = "list-item";
    row.innerHTML = `
      <span>F${index + 1}: X ${hole.x}, Y ${hole.y}, Ø ${hole.d} → gyártva: ${hole.actualD ?? hole.d}</span>
      <button data-index="${index}">Törlés</button>
    `;
    holeList.appendChild(row);
  });

  holeList.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.index);
      holes.splice(index, 1);
      renderHoleList();
      drawScene();
    });
  });
}

function renderCutoutList() {
  cutoutList.innerHTML = "";
  cutouts.forEach((cutout, index) => {
    const row = document.createElement("div");
    row.className = "list-item";
        const text = cutout.type === "lcorner"
          ? `K${index + 1}: L sarok, ${cutout.w}×${cutout.h}, ${getCornerLabel(cutout.corner)}, belső R ${cutout.innerR || 0} → gyártva: ${(cutout.actualW ?? cutout.w)}×${(cutout.actualH ?? cutout.h)}, R ${(cutout.actualInnerR ?? cutout.innerR ?? 0)}`
          : cutout.type === "ucutout"
            ? `K${index + 1}: U élkivágás, oldal: ${cutout.side}, kezdés: ${cutout.offset}, nyílás: ${cutout.width}, mélység: ${cutout.depth}, R ${cutout.radius || 0} → gyártva: kezdés ${(cutout.actualOffset ?? cutout.offset)}, nyílás ${(cutout.actualWidth ?? cutout.width)}, mélység ${(cutout.actualDepth ?? cutout.depth)}, R ${(cutout.actualRadius ?? cutout.radius ?? 0)}`
            : cutout.inputMode === "edgeOffsets"
              ? `K${index + 1}: Téglalap, bal ${cutout.leftGap}, jobb ${cutout.rightGap}, alsó ${cutout.bottomGap}, felső ${cutout.topGap} → számolt: ${cutout.w}×${cutout.h} → gyártva: ${(cutout.actualW ?? cutout.w)}×${(cutout.actualH ?? cutout.h)}, R ${(cutout.actualR ?? cutout.r ?? 0)}`
              : cutout.inputMode === "reference"
                ? `K${index + 1}: REF bal ${cutout.refLeft}, jobb ${cutout.refRight}, alsó ${cutout.refBottom}, felső ${cutout.refTop} → CAD: ${cutout.w}×${cutout.h} → gyártva: ${(cutout.actualW ?? cutout.w)}×${(cutout.actualH ?? cutout.h)}, R ${(cutout.actualR ?? cutout.r ?? 0)}`
                : `K${index + 1}: Téglalap, X ${cutout.x}, Y ${cutout.y}, ${cutout.w}×${cutout.h} → gyártva: ${(cutout.actualW ?? cutout.w)}×${(cutout.actualH ?? cutout.h)}, R ${(cutout.actualR ?? cutout.r ?? 0)}`;
    row.innerHTML = `
      <span>${text}</span>
      <button data-index="${index}">Törlés</button>
    `;
    cutoutList.appendChild(row);
  });

  cutoutList.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.index);
      cutouts.splice(index, 1);
      renderCutoutList();
      drawScene();
    });
  });
}

function drawScene() {
  resizeCanvas();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  try {
    const shapeData = getShapeData();
    holes.forEach(hole => {
      validateCircleInsideShape(hole.x, hole.y, hole.actualD ?? hole.d, shapeData, "A furat");
    });

    cutouts.forEach(cutout => {
      if (cutout.type === "lcorner") {
        validateLCutout(cutout.w, cutout.h, cutout.innerR || 0);
      } else if (cutout.type === "ucutout") {
        validateUCutout(cutout.offset, cutout.width, cutout.depth, cutout.radius || 0);
      } else {
        validateRectCutout(cutout.w, cutout.h, cutout.r || 0);
      }
      validateCutoutInsideShape(cutout, shapeData, "A kivágás");
    });

    const transform = mmToCanvasTransformer(shapeData.points);
    drawPolygon(shapeData.points, transform);
    drawRightAngleMarks(shapeData.points, transform);
    drawOrigin(transform);
    drawHoles(transform, shapeData);
    drawCutouts(transform, shapeData);
    setStatus("A rajz frissítve.");
  } catch (error) {
    setStatus(error.message, true);
  }
}
function pdfSafeText(text) {
  return String(text)
    .replaceAll("á", "a")
    .replaceAll("Á", "A")
    .replaceAll("é", "e")
    .replaceAll("É", "E")
    .replaceAll("í", "i")
    .replaceAll("Í", "I")
    .replaceAll("ó", "o")
    .replaceAll("Ó", "O")
    .replaceAll("ö", "o")
    .replaceAll("Ö", "O")
    .replaceAll("ő", "o")
    .replaceAll("Ő", "O")
    .replaceAll("ú", "u")
    .replaceAll("Ú", "U")
    .replaceAll("ü", "u")
    .replaceAll("Ü", "U")
    .replaceAll("ű", "u")
    .replaceAll("Ű", "U");
}

function pdfText(doc, text, x, y) {
  doc.text(pdfSafeText(text), x, y);
  
}

function getPdfMainLine(shapeData) {
  if (shapeData.type === "rectangle") {
    return `Szelesseg: ${shapeData.width} mm | Magassag: ${shapeData.height} mm`;
  }
  const alignText = shapeData.align === "left" ? "Balra zart" : shapeData.align === "right" ? "Jobbra zart" : "Kozepre zart";
  return `Felso: ${shapeData.top} mm | Also: ${shapeData.bottom} mm | Magassag: ${shapeData.height} mm | ${alignText}`;
}

function drawArrowHead(doc, x, y, direction) {
  const size = 1.5;
  if (direction === "right") {
    doc.line(x, y, x - size, y - size);
    doc.line(x, y, x - size, y + size);
  }
  if (direction === "up") {
    doc.line(x, y, x - size, y + size);
    doc.line(x, y, x + size, y + size);
  }
}

function drawOriginMarker(doc, plateLeftX, plateBottomY) {
  const originX = plateLeftX - 5;
  const originY = plateBottomY + 5;
  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(0.2);
  doc.line(originX, originY, originX + 6, originY);
  doc.line(originX, originY, originX, originY - 6);
  drawArrowHead(doc, originX + 6, originY, "right");
  drawArrowHead(doc, originX, originY - 6, "up");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.text("X", originX + 7.5, originY + 1);
  doc.text("Y", originX - 1, originY - 7.5);
  doc.text("0,0", originX - 1.5, originY + 4);
}

function drawClosedPolyline(doc, points) {
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.45);
  for (let i = 0; i < points.length; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    doc.line(current.x, current.y, next.x, next.y);
  }
}

function buildArcPolylinePoints(cx, cy, r, startDeg, endDeg, steps = 12) {
  const points = [];
  const span = endDeg - startDeg;

  for (let i = 0; i <= steps; i += 1) {
    const deg = startDeg + (span * i) / steps;
    const rad = (deg * Math.PI) / 180;
    points.push({
      x: cx + Math.cos(rad) * r,
      y: cy + Math.sin(rad) * r
    });
  }

  return points;
}

function drawPdfArcAsPolyline(doc, tx, ty, arc, scale) {
  const pts = buildArcPolylinePoints(arc.cx, arc.cy, arc.r, arc.start, arc.end, 14);
  for (let i = 0; i < pts.length - 1; i += 1) {
    doc.line(
      tx(pts[i].x),
      ty(pts[i].y),
      tx(pts[i + 1].x),
      ty(pts[i + 1].y)
    );
  }
}

function drawLCornerPdf(doc, cutout, shapeData, offsetX, bottomY, bounds, scale, index) {
  const seg = buildLCutoutSegments(shapeData, cutout);

  function tx(x) {
    return offsetX + (x - bounds.minX) * scale;
  }

  function ty(y) {
    return bottomY - (y - bounds.minY) * scale;
  }

  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(0.35);

  doc.line(tx(seg.line1.x1), ty(seg.line1.y1), tx(seg.line1.x2), ty(seg.line1.y2));
  doc.line(tx(seg.line2.x1), ty(seg.line2.y1), tx(seg.line2.x2), ty(seg.line2.y2));

  if (seg.arc) {
    drawPdfArcAsPolyline(doc, tx, ty, seg.arc, scale);
  }

  const label = getLCutoutLabelAnchor(cutout, shapeData);
  const lx = tx(label.x);
  const ly = ty(label.y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const radiusText = cutout.innerR > 0 ? ` R${cutout.innerR}` : "";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(
    pdfSafeText(`K${index + 1}${radiusText}`),
    lx + 2,
    ly - 1
  );
}

function drawUCutoutPdf(doc, cutout, shapeData, offsetX, bottomY, bounds, scale, index) {
  const segments = buildUCutoutSegments(shapeData, cutout);

  function tx(x) {
    return offsetX + (x - bounds.minX) * scale;
  }

  function ty(y) {
    return bottomY - (y - bounds.minY) * scale;
  }

  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(0.35);

  segments.forEach(segment => {
    if (segment.type === "line") {
      doc.line(tx(segment.x1), ty(segment.y1), tx(segment.x2), ty(segment.y2));
    } else {
      drawPdfArcAsPolyline(doc, tx, ty, segment, scale);
    }
  });

  const first = segments[0];
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(pdfSafeText(`K${index + 1} U`), tx(first.x1) + 2, ty(first.y1) - 1);
}

function drawPlatePdf(doc, area, shapeData) {
  const polygon = shapeData.points;
  const bounds = getBounds(polygon);
  const leftReserve = 16;
  const bottomReserve = 14;
  const topReserve = 8;
  const rightReserve = 14;

  const availableWidth = area.w - leftReserve - rightReserve;
  const availableHeight = area.h - topReserve - bottomReserve;
  const scale = Math.min(availableWidth / Math.max(bounds.width, 1), availableHeight / Math.max(bounds.height, 1));

  const drawWidth = bounds.width * scale;
  const drawHeight = bounds.height * scale;
  const offsetX = area.x + leftReserve + (availableWidth - drawWidth) / 2;
  const offsetY = area.y + topReserve + (availableHeight - drawHeight) / 2;
  const bottomY = offsetY + drawHeight;

  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.2);
  doc.rect(area.x, area.y, area.w, area.h);

  const transformed = polygon.map(point => ({
    x: offsetX + (point.x - bounds.minX) * scale,
    y: bottomY - (point.y - bounds.minY) * scale
  }));

  drawClosedPolyline(doc, transformed);

  transformed.forEach((point, index) => {
    doc.setFillColor(220, 38, 38);
    doc.circle(point.x, point.y, 0.8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(pdfSafeText(`S${index + 1}`), point.x + 1.5, point.y - 1.5);
  });

  cutouts.forEach((cutout, index) => {
    if (cutout.type === "lcorner") {
      drawLCornerPdf(doc, cutout, shapeData, offsetX, bottomY, bounds, scale, index);
    } else if (cutout.type === "ucutout") {
      drawUCutoutPdf(doc, cutout, shapeData, offsetX, bottomY, bounds, scale, index);
    } else {
      const x0 = cutout.actualX ?? cutout.x;
      const y0 = cutout.actualY ?? cutout.y;
      const w0 = cutout.actualW ?? cutout.w;
      const h0 = cutout.actualH ?? cutout.h;
      const r0 = cutout.actualR ?? cutout.r ?? 0;
      
      const x = offsetX + (x0 - bounds.minX) * scale;
      const y = bottomY - (y0 + h0 - bounds.minY) * scale;
      const w = w0 * scale;
      const h = h0 * scale;
      const r = Math.min(r0 * scale, w / 2, h / 2);
      if (r > 0) {
        doc.roundedRect(x, y, w, h, r, r);
      } else {
        doc.rect(x, y, w, h);
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      const radiusText = r0 > 0 ? ` R${r0}` : "";
      doc.text(pdfSafeText(`K${index + 1}${radiusText}`), x + w + 2.5, y - 1);
    }
  });

 holes.forEach((hole, index) => {
  const cx = offsetX + (hole.x - bounds.minX) * scale;
  const cy = bottomY - (hole.y - bounds.minY) * scale;
  const r = ((hole.actualD ?? hole.d) * scale) / 2;
  doc.circle(cx, cy, r);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(pdfSafeText(`F${index + 1}`), cx + r + 2.5, cy - r - 1);
});

  drawOriginMarker(doc, offsetX, bottomY);
}

async function exportPdf() {
  const shapeData = getShapeData();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;

  doc.setDrawColor(110, 110, 110);
  doc.setLineWidth(0.3);
  doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);
  doc.rect(margin, margin, pageWidth - margin * 2, 10);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(pdfSafeText("Üvegterv - ellenorzo lap"), margin + 4, margin + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(pdfSafeText("PDF ellenorzesi nezet"), pageWidth - margin - 35, margin + 7);

  const infoBox = { x: margin, y: 24, w: pageWidth - margin * 2, h: 40 };
  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.2);
  doc.rect(infoBox.x, infoBox.y, infoBox.w, infoBox.h);

  let infoY = infoBox.y + 6;
  const exportDate = new Date().toLocaleString("hu-HU");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(pdfSafeText("Lapadatok"), infoBox.x + 3, infoY);

  infoY += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(pdfSafeText(`Forma: ${shapeData.templateName}`), infoBox.x + 3, infoY);
  doc.text(pdfSafeText(`Vastagsag: ${shapeData.thickness} mm`), infoBox.x + 85, infoY);

  infoY += 4.5;
  doc.text(pdfSafeText(getPdfMainLine(shapeData)), infoBox.x + 3, infoY);
  doc.text(pdfSafeText(`Export: ${exportDate}`), infoBox.x + 85, infoY);

  infoY += 4.5;
  doc.text(`S1: ${round2(shapeData.points[0].x)},${round2(shapeData.points[0].y)} | S2: ${round2(shapeData.points[1].x)},${round2(shapeData.points[1].y)}`, infoBox.x + 3, infoY);
  infoY += 4.5;
  doc.text(`S3: ${round2(shapeData.points[2].x)},${round2(shapeData.points[2].y)} | S4: ${round2(shapeData.points[3].x)},${round2(shapeData.points[3].y)}`, infoBox.x + 3, infoY);
  infoY += 4.5;
  doc.text(pdfSafeText("Koordinata rendszer: X = balrol, Y = alulrol, origo = bal also sarok."), infoBox.x + 3, infoY);

  drawPlatePdf(doc, { x: margin, y: 68, w: pageWidth - margin * 2, h: 120 }, shapeData);

  const tableArea = { x: margin, y: 194, w: pageWidth - margin * 2, h: 30 };
  doc.rect(tableArea.x, tableArea.y, tableArea.w, tableArea.h);
  const middleX = tableArea.x + tableArea.w / 2;
  doc.line(middleX, tableArea.y, middleX, tableArea.y + tableArea.h);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(pdfSafeText("Furatok"), tableArea.x + 3, tableArea.y + 5);
  doc.text(pdfSafeText("Kivagasok"), middleX + 3, tableArea.y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);

  let holeY = tableArea.y + 10;
  if (holes.length === 0) {
    doc.text(pdfSafeText("Nincs furat."), tableArea.x + 3, holeY);
  } else {
    holes.forEach((hole, index) => {
      doc.text(
  pdfSafeText(`F${index + 1}: X=${hole.x} Y=${hole.y} O=${hole.d} gyartva=${hole.actualD ?? hole.d}`),
  tableArea.x + 3,
  holeY
);
      holeY += 4;
    });
  }

  let cutoutY = tableArea.y + 10;
  if (cutouts.length === 0) {
    doc.text(pdfSafeText("Nincs kivagas."), middleX + 3, cutoutY);
  } else {
    cutouts.forEach((cutout, index) => {
      const text = cutout.type === "lcorner"
        ? `K${index + 1}: L sarok, ${getCornerLabel(cutout.corner)}, ${cutout.w}x${cutout.h}, R=${cutout.innerR || 0}`
        : cutout.type === "ucutout"
          ? `K${index + 1}: U, oldal=${cutout.side}, kezd=${cutout.offset}, nyilas=${cutout.width}, melyseg=${cutout.depth}, R=${cutout.radius || 0}`
          : `K${index + 1}: Tegl., X=${cutout.x} Y=${cutout.y} Sz=${cutout.w} M=${cutout.h} R=${cutout.actualR ?? cutout.r ?? 0}`;
      doc.text(pdfSafeText(text), middleX + 3, cutoutY);
      cutoutY += 4;
    });
  }

  doc.save("uvegterv-v53d-PDF-export-javitas.pdf");
}

function exportDxf() {
  const shapeData = getShapeData();
  const lines = [];
  const polygon = shapeData.points;

  function add(...values) {
    values.forEach(value => lines.push(String(value)));
  }

  function addLine(x1, y1, x2, y2) {
    add(0, "LINE", 8, "0", 10, x1, 20, y1, 30, 0, 11, x2, 21, y2, 31, 0);
  }

function addPolylineEntity(points, layerName, closed = false) {
  add(0, "POLYLINE");
  add(100, "AcDbEntity");
  add(100, "AcDb2dPolyline");
  add(8, layerName);
  add(66, 1);
  add(70, closed ? 1 : 0);

  points.forEach(point => {
    add(0, "VERTEX");
    add(8, layerName);
    add(10, round2(point.x));
    add(20, round2(point.y));
    add(30, 0);

    if (point.bulge) {
      add(42, round2(point.bulge));
    }
  });

  add(0, "SEQEND");
  add(8, layerName);
}

  function addCircle(cx, cy, radius) {
    add(0, "CIRCLE", 8, "0", 10, cx, 20, cy, 30, 0, 40, radius);
  }

  function addArc(cx, cy, radius, startAngle, endAngle) {
    add(0, "ARC", 8, "0", 10, cx, 20, cy, 30, 0, 40, radius, 50, startAngle, 51, endAngle);
  }

  function addRoundedRectangle(x, y, width, height, radius) {
    const r = Math.max(0, Math.min(radius, width / 2, height / 2));
    const bulge = round2(Math.tan((90 * Math.PI / 180) / 4));

    if (r === 0) {
      addPolylineEntity([
        { x, y },
        { x: x + width, y },
        { x: x + width, y: y + height },
        { x, y: y + height }
      ], "CUTOUTS", true);
      return;
    }

    addPolylineEntity([
      { x: x + r, y },
      { x: x + width - r, y, bulge },
      { x: x + width, y: y + r },
      { x: x + width, y: y + height - r, bulge },
      { x: x + width - r, y: y + height },
      { x: x + r, y: y + height, bulge },
      { x, y: y + height - r },
      { x, y: y + r, bulge }
    ], "CUTOUTS", true);
  }

  function addPolylineClosed(points) {
    for (let i = 0; i < points.length; i += 1) {
      const current = points[i];
      const next = points[(i + 1) % points.length];
      addLine(current.x, current.y, next.x, next.y);
    }
  }

  function addPolylineOpen(points) {
    addPolylineEntity(points, "CUTOUTS", false);
  }

  function addLCorner(cutout) {
  const seg = buildLCutoutSegments(shapeData, cutout);
  const b = round2(Math.tan(Math.PI / 8));

  if (!seg.arc) {
    if (cutout.corner === "topLeft" || cutout.corner === "bottomLeft") {
      addPolylineEntity([
        { x: seg.line1.x1, y: seg.line1.y1 },
        { x: seg.line1.x2, y: seg.line1.y2 },
        { x: seg.line2.x2, y: seg.line2.y2 },
        { x: seg.line2.x1, y: seg.line2.y1 }
      ], "CUTOUTS", false);
    } else {
      addPolylineEntity([
        { x: seg.line1.x1, y: seg.line1.y1 },
        { x: seg.line1.x2, y: seg.line1.y2 },
        { x: seg.line2.x1, y: seg.line2.y1 },
        { x: seg.line2.x2, y: seg.line2.y2 }
      ], "CUTOUTS", false);
    }
    return;
  }

  if (cutout.corner === "topRight") {
    addPolylineEntity([
      { x: seg.line1.x1, y: seg.line1.y1 },
      { x: seg.line1.x2, y: seg.line1.y2, bulge: b },
      { x: seg.line2.x1, y: seg.line2.y1 },
      { x: seg.line2.x2, y: seg.line2.y2 }
    ], "CUTOUTS", false);
    return;
  }

  if (cutout.corner === "topLeft") {
    addPolylineEntity([
      { x: seg.line1.x1, y: seg.line1.y1 },
      { x: seg.line1.x2, y: seg.line1.y2, bulge: -b },
      { x: seg.line2.x2, y: seg.line2.y2 },
      { x: seg.line2.x1, y: seg.line2.y1 }
    ], "CUTOUTS", false);
    return;
  }

  if (cutout.corner === "bottomRight") {
    addPolylineEntity([
      { x: seg.line1.x1, y: seg.line1.y1 },
      { x: seg.line1.x2, y: seg.line1.y2, bulge: -b },
      { x: seg.line2.x1, y: seg.line2.y1 },
      { x: seg.line2.x2, y: seg.line2.y2 }
    ], "CUTOUTS", false);
    return;
  }

  addPolylineEntity([
    { x: seg.line1.x1, y: seg.line1.y1 },
    { x: seg.line1.x2, y: seg.line1.y2, bulge: b },
    { x: seg.line2.x2, y: seg.line2.y2 },
    { x: seg.line2.x1, y: seg.line2.y1 }
  ], "CUTOUTS", false);
}

  function addUCutout(cutout) {
  const bounds = getBounds(shapeData.points);
  const plateW = bounds.width;
  const plateH = bounds.height;

  const offset = cutout.actualOffset ?? cutout.offset;
  const width = cutout.actualWidth ?? cutout.width;
  const depth = cutout.actualDepth ?? cutout.depth;
  const radius = cutout.actualRadius ?? cutout.radius ?? 0;
  const r = Math.max(0, Math.min(radius, width / 2, depth / 2));

  const b = round2(Math.tan(Math.PI / 8));

  if (cutout.side === "bottom") {
    addPolylineEntity([
      { x: offset, y: 0 },
      { x: offset, y: depth - r, bulge: -b },
      { x: offset + r, y: depth },
      { x: offset + width - r, y: depth, bulge: -b },
      { x: offset + width, y: depth - r },
      { x: offset + width, y: 0 }
    ], "CUTOUTS", false);
    return;
  }

  if (cutout.side === "top") {
    addPolylineEntity([
      { x: offset, y: plateH },
      { x: offset, y: plateH - depth + r, bulge: b },
      { x: offset + r, y: plateH - depth },
      { x: offset + width - r, y: plateH - depth, bulge: b },
      { x: offset + width, y: plateH - depth + r },
      { x: offset + width, y: plateH }
    ], "CUTOUTS", false);
    return;
  }

  if (cutout.side === "left") {
    addPolylineEntity([
      { x: 0, y: offset },
      { x: depth - r, y: offset, bulge: b },
      { x: depth, y: offset + r },
      { x: depth, y: offset + width - r, bulge: b },
      { x: depth - r, y: offset + width },
      { x: 0, y: offset + width }
    ], "CUTOUTS", false);
    return;
  }

  addPolylineEntity([
    { x: plateW, y: offset },
    { x: plateW - depth + r, y: offset, bulge: -b },
    { x: plateW - depth, y: offset + r },
    { x: plateW - depth, y: offset + width - r, bulge: -b },
    { x: plateW - depth + r, y: offset + width },
    { x: plateW, y: offset + width }
  ], "CUTOUTS", false);
}

  // HEADER
  add(0, "SECTION", 2, "HEADER");
  add(0, "ENDSEC");

// TABLES + LAYER DEFINÍCIÓ
  add(0, "SECTION", 2, "TABLES");

  add(0, "TABLE", 2, "LAYER", 70, 2);

// 0 layer
  add(0, "LAYER");
  add(2, "0");
  add(70, 0);
  add(62, 7);
  add(6, "CONTINUOUS");

// CUTOUTS layer
  add(0, "LAYER");
  add(2, "CUTOUTS");
  add(70, 0);
  add(62, 3);
  add(6, "CONTINUOUS");

  add(0, "ENDTAB");
  add(0, "ENDSEC");

// ENTITIES
  add(0, "SECTION", 2, "ENTITIES");
  addPolylineClosed(polygon);
  holes.forEach(hole => addCircle(hole.x, hole.y, (hole.actualD ?? hole.d) / 2));
  cutouts.forEach(cutout => {
  if (cutout.type === "lcorner") {
    addLCorner(cutout);
  } else if (cutout.type === "ucutout") {
  addUCutout(cutout);
} else {
    const x = cutout.actualX ?? cutout.x;
    const y = cutout.actualY ?? cutout.y;
    const w = cutout.actualW ?? cutout.w;
    const h = cutout.actualH ?? cutout.h;
    const r = cutout.actualR ?? cutout.r ?? 0;

    addRoundedRectangle(x, y, w, h, r);
  }
});
  add(0, "ENDSEC");
  add(0, "EOF");

  const blob = new Blob([lines.join("\r\n") + "\r\n"], { type: "application/dxf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "uvegterv-v53d-PDF-export-javitas.dxf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

shapeType.addEventListener("change", updateShapeFields);
trapModeInput.addEventListener("change", updateTrapModeFields);
cutoutTypeInput.addEventListener("change", updateCutoutFields);
if (cutoutRectModeInput) {
  cutoutRectModeInput.addEventListener("change", updateCutoutFields);
}
drawBtn.addEventListener("click", drawScene);

document.querySelectorAll(".sidebar input, .sidebar select").forEach((field) => {
  field.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();

    const fields = Array.from(
      document.querySelectorAll(".sidebar input, .sidebar select, .sidebar button")
    ).filter(el => !el.disabled && !el.closest(".hidden"));

    const currentIndex = fields.indexOf(field);
    const nextField = fields[currentIndex + 1];

    if (nextField) {
      nextField.focus();
    }
  });
});

exportPdfBtn.addEventListener("click", async () => {
  try {
    await exportPdf();
    setStatus("PDF export kész.");
  } catch (error) {
    setStatus("Hiba történt a PDF export során.", true);
    console.error(error);
  }
});

exportDxfBtn.addEventListener("click", () => {
  try {
    exportDxf();
    setStatus("DXF export kész.");
  } catch (error) {
    setStatus("Hiba történt a DXF export során.", true);
    console.error(error);
  }
});

[
  rectWidthInput,
  rectHeightInput,
  glassThicknessInput,
  trapModeInput,
  trapTopInput,
  trapBottomInput,
  trapHeightInput,
  trapAlignInput,
  trapTopRAInput,
  trapBottomRAInput,
  trapLeftInput,
  trapRightInput,
  trapFreeTopInput,
  trapFreeBottomInput,
  trapFreeLeftInput,
  trapFreeRightInput,
  trapFreeAlignInput,
  trapRightAngleSideInput,
  cutoutTypeInput,
  cutoutRectModeInput,
  cutoutXInput,
  cutoutYInput,
  cutoutWInput,
  cutoutHInput,
  cutoutLeftGapInput,
  cutoutRightGapInput,
  cutoutBottomGapInput,
  cutoutTopGapInput,
  cutoutRefLeftInput,
  cutoutRefRightInput,
  cutoutRefBottomInput,
  cutoutRefTopInput,
  cutoutRInput,
  lCutoutWInput,
  lCutoutHInput,
  lInnerRInput,
  lCornerInput,
  uSideInput,
  uOffsetInput,
  uWidthInput,
  uDepthInput,
  uRadiusInput,
  holeAllowanceInput,
  cutoutAllowanceInput
]
.filter(Boolean)
.forEach(el => {
  el.addEventListener("input", drawScene);
  el.addEventListener("change", drawScene);
});

addHoleBtn.addEventListener("click", () => {
  const x = Number(holeXInput.value);
  const y = Number(holeYInput.value);
  const d = Number(holeDInput.value);

  if ([x, y, d].some(v => Number.isNaN(v))) {
    setStatus("A furat adatainál csak számérték adható meg.", true);
    return;
  }

  if (d <= 0) {
    setStatus("A furat átmérője legyen nagyobb 0-nál.", true);
    return;
  }

  const holeAllowance = getHoleAllowance();
  const actualD = d + holeAllowance;

  try {
    validateCircleInsideShape(x, y, actualD, getShapeData(), "A furat");
  } catch (error) {
    setStatus(error.message, true);
    return;
  }

  holes.push({
    x,
    y,
    d,
    actualD
  });
  renderHoleList();
  drawScene();
});

addCutoutBtn.addEventListener("click", () => {
  const type = cutoutTypeInput.value;

  try {
    const cutoutAllowance = getCutoutAllowance();
    const shapeData = getShapeData();

    if (type === "lcorner") {
      const w = Number(lCutoutWInput.value);
      const h = Number(lCutoutHInput.value);
      const innerR = Number(lInnerRInput.value);
      const corner = lCornerInput.value;

      validateLCutout(w, h, innerR);

      const newCutout = {
        type,
        w,
        h,
        innerR,
        corner,
        actualW: w + cutoutAllowance * 2,
        actualH: h + cutoutAllowance * 2,
        actualInnerR: innerR + cutoutAllowance
      };

      validateCutoutInsideShape(newCutout, shapeData, "A kivágás");
      cutouts.push(newCutout);
    } else if (type === "ucutout") {
      const side = uSideInput.value;
      const offset = Number(uOffsetInput.value);
      const width = Number(uWidthInput.value);
      const depth = Number(uDepthInput.value);
      const radius = Number(uRadiusInput.value);

      validateUCutout(offset, width, depth, radius);

      const newCutout = {
        type,
        side,
        offset,
        width,
        depth,
        radius,
        actualOffset: offset - cutoutAllowance,
        actualWidth: width + cutoutAllowance * 2,
        actualDepth: depth + cutoutAllowance,
        actualRadius: radius + cutoutAllowance
      };

      validateCutoutInsideShape(newCutout, shapeData, "A kivágás");
      cutouts.push(newCutout);
    } else {
      const rectData = resolveRectCutoutInputs(shapeData);

      let actualX;
      let actualY;
      let actualW;
      let actualH;

      if (rectData.mode === "reference") {
        actualX = rectData.refLeft - cutoutAllowance;
        actualY = rectData.refBottom - cutoutAllowance;
        actualW = (rectData.refRight - rectData.refLeft) + cutoutAllowance * 2;
        actualH = (rectData.refTop - rectData.refBottom) + cutoutAllowance * 2;
      } else {
        actualX = rectData.x - cutoutAllowance;
        actualY = rectData.y - cutoutAllowance;
        actualW = rectData.w + cutoutAllowance * 2;
        actualH = rectData.h + cutoutAllowance * 2;
      }

      const newCutout = {
        type,
        inputMode: rectData.mode,
        x: rectData.x,
        y: rectData.y, 
        w: rectData.w,
        h: rectData.h,
        r: rectData.r,
        leftGap: rectData.leftGap,
        rightGap: rectData.rightGap,
        bottomGap: rectData.bottomGap,
        topGap: rectData.topGap,
        refLeft: rectData.refLeft,
        refRight: rectData.refRight,
        refBottom: rectData.refBottom,
        refTop: rectData.refTop,
        actualX,
        actualY,
        actualW,
        actualH,
        actualR: rectData.r + cutoutAllowance
      };

      validateCutoutInsideShape(newCutout, shapeData, "A kivágás");
      cutouts.push(newCutout);
    }
  } catch (error) {
    setStatus(error.message, true);
    return;
  }

  renderCutoutList();
  drawScene();
});

canvas.addEventListener("wheel", (event) => {
  event.preventDefault();

  const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
  viewZoom *= zoomFactor;

  viewZoom = Math.max(0.3, Math.min(viewZoom, 5));

  drawScene();
});

canvas.addEventListener("mousedown", (event) => {
  isPanning = true;
  panStartX = event.clientX - viewPanX;
  panStartY = event.clientY - viewPanY;
  canvas.style.cursor = "grabbing";
});

canvas.addEventListener("mousemove", (event) => {
  if (!isPanning) return;

  viewPanX = event.clientX - panStartX;
  viewPanY = panStartY - event.clientY;

  drawScene();
});

canvas.addEventListener("mouseup", () => {
  isPanning = false;
  canvas.style.cursor = "default";
});

canvas.addEventListener("mouseleave", () => {
  isPanning = false;
  canvas.style.cursor = "default";
});

canvas.addEventListener("dblclick", () => {
  viewZoom = 1;
  viewPanX = 0;
  viewPanY = 0;
  drawScene();
});

updateShapeFields();
updateTrapModeFields();
updateCutoutFields();
renderHoleList();
renderCutoutList();
drawScene();
