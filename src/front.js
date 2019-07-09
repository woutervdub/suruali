export default function(part) {
  let {
    options,
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

  let skirtLength = measurements.naturalWaistToKnee +options.lengthBonus;
  let waistEase = options.waistEase;
  let seatEase  = options.seatEase;
  
  let dartDepthFactor = options.DartDepthFactor;
  
  let waist = measurements.naturalWaist;
  let seat  = measurements.seatCircumference > waist ? measurements.seatCircumference : waist;
  let hip   = measurements.hipsCircumference > waist ? measurements.hipsCircumference : waist;
  
  dartCalc(options, seat, seatEase, waist, waistEase);

  let dartSize = options.frontDartSize;
  let nrOfDarts = options.nrOfDarts;
  
  // FIX!
  let sideSeamShift = -6;

  seat  += seatEase;
  waist += waistEase;
  
  let sideSeam = (seat/4) +sideSeamShift;
  let hipSeam  = (hip /4) +sideSeamShift;

  points.lWaist = new Point(0, 0);
  points.lLeg = new Point( 0, skirtLength);
  points.rWaist = new Point( sideSeam, 0 );
  points.rLeg = new Point( sideSeam + options.hemBonus, skirtLength);

  points.lSeat = new Point(0, measurements.naturalWaistToSeat);
  points.rSeat = new Point(sideSeam, measurements.naturalWaistToSeat);
  points.rWaistCP = new Point( sideSeam, measurements.naturalWaistToSeat /3 );
  points.rSeatCP = new Point(sideSeam, (measurements.naturalWaistToSeat /3) *2 );
  //$p->addPoint('pC2d', $p->shift('pC2', 270, ($model->m('naturalWaistToSeat') - $model->m('naturalWaistToHip'))*(abs($this->o('hemBonus'))/HIP_CURVE_DIV_DOWN)));
  //$p->newPoint('pH',   $sideSeam, $model->m('naturalWaistToHip') -$this->o('waistSideSeamRise'));
  let waistFactor = 0.99;
  let sideFactor  = 0.97;
  let wdelta = 1;
  let sdelta = 1;
  let iteration = 0;
  let curve = null;

  //do {
      if(wdelta < -1) {
          waistFactor *= 0.9995;
      } else if(wdelta > 1){
          waistFactor *= 1.01;
      }
      if(sdelta < -1) {
          sideFactor *= 0.995;
      } else if(sdelta > 1){
          sideFactor *= 1.01;
      }
      points.pZ2t1 = points.lWaist.shift( 0, (waist/4)*waistFactor);
      points.pZ2t2 = points.pZ2t1.shift( 0, dartSize*nrOfDarts);
      points.pZ2 = points.pZ2t2.shift( 90, 16 * sideFactor);
      points.pA1c = points.lWaist.shift( 0, seat/12);
      points.pZ2c = points.pZ2.shift(  points.pZ2.angle(points.pA2c) -90, waist/16);

      curve = new Path().move( points.lWaist ).curve( points.pA1c, points.pZ2c, points.pZ2 );
      if( dartSize > 0 ) {
          curve = addDartToCurve( curve, (seat/4) /2.4, dartSize, measurements.naturalWaistToSeat * dartDepthFactor );
      }
      waistLength = curve.length();
      /*
      if( nrOfDarts > 1 ) {
  $this->addDartToCurve( $p, 'Dart_1_5', 'Dart_1_6', 'Dart_1_7', 'Dart_1_8', 32, $dartSize, $model->m('naturalWaistToSeat') * $dartDepthFactor * 0.80, 'Dart_2_' );
          $waistLength += $p->curveLen( 'Dart_2_1', 'Dart_2_2', 'Dart_2_3', 'Dart_2_4' );
          $waistLength += $p->curveLen( 'Dart_2_5', 'Dart_2_6', 'Dart_2_7', 'Dart_2_8' );
          $p->clonePoint( 'Dart_2_8', 'pTopRight' );
      } else {
          $waistLength += $p->curveLen( 'Dart_1_5', 'Dart_1_6', 'Dart_1_7', 'Dart_1_8' );
          $p->clonePoint( 'Dart_1_8', 'pTopRight' );
      }
      */
      wdelta = (waist/4) - waistLength;
      //if( part == 'front' ) {
          sdelta = 0;
      //} else {
      //    $sideSeamLength = $p->curveLen( 'pTopRight', 'pH', 'pH', 'pC2' );
      //    $sideSeamLength += $p->curveLen( 'pC2', 'pC2d', 'pB2', 'pB2' );
      //    $sdelta = $this->sideSeamLength - $sideSeamLength;
      //}
      //$this->msg("[$iteration] Delta is: $wdelta ($waistFactor) $sdelta ($sideFactor)");
  //} while ((abs(wdelta) > 1 || abs(sdelta) > 1) && iteration++ < 100);

/*

  if( iteration >= 100 ) {
      die("oh shit\n");
  }
  if( $part == 'front' ) {
      sideSeamLength = $p->curveLen( 'pTopRight', 'pH', 'pH', 'pC2' );
      sideSeamLength += $p->curveLen( 'pC2', 'pC2d', 'pB2', 'pB2' );
      $this->sideSeamLength = $sideSeamLength;
      $this->msg( "Front length: $sideSeamLength" );
  } else {
      $this->msg( "Back length: $sideSeamLength" );
  }
  $pathString .= 'Dart_1_1 C Dart_1_2 Dart_1_3 Dart_1_4 L Dart_1_Bottom L ';
  if( $this->v('nrOfDarts') > 1 ) {
      $pathString .= 'Dart_2_1 C Dart_2_2 Dart_2_3 Dart_2_4 L Dart_2_Bottom L ';
      $pathString .= 'Dart_2_5 C Dart_2_6 Dart_2_7 pTopRight ';
  } else {
      $pathString .= 'Dart_1_5 C Dart_1_6 Dart_1_7 pTopRight ';
  }
  $pathStringSA = str_replace( 'Dart_1_Bottom L ','', str_replace( 'Dart_2_Bottom L ','', $pathString . ' C pH pH pC2 C pC2d pB2 pB2'));
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


  let w = 500 * options.size;
  points.topLeft = new Point(0, 0);
  points.topRight = new Point(w, 0);
  points.bottomLeft = new Point(0, w / 2);
  points.bottomRight = new Point(w, w / 2);

  paths.seam = new Path()
    .move(points.topLeft)
    .line(points.bottomLeft)
    .line(points.bottomRight)
    .line(points.topRight)
    .line(points.topLeft)
    .close()
    .attr("class", "fabric");

  // Complete?
  if (complete) {
    points.logo = points.topLeft.shiftFractionTowards(points.bottomRight, 0.5);
    snippets.logo = new Snippet("logo", points.logo);
    points.text = points.logo
      .shift(-90, w / 8)
      .attr("data-text", "hello")
      .attr("data-text-class", "center");

    if (sa) {
      paths.sa = paths.seam.offset(sa).attr("class", "fabric sa");
    }
  }

  // Paperless?
  if (paperless) {
    macro("hd", {
      from: points.bottomLeft,
      to: points.bottomRight,
      y: points.bottomLeft.y + sa + 15
    });
    macro("vd", {
      from: points.bottomRight,
      to: points.topRight,
      x: points.topRight.x + sa + 15
    });
  }

  return part;
}
