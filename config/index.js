import { version } from "../package.json";

// ?? 🤔 ?? --> https://en.freesewing.dev/packages/core/config

export default {
  name: "penelope",
  version,
  design: "woutervdub",
  code: "woutervdub",
  department: "womenswear",
  type: "pattern",
  difficulty: 3,
  tags: [
    "freesewing",
    "design",
    "diy",
    "fashion",
    "made to measure",
    "parametric design",
    "pattern",
    "sewing",
    "sewing pattern"
  ],
  optionGroups: {
    fit: ["size"]
  },
  measurements: [
    "naturalWaist",
    "hipsCircumference",
    "seatCircumference",
    "naturalWaistToHip",
    "naturalWaistToSeat",
    "naturalWaistToKnee"
  ],
  dependencies: {},
  inject: {},
  hide: [],
  parts: ["front" /*, "back", "waistBand"*/],
  options: {
    lengthBonus: { pct: 0, min: -50, max: 50 },
    hemBonus: { pct: 0, min: -35, max: 0 },
    backVent: { bool: false },
    backVentLength: { pct: 10, min: 5, max: 70 },
    waistBand: { bool: true },
    waistBandWidth: { pct: 5, min: 5, max: 15 },
    zipperLocation: { dflt: "backSeam", list: ["backSeam", "sideSeam"] },
    nrOfDarts: { count: 2, min: 1, max: 2 },

    seatEase: { pct: 5, min: 0, max: 10 },
    waistEase: { pct: 5, min: 0, max: 10 },
    waistSideSeamRaise: { pct: 0, min: 0, max: 10 },
    backDartDepthFactor: { pct: 50, min: 35, max: 70 },
    frontDartDepthFactor: { pct: 45, min: 30, max: 65 },
    dartToSideSeamFactor: { pct: 50, min: 30, max: 70 }
  }
};
