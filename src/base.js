function addDart(
  part,
  from,
  fromAP,
  to,
  toAP,
  fractionCP,
  dartDistance,
  dartWidth,
  dartDepth,
  targetLength
) {
  let factor = 0.99;
  let delta = 1;
  let iteration = 0;
  let distance = 0;
  let curveLength = 0;

  let dartAngle = Math.asin(dartWidth / 2 / dartDepth) * (180 / Math.PI);

  let leftCP = null;
  let rightCP = null;
  let targetPoint = null;
  let curve = null;
  let dartBottom = null;
  let dartTop = null;
  let dartLeft = null;
  let dartLeftCP = null;
  let dartRight = null;
  let dartRightCP = null;
  let dartCurveLeft = null;
  let dartCurveRight = null;

  do {
    if (delta < -1) {
      factor *= 0.9995;
    } else if (delta > 1) {
      factor *= 1.01;
    }

    distance = (targetLength + dartWidth) * factor;

    rightCP = from.shift(from.angle(fromAP) - 90, fractionCP * distance);

    targetPoint = from.shiftTowards(to, distance);
    leftCP = targetPoint.shift(
      targetPoint.angle(toAP) + 90,
      fractionCP * distance
    );

    curve = new part.Path()
      .move(from)
      .curve(rightCP, leftCP, targetPoint)
      .setRender(false);

      dartTop = from.shiftTowards(to, dartDistance);
      dartBottom = dartTop.shift(dartTop.angle(from) - 90, dartDepth);
    dartLeft = dartBottom.shift(dartBottom.angle(dartTop) + dartAngle, dartDepth);
    dartRight = dartBottom.shift(dartBottom.angle(dartTop) - dartAngle, dartDepth);

    dartRightCP = dartRight.shift(
      dartRight.angle(dartBottom) + 90,
      fractionCP * distance
    );
    dartLeftCP = dartLeft.shift(
      dartLeft.angle(dartBottom) - 90,
      fractionCP * distance
    );

    dartCurveRight = new part.Path()
      .move(dartRight)
      .curve(dartRightCP, rightCP, from)
      .setRender(false);
    dartCurveLeft = new part.Path()
      .move(dartLeft)
      .curve(dartLeftCP, leftCP, targetPoint)
      .setRender(false);

    curveLength = dartCurveLeft.length() + dartCurveRight.length();

    delta = targetLength - curveLength;


    console.log({
      factor: factor,
      delta: delta,
      targetLength: targetLength,
      curveLength: curveLength
    });
  } while (Math.abs(delta) > 1 && iteration++ < 100);

  if (iteration >= 100) {
    throw "Too many iterations trying to make it fit!";
  }
  return {
    leftP: targetPoint,
    leftCP: leftCP,
    dartLeft: dartLeft,
    dartLeftCP: dartLeftCP,
    dartBottom: dartBottom,
    dartRightCP: dartRightCP,
    dartRight: dartRight,
    rightCP: rightCP,
    rightP: from
  };
}

export default function(part) {
  let {
    options,
    measurements,
    Point,
    Path,
    points,
    paths,
    Snippet,
    snippets,
    store,
    complete,
    sa,
    paperless,
    macro,
    utils
  } = part.shorthand();

  let length = measurements.naturalWaistToFloor;
  let sideSeamShift =
    measurements.hipsCircumference * options.sideSeamShiftFactor;

  let boxExtra = 150;
  points.boxTL = new Point(-boxExtra, -boxExtra);
  points.boxTR = new Point(
    measurements.hipsCircumference / 4 + boxExtra,
    -boxExtra
  );
  points.boxBL = new Point(-boxExtra, length + boxExtra);
  points.boxBR = new Point(
    measurements.hipsCircumference / 4 + boxExtra,
    length + boxExtra
  );
  paths.box = new Path()
    .move(points.boxTL)
    .line(points.boxBL)
    .line(points.boxBR)
    .line(points.boxTR)
    .line(points.boxTL)
    .attr("class", "fabric");

  points.W = new Point(0, 0);
  points.L = points.W.shift(270, length);
  points.C = points.W.shift(270, measurements.seatDepth);
  points.H = points.W.shift(270, (measurements.seatDepth / 3) * 2);
  points.K = points.W.shift(270, measurements.naturalWaistToKnee);
  points.W1 = points.W.shift(0, measurements.hipsCircumference / 4);
  points.C1 = points.C.shift(0, measurements.hipsCircumference / 4);
  points.H1 = points.H.shift(0, measurements.hipsCircumference / 4);
  points.H2 = points.H.shift(
    180,
    measurements.hipsCircumference / 20 - sideSeamShift
  );
  macro("hd", {
    from: points.H,
    to: points.H2
  });
  points.H3temp = points.H1.shift(
    180,
    measurements.hipsCircumference / 20 - sideSeamShift
  ).shift(90, measurements.hipsCircumference / 20 - sideSeamShift);
  points.H4 = points.H2.shiftTowards(
    points.H3temp,
    measurements.hipsCircumference / 4
  );

  points.C2 = points.C1.shift(0, measurements.hipsCircumference / 20);
  points.C0 = points.C.shiftFractionTowards(points.C2, 0.5);
  points.C3 = points.C2.shift(
    0,
    measurements.hipsCircumference / 20 - sideSeamShift
  );

  points.W0 = new Point(points.C0.x, points.W.y);
  points.K0 = new Point(points.C0.x, points.K.y);
  points.L0 = new Point(points.C0.x, points.L.y);

  points.CdownCP = points.C.shiftFractionTowards(points.K, 0.25);
  points.HupCP = points.H.shiftFractionTowards(points.W, 0.35);

  console.log(measurements.seatDepth * options.frontWaistLowerFactor);
  console.log(measurements.hipsCircumference - measurements.naturalWaist);
  console.log(measurements.hipsCircumference * options.frontWaistShiftFactor);

  points.W2 = points.W1.shift(
    270,
    measurements.seatDepth * options.frontWaistLowerFactor
  );
  if (
    measurements.hipsCircumference - measurements.naturalWaist >
    options.waistToHipdifference
  ) {
    points.W2 = points.W2.shift(
      180,
      measurements.hipsCircumference * options.frontWaistShiftFactor
    );
  }

  /*
  let waistFactor = 0.99;
  let wdelta = 1;
  let iteration = 0;
  let waistDistance = 0;
  let curveLength = 0;

  let dartAngle =
    Math.asin(options.frontDartWidth / 2 / options.frontDartDepth) *
    (180 / Math.PI);

  do {
    if (wdelta < -1) {
      waistFactor *= 0.9995;
    } else if (wdelta > 1) {
      waistFactor *= 1.01;
    }

    waistDistance =
      (measurements.naturalWaist / 4 + options.frontDartWidth) * waistFactor;

    points.W2leftCP = points.W2.shift(
      points.W2.angle(points.H1) - 90,
      options.waistCPfraction * waistDistance
    );

    points.W3 = points.W2.shiftTowards(points.W, waistDistance);
    points.W3rightCP = points.W3.shift(
      points.W3.angle(points.H) + 90,
      options.waistCPfraction * waistDistance
    );

    paths.curve = new Path()
      .move(points.W2)
      .curve(points.W2leftCP, points.W3rightCP, points.W3)
      .attr("class", "lining stroke-xs");

    points.dartBottom = paths.curve
      .intersectsX(points.W0.x)[0]
      .shiftTowards(points.C0, options.frontDartDepth);
    points.dartLeft = points.dartBottom.shift(
      90 + dartAngle,
      options.frontDartDepth
    );
    points.dartRight = points.dartBottom.shift(
      90 - dartAngle,
      options.frontDartDepth
    );

    points.dartRightCP = points.dartRight.shift(
      points.dartRight.angle(points.dartBottom) + 90,
      options.waistCPfraction * waistDistance
    );
    points.dartLeftCP = points.dartLeft.shift(
      points.dartLeft.angle(points.dartBottom) - 90,
      options.waistCPfraction * waistDistance
    );

    paths.dartCurveRight = new Path()
      .move(points.dartRight)
      .curve(points.dartRightCP, points.W2leftCP, points.W2)
      .attr("class", "lining interfacing");
    paths.dartCurveLeft = new Path()
      .move(points.dartLeft)
      .curve(points.dartLeftCP, points.W3rightCP, points.W3)
      .attr("class", "lining interfacing");

    curveLength = paths.dartCurveLeft.length() + paths.dartCurveRight.length();

    wdelta = measurements.naturalWaist / 4 - curveLength;
  } while (Math.abs(wdelta) > 1 && iteration++ < 100);

  if (iteration >= 100) {
    throw "Too many iterations trying to make it fit!";
  }
*/

let frontDartCurve = addDart(
  part,
  points.W2,
  points.H1,
  points.W,
  points.H,
  options.waistCPfraction,
  (points.temp = utils.linesIntersect(
    points.W,
    points.W2,
    points.W0,
    points.C0
  )).dist(points.W2),
  options.frontDartWidth,
  options.frontDartDepth,
  measurements.naturalWaist / 4
);

points.W3 = frontDartCurve.leftP;
  points.W3rightCP = frontDartCurve.leftCP;
  points.frontDartLeft = frontDartCurve.dartLeft;
  points.frontDartLeftCP = frontDartCurve.dartLeftCP;
  points.frontDartBottom = frontDartCurve.dartBottom;
  points.frontDartRightCP = frontDartCurve.dartRightCP;
  points.frontDartRight = frontDartCurve.dartRight;
  points.W2leftCP = frontDartCurve.rightCP;

  points.H1downCP = points.H1.shiftTowards(
    points.W2,
    points.H1.dist(points.W2) * options.crotchCPDownFactor * -1
  );

  points.L1 = points.L0.shift(180, options.hemLength / 4 - sideSeamShift);
  points.L3 = points.L0.shift(180, options.hemLength / 4 + sideSeamShift);
  points.L2 = points.L0.shift(0, options.hemLength / 4 - sideSeamShift);
  points.L4 = points.L0.shift(0, options.hemLength / 4 + sideSeamShift);

  points.K1temp = new Path()
    .move(points.H)
    .line(points.L1)
    .intersectsY(points.K0.y)[0];
  points.K1 = points.K1temp.shift(
    0,
    options.kneeReductionFactor * points.K0.dist(points.K1temp)
  );
  points.K3 = points.K1temp.shift(
    180,
    options.kneeReductionFactor * points.K0.dist(points.K1temp)
  );
  points.K2 = points.K0.shift(0, points.K0.dist(points.K1));
  points.K4 = points.K0.shift(0, points.K0.dist(points.K3));

  points.K4upCP = points.K4.shiftTowards(
    points.L4,
    (-1 * points.K4.dist(points.C3)) / 1.5
  );

  let waistFactor = 0.99;
  let wdelta = 1;
  let iteration = 0;
  let backDistance = 0;
  let curveLength = 0;
  let frontDistance = new Path()
    .move(points.L2)
    .curve(points.K2, points.K2, points.C2)
    .length();

  let L4K4distance = points.L4.dist(points.K4);

  do {
    if (wdelta < -1) {
      waistFactor *= 0.9995;
    } else if (wdelta > 1) {
      waistFactor *= 1.01;
    }

    points.C4 = points.K4.shiftTowards(
      points.C3,
      (frontDistance - L4K4distance) * waistFactor
    );

    backDistance = new Path()
      .move(points.L4)
      .line(points.K4)
      .curve(points.K4upCP, points.C4, points.C4)
      .length();

    wdelta = frontDistance - backDistance;
    console.log({
      waistFactor: waistFactor,
      wdelta: wdelta,
      backDistance: backDistance,
      frontDistance: frontDistance
    });
  } while (Math.abs(wdelta) > 1 && iteration++ < 100);

  if (iteration >= 100) {
    throw "Too many iterations trying to make it fit!";
  }

  let HW3length = new Path()
    .move(points.W3)
    .curve(points.W3, points.HupCP, points.H)
    .length();

  console.log("HW3length", HW3length);

  points.W4 = points.H2.shiftTowards(points.K3, -1 * HW3length);

  points.W5temp1 = points.C1.shiftTowards(points.H4, 1000);
  points.W5temp2 = points.W4.shift(points.W4.angle(points.H2) + 90, 1000);

  points.W5 = utils.linesIntersect(
    points.C1,
    points.W5temp1,
    points.W4,
    points.W5temp2
  );

  points.C2leftCP = points.C2.shift(
    points.C2.angle(points.K2) - 90,
    points.C2.dist(points.C1) * options.crotchCPLeftFactor
  );

  paths.dart = new Path()
    .move(points.W2)
    .curve(points.W2leftCP,points.frontDartRightCP,points.frontDartRight)
    .line(points.frontDartBottom)
    .line(points.frontDartLeft)
    .curve(points.frontDartLeftCP,points.W3rightCP,points.W3)
    .attr("class", "interfacing");
  paths.leftSide = new Path()
    .move(points.W3)
    .curve(points.W3, points.HupCP, points.H)
    .curve(points.CdownCP, points.K1, points.L1)
    .attr("class", "interfacing");

  paths.righttSide = new Path()
    .move(points.L1)
    .line(points.L2)
    .curve(points.K2, points.K2, points.C2)
    .attr("class", "interfacing");
  //points.K1upCP = points.K1.

  paths.Crotch = new Path()
    .move(points.C2)
    .curve(points.C2leftCP, points.H1downCP, points.H1)
    .line(points.W2)
    .attr("class", "interfacing");

  return part;
}
