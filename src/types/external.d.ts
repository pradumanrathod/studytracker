declare module 'html-to-image' {
  export function toPng(node: HTMLElement, options?: any): Promise<string>;
  export function toJpeg(node: HTMLElement, options?: any): Promise<string>;
  export function toBlob(node: HTMLElement, options?: any): Promise<Blob | null>;
  export function toCanvas(node: HTMLElement, options?: any): Promise<HTMLCanvasElement>;
}

declare module 'html2canvas' {
  const html2canvas: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
  export default html2canvas;
}
