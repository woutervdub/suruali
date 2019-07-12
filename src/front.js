import { BuildMainShape } from "./shape";

export default function(part) {
  let frontPart = true;

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

  BuildMainShape( part, true );


  return part;
}
 