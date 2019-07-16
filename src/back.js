import { BuildMainShape } from "./shape";

export default function(part) {
  let frontPart = false;

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

  BuildMainShape( part, false );

  if( options.backVent == true ) {
    // I don't care what you're trying to create, the vent will not go higher than your hips. 
    let backVentLength = Math.min( store.get("skirtLength") -measurements.naturalWaistToHip, (options.backVentLength * store.get("skirtLength")));
    console.log( {backVentLength: backVentLength, skirtLength: store.get("skirtLength"), OptionsBackVentLength: options.backVentLength});

    points.vLeg = points.lLeg.shift( 180, options.backVentWidth );
    points.vHem = points.lHem.shift( 180, options.backVentWidth );
    points.vTop = points.vLeg.shift( 90, backVentLength );
    points.lVent = points.vTop.shift( 0, options.backVentWidth ).shift( 90, options.backVentWidth );

    paths.vent = new Path()
      .move( points.lVent )
      .line( points.vTop )
      .line( points.vLeg )
      .line( points.vHem );
    paths.vent.render = false;

    paths.leftSide = new Path()
      .move(points.lWaist)
      .line(points.lVent)
      .join( paths.vent );
    paths.leftSide.render = false;

    paths.hem = paths.hem.line( points.vLeg );

  }

  paths.seam = paths.leftSide
    .clone()
    .join( paths.bottom )
    .join( paths.sideSeam )
    .join( paths.waist )
    .attr("class", "fabric");


  // Complete?
  if (complete) {
    macro( "grainline", { from: points.grainlineTop, to: points.grainlineBottom });

    snippets.logo = new Snippet( "logo", points.logoAnchor );

    if( options.backVent == false && options.zipperLocation != 'backSeam') {
      macro( "cutonfold", {
        from: points.lWaist,
        to: points.lLeg,
        margin: 5,
        offset: 10
      });
      macro( "title", {
        at: points.titleAnchor,
        title: '1x ' +'cutOnFold' +' ' +'fromFabric'
      });
    } else {
      macro( "title", {
        at: points.titleAnchor,
        title: '2x ' +'fromFabric'
      });
    }

    if (sa) {
      if( options.backVent || options.zipperLocation == 'backSeam') {
        paths.sa = paths.leftSide
          .clone()
          .join( paths.bottom )
          .join( paths.sideSeam )
          .join( paths.waistSA )
          .line( points.lWaist )
          .close()
          .offset(sa)
          .attr("class", "fabric sa");
      } else {
        paths.sa = new Path()
          .move( points.lHem )
          .join( paths.bottom
            .join( paths.sideSeam )
            .join( paths.waistSA )
            .offset(sa)
          )
          .line( points.lWaist )
          .attr("class", "fabric sa");
      }
    }
  }

  if( paperless ) {
    if( options.backVent ) {
      macro( "hd", {
        from: points.vHem,
        to: points.rHem,
        y: points.rHem.y -options.paperlessOffset
      });
      macro( "hd", {
        from: points.vTop,
        to: points.lVent,
        y: points.vTop.y
      });

      macro( "vd", {
        from: points.lSeat,
        to: points.lVent,
        x: points.lWaist.x -options.paperlessOffset
      });
      macro( "vd", {
        from: points.lVent,
        to: points.vTop,
        x: points.lVent.x
      });


    } else {
      macro( "hd", {
        from: points.lHem,
        to: points.rHem,
        y: points.rHem.y -options.paperlessOffset
      });
    }
  }

  
  return part;
}
 