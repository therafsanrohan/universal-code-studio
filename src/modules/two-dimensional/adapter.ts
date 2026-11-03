import bwipjs from 'bwip-js';

export type TwoDimSymbology = 'datamatrix' | 'pdf417' | 'azteccode' | 'maxicode';

export interface TwoDimOptions {
  bcid: TwoDimSymbology;
  text: string;
  scale?: number;
  padding?: number;
}

export function generate2DSymbolSvg(options: TwoDimOptions): string {
  // @ts-expect-error bwip-js export signature
  return bwipjs.toSVG({
    bcid: options.bcid,
    text: options.text,
    scale: options.scale || 3,
    padding: options.padding ?? 10,
  });
}
