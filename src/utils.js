function dartCalcFront( options, seatWaistDiff, nrOfDarts )
{
    return(
        ((options.dartMinimumWidth + 
          (
            (max(
              min(seatWaistDiff, options.dartMaximumDifference), 
              options.dartMinimumDifference) 
            -options.dartMinimumDifference) /4)) /nrOfDarts)
        *(.5 +options.dartToSideSeamFactor)
    );
}

function dartCalcBack( options, seatWaistDiff, nrOfDarts )
{
    return(
        ((options.dartMinimumWidth + 
          (seatWaistDiff -options.dartBackControl1 -((seatWaistDiff -options.dartBackControl1)/options.dartBackControl2)) /options.dartBackControl3)/nrOfDarts)
        *(.5 +options.dartToSideSeamFactor)
    );
}

function dartCalc( options, seat, seatEase, waist, waistEase )
{
    seat  += seatEase;
    waist += waistEase;
    seatWaistDiff = max( seat - waist, 0 );
    options.seatWaistDiff = seatWaistDiff;
    
    nrOfDarts = options.nrOfDarts;

    frontDartSize = dartCalcFront( options, seatWaistDiff, nrOfDarts );

    // If the front darts are too small and we have more than one, remove one.
    if( frontDartSize <= options.dartMinimumWidth *nrOfDarts && nrOfDarts > 1 ) {
        nrOfDarts --;
        frontDartSize = dartCalcFront( seatWaistDiff, nrOfDarts );
    }

    // See if the dart created by the side seam becomes too small:
    if( ((seatWaistDiff/4) -frontDartSize) < options.dartSideMinimum ) {
        frontDartSize = 0;
    }
//        if( seatWaistDiff/4 -frontDartSize < options.dartSideMinimum || frontDartSize < options.dartMinimumWidth *nrOfDarts ) {
//            nrOfDarts = 1;
//        }

    backDartSize = dartCalcBack( seatWaistDiff, nrOfDarts );
    // If the back darts are too small and we have more than one, remove one.
    if( backDartSize < options.dartMinimumWidth *nrOfDarts && nrOfDarts > 1 )
    {
        nrOfDarts = 1;
        frontDartSize = dartCalcFront( options, seatWaistDiff, nrOfDarts );
        backDartSize  = dartCalcBack(  options, seatWaistDiff, nrOfDarts );
    }
    
    options.frontDartSize = frontDartSize;
    options.backDartSize = backDartSize;
    options.nrOfDarts = nrOfDarts;
}
