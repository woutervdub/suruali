import freesewing from "@freesewing/core";
import plugins from "@freesewing/plugin-bundle";
import config from "../config";
import draftBase from "./base";
//import draftBack from "./back";
//import draftWaistband from "./waistband";

// Create new design
const Pattern = new freesewing.Design(config, plugins);

// Attach the draft methods to the prototype
Pattern.prototype.draftBase = draftBase;
//Pattern.prototype.draftBack = draftBack;
//Pattern.prototype.draftWaistband = draftWaistband;

export default Pattern;
