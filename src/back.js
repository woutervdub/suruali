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
    let backVentLength = Math.min( v('skirtLength') -$model->m('naturalWaistToHip'), $this->o('backVentLength'));
/*
    $p->addPoint('pV1',    $p->shift('pB1',    180, 50));
    $p->addPoint('pV2',    $p->shift('pV1',     90, $backVentLength));
    $p->addPoint('pVtemp', $p->shift('pV2',      0, 50));
    $p->addPoint('pV3',    $p->shift('pVtemp',  90, 50));
    $p->addPoint('pHemLD', $p->shift('pV1',    270, $this->o('sa') +HEM_DEPTH));
    $p->addPoint('pHemLL', $p->shift('pHemLD', 180, $this->o('sa')));
    $p->addPoint('pHemLU', $p->shift('pHemLL',  90, $this->o('sa')));
    $pathString   .= ' C pH pH pC2 C pC2d pB2 pB2 L pB1 L pV1 L pV2 L pV3 L pC1 Z';
    $pathStringSA  = 'M pV1 L pV2 L pV3 L pC1 L' . str_replace( 'M', '', $pathStringSA );
    */
  }


  return part;
}
 