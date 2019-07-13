import { addDartToCurve, dartCalc } from "./utils";

function BuildMainShape(part, frontPart) {
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
    macro
  } = part.shorthand();

  let skirtLength =
    measurements.naturalWaistToKnee + options.lengthBonus + options.hem;
  let waistEase = options.waistEase;
  let seatEase = options.seatEase;

  let dartDepthFactor = frontPart
    ? options.frontDartDepthFactor
    : options.backDartDepthFactor;

  let waist = measurements.naturalWaist;
  let seat =
    measurements.seatCircumference > waist
      ? measurements.seatCircumference
      : waist;
  let hip =
    measurements.hipsCircumference > waist
      ? measurements.hipsCircumference
      : waist;

  dartCalc(options, seat, seatEase, waist, waistEase);

  console.log(
    "seat: " +
      seat +
      " seatEase: " +
      seatEase +
      " waist: " +
      waist +
      " waistEase: " +
      waistEase
  );

  let nrOfDarts = options.nrOfDarts;
  let dartSize = options.frontDartSize;
  if (frontPart == false) {
    dartSize = options.backDartSize;
  }

  console.log("dartSize: " + dartSize + " nrOfDarts: " + nrOfDarts);

  // FIX! Not ant-man compatible
  let sideSeamShift = frontPart ? -6 : 6;

  seat += seatEase;
  waist += waistEase;

  let sideSeam = seat / 4 + sideSeamShift;
  let hipSeam = hip / 4 + sideSeamShift;

  points.lWaist = new Point(0, 0);
  points.lLeg = new Point(0, skirtLength);
  points.rWaistOriginal = new Point(sideSeam, 0);
  points.rLeg = new Point(sideSeam + options.hemBonus, skirtLength);

  let boxExtra = 30;
  points.boxTL = new Point(-boxExtra, -boxExtra);
  points.boxTR = new Point(sideSeam + options.hemBonus + boxExtra, -boxExtra);
  points.boxBL = new Point(-boxExtra, skirtLength + boxExtra);
  points.boxBR = new Point(
    sideSeam + options.hemBonus + boxExtra,
    skirtLength + boxExtra
  );
  paths.box = new Path()
    .move(points.boxTL)
    .line(points.boxBL)
    .line(points.boxBR)
    .line(points.boxTR)
    .line(points.boxTL)
    .attr("class", "fabric");

  points.lSeat = new Point(0, measurements.naturalWaistToSeat);
  points.rSeat = new Point(sideSeam, measurements.naturalWaistToSeat);
  points.rWaistCPdown = new Point(
    sideSeam,
    measurements.naturalWaistToSeat / 3
  );
  points.rSeatCP = new Point(
    sideSeam,
    (measurements.naturalWaistToSeat / 3) * 2
  );
  points.rLegCP = new Point( points.rSeat.shift( 270, (measurements.naturalWaistToSeat - measurements.naturalWaistToHip)*(Math.abs(options.hemBonus))/options.hipCurveDividerDown));
  //$p->newPoint('pH',   $sideSeam, $model->m('naturalWaistToHip') -$this->o('waistSideSeamRise'));
  let waistFactor = 0.99;
  let sideFactor = 0.97;
  let wdelta = 1;
  let sdelta = 1;
  let iteration = 0;
  let waistCurve = null;
  let waistPath = null;
  let waistPathSA = null;
  let waistLength = 0;
  let sideSeamPath = null;
  let sideSeamLength = 0;
  let curve1 = null;
  let curve2 = null;

  do {
    if (wdelta < -1) {
      waistFactor *= 0.9995;
    } else if (wdelta > 1) {
      waistFactor *= 1.01;
    }
    if (sdelta < -1) {
      sideFactor *= 0.995;
    } else if (sdelta > 1) {
      sideFactor *= 1.01;
    }
    points.rWaistTemp1 = points.lWaist.shift(0, (waist / 4) * waistFactor);
    points.rWaistTemp2 = points.rWaistTemp1.shift(0, dartSize * nrOfDarts);
    points.rWaist = points.rWaistTemp2.shift(90, 16 * sideFactor);
    points.lWaistCP = points.lWaist.shift(0, seat / 12);
    points.rWaistCPleft = points.rWaist.shift(
      points.rWaist.angle(points.rWaistCPdown) - 90,
      waist / 16
    );

    console.log(
      "rWaist: (" +
        points.rWaist.x.toString() +
        "," +
        points.rWaist.y.toString() +
        ") [" +
        iteration.toString() +
        "]"
    );

    waistCurve = new Path()
      .move(points.lWaist)
      .curve(points.lWaistCP, points.rWaistCPleft, points.rWaist);
    waistCurve.render = false;

    if (nrOfDarts > 0) {
      curve1 = addDartToCurve(
        part,
        waistCurve,
        seat / 4 / options.curvePlacement,
        dartSize,
        measurements.naturalWaistToSeat * dartDepthFactor
      );
      waistLength = curve1.left.length();
      if (nrOfDarts > 1) {
        curve2 = addDartToCurve(
          part,
          curve1.right,
          options.dart2offset,
          dartSize,
          measurements.naturalWaistToSeat *
            dartDepthFactor *
            options.dart2factor
        );
        waistLength += curve2.left.length();
        waistLength += curve2.right.length();
        waistPath = curve1.left.join(
          curve1.dart.join(curve2.left.join(curve2.dart.join(curve2.right)))
        );
        waistPathSA = curve1.left.join(curve2.left.join(curve2.right));
      } else {
        waistLength += curve1.right.length();
        waistPath = curve1.left.join(curve1.dart.join(curve1.right));
        waistPathSA = curve1.left.join(curve1.right);
      }
    } else {
      waistLength = waistCurve.length();
      waistPath = waistCurve;
      waistPathSA = waistCurve.clone();
    }

    sideSeamPath = new Path()
      .move(points.rLeg)
      .line(points.rSeat)
      .curve(points.rSeatCP, points.rWaistCPdown, points.rWaist);

    console.log( sideSeamPath );
    
    wdelta = waist / 4 - waistLength;

    if (frontPart) {
      sdelta = 0;
    } else {
      sideSeamLength = sideSeamPath.length();
      sdelta = store.get("sideSeamLength") - sideSeamLength;
    }
    console.log({
      iteration: iteration,
      wdelta: wdelta,
      waistFactor: waistFactor,
      sdelta: sdelta,
      sideFactor: sideFactor
    });
  } while ((Math.abs(wdelta) > 1 || Math.abs(sdelta) > 1) && iteration++ < 100);

  //paths.waist0 = waistCurveHelper.translate( 0, -10 ).attr('class', 'lining dashed');
  paths.waist1 = waistCurve.translate(0, 10).attr("class", "lining dashed");

  if (iteration >= 100) {
    throw "Too many iterations trying to make it fit!";
  }

  // Turn the path in the other direction, to comply with the counter-clockwise guideline
  waistPath = waistPath.reverse();

  if (frontPart) {
    sideSeamLength = sideSeamPath.length();
    store.set("sideSeamLength", sideSeamLength);
    console.log("Front sideseam length: " + sideSeamLength);
  } else {
    console.log("back sideseam length: " + sideSeamLength);
  }

  /*  
$p->addPoint('pHemRD', $p->shift('pB2',   270, $this->o('sa') +HEM_DEPTH));
$p->addPoint('pHemRR', $p->shift('pHemRD',   0, $this->o('sa')));
$p->addPoint('pHemRU', $p->shift('pHemRR', 90, $this->o('sa')));
if( $part == 'back' && $this->o('backVent') ) {
    // I don't care what you're trying to create, the vent will not go higher than your hips. 
    $backVentLength = min( $this->v('skirtLength') -$model->m('naturalWaistToHip'), $this->o('backVentLength'));
    $p->addPoint('pV1',    $p->shift('pB1',    180, 50));
    $p->addPoint('pV2',    $p->shift('pV1',     90, $backVentLength));
    $p->addPoint('pVtemp', $p->shift('pV2',      0, 50));
    $p->addPoint('pV3',    $p->shift('pVtemp',  90, 50));
    $p->addPoint('pHemLD', $p->shift('pV1',    270, $this->o('sa') +HEM_DEPTH));
    $p->addPoint('pHemLL', $p->shift('pHemLD', 180, $this->o('sa')));
    $p->addPoint('pHemLU', $p->shift('pHemLL',  90, $this->o('sa')));
    $pathString   .= ' C pH pH pC2 C pC2d pB2 pB2 L pB1 L pV1 L pV2 L pV3 L pC1 Z';
    $pathStringSA  = 'M pV1 L pV2 L pV3 L pC1 L' . str_replace( 'M', '', $pathStringSA );
} else {
    $p->addPoint('pHemLD', $p->shift('pB1',    270, $this->o('sa') +HEM_DEPTH));
    $p->addPoint('pHemLL', $p->shift('pHemLD', 180, $this->o('sa')));
    $p->addPoint('pHemLU', $p->shift('pHemLL',  90, $this->o('sa')));
    $pathString .= ' C pH pH pC2 C pC2d pB2 pB2 L pB1 L pC1 Z';
    if( $part == 'back' && $this->o('zipperLocation') == 'back' ) {
        $pathStringSA  = 'M pB1 L ' . str_replace( 'M', '', $pathStringSA ) . ' C pH pH pC2 C pC2d pB2 pB2 ';
    }
}
$p->newPath( 'outline', $pathString, ['class' => 'fabric']);
// Mark for sampler
$p->paths['outline']->setSample(true);
$p->newPath('outlineSA', $pathStringSA, ['class' => 'hidden']);
$p->paths['outlineSA']->setSample(false);
*/
  paths.bottom = new Path().move(points.lLeg).line(points.rLeg);
  paths.bottom.render = false;

  if (options.hem > 0) {
    paths.hem = paths.bottom
      .offset( -1 * options.hem)
      .attr("class", "fabric stroke-sm");
  }

  paths.seam = new Path()
    .move(points.lWaist)
    .line(points.lLeg)
    .line(points.rLeg)
    //.line(points.rWaistOriginal)
    .join(sideSeamPath)
    .join(waistPath)
    .attr("class", "fabric");
}

export { BuildMainShape };
