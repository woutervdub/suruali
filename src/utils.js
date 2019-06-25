function dartCalcFront(options, seatWaistDiff, nrOfDarts) {
  return (
    ((options.dartMinimumWidth +
      (max(
        min(seatWaistDiff, options.dartMaximumDifference),
        options.dartMinimumDifference
      ) -
        options.dartMinimumDifference) /
        4) /
      nrOfDarts) *
    (0.5 + options.dartToSideSeamFactor)
  );
}

function dartCalcBack(options, seatWaistDiff, nrOfDarts) {
  return (
    ((options.dartMinimumWidth +
      (seatWaistDiff -
        options.dartBackControl1 -
        (seatWaistDiff - options.dartBackControl1) / options.dartBackControl2) /
        options.dartBackControl3) /
      nrOfDarts) *
    (0.5 + options.dartToSideSeamFactor)
  );
}

function dartCalc(options, seat, seatEase, waist, waistEase) {
  seat += seatEase;
  waist += waistEase;
  seatWaistDiff = max(seat - waist, 0);
  options.seatWaistDiff = seatWaistDiff;

  nrOfDarts = options.nrOfDarts;

  frontDartSize = dartCalcFront(options, seatWaistDiff, nrOfDarts);

  // If the front darts are too small and we have more than one, remove one.
  if (frontDartSize <= options.dartMinimumWidth * nrOfDarts && nrOfDarts > 1) {
    nrOfDarts--;
    frontDartSize = dartCalcFront(seatWaistDiff, nrOfDarts);
  }

  // See if the dart created by the side seam becomes too small:
  if (seatWaistDiff / 4 - frontDartSize < options.dartSideMinimum) {
    frontDartSize = 0;
  }
  //        if( seatWaistDiff/4 -frontDartSize < options.dartSideMinimum || frontDartSize < options.dartMinimumWidth *nrOfDarts ) {
  //            nrOfDarts = 1;
  //        }

  backDartSize = dartCalcBack(seatWaistDiff, nrOfDarts);
  // If the back darts are too small and we have more than one, remove one.
  if (backDartSize < options.dartMinimumWidth * nrOfDarts && nrOfDarts > 1) {
    nrOfDarts = 1;
    frontDartSize = dartCalcFront(options, seatWaistDiff, nrOfDarts);
    backDartSize = dartCalcBack(options, seatWaistDiff, nrOfDarts);
  }

  options.frontDartSize = frontDartSize;
  options.backDartSize = backDartSize;
  options.nrOfDarts = nrOfDarts;
}

/**
 * Method to add a dart onto a curveLen
 * The dart is added at an 90 degree angle with the curve for a certain depth and Width
 * @param part $p                   The part to which the points will be added
 * @param point $p1, $p2, $p3, $p4  The points defining the curve
 * @param float $distance           Distance from $p1 where the middle of the dart will be
 * @param float $dartSize1          The width of the dart opening at the curve
 * @param float $dartDepth          The depth of the dart
 * @param string $prefix            The prefix for the new points to be added
 *
 * @return nothing                  Adds points to the $part
 */
function addDartToCurve(curvePath, distance, dartSize, dartDepth) {
  let dartMiddle = curvePath.shiftAlong(distance);

  let curvePaths = curvePath.split(dartMiddle);
  let dartLeft = curvePaths[0].reverse().shiftAlong(dartSize / 2);
  let dartRight = curvePaths[1].shiftAlong(dartSize / 2);

  let dartBottom = dartMiddle.shift(dartLeft.angle(dartRight) - 90, dartDepth);

  let curvePathsLeft = curvePaths[0].split(dartLeft);
  let curvePathsRight = curvePaths[1].split(dartRight);

  let curveLeftOfDart = curvePathsLeft[0];
  let curveRightOfDart = curvePathsRight[1];

  let curveWithDart = new Path()
    .join(curveLeftOfDart)
    .line(dartBottom)
    .Line(dartRight)
    .join(curveRightOfDart);

  return( curveWithDart );
}

export { addDartToCurve, dartCalc };
