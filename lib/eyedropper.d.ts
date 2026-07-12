// Type minimal de l'API EyeDropper (Chromium ; absente de la lib DOM TS).
// https://developer.mozilla.org/docs/Web/API/EyeDropper
interface EyeDropperResult {
  sRGBHex: string;
}
interface EyeDropper {
  open(options?: { signal?: AbortSignal }): Promise<EyeDropperResult>;
}
interface EyeDropperConstructor {
  new (): EyeDropper;
}
interface Window {
  EyeDropper?: EyeDropperConstructor;
}
