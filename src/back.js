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


  return part;
}
 