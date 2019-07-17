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

  let waistEase = options.waistEase;
  let waist = measurements.naturalWaist;
  waist += waistEase;

  points.TL = new Point(0, 0);
  points.BL = new Point(0, waist / 2 + options.waistBandOverlap);
  points.TR = new Point(options.waistBandWidth, 0);
  points.BR = new Point(
    options.waistBandWidth,
    waist / 2 + options.waistBandOverlap
  );

  points.titleAnchor = new Point(options.waistBandWidth / 2, waist / 6);
  points.logoAnchor = new Point(options.waistBandWidth / 2, waist / 3);

  paths.outline = new Path()
    .move(points.TL)
    .line(points.BL)
    .line(points.BR)
    .line(points.TR)
    .line(points.TL)
    .close()
    .attr("class", "fabric");

  // Complete?
  if (complete) {
    macro("cutonfold", {
      from: points.TR,
      to: points.TL,
      margin: 15,
      offset: 15,
      grainline: true
    });

    snippets.logo = new Snippet("logo", points.logoAnchor);

    macro("title", {
      at: points.titleAnchor,
      title: "1x " + "fromFabric"
    });

    if (sa) {
      paths.sa = new Path()
        .move(points.TL)
        .join(
          new Path()
            .move(points.TL)
            .line(points.BL)
            .line(points.BR)
            .line(points.TR)
            .offset(sa)
        )
        .line(points.TR)
        .attr("class", "fabric sa");
    }
  }

  if (paperless) {
  }

  return part;
}
