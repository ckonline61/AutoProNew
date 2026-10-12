declare module 'pdfkit' {
  interface PDFDocumentOptions {
    size?: string | [number, number];
    margin?: number;
    margins?: { top: number; bottom: number; left: number; right: number };
    layout?: 'portrait' | 'landscape';
    info?: {
      Title?: string;
      Author?: string;
      Subject?: string;
      Keywords?: string;
      CreationDate?: Date;
    };
    [key: string]: unknown;
  }

  interface TextOptions {
    align?: 'left' | 'center' | 'right' | 'justify';
    width?: number;
    height?: number;
    lineBreak?: boolean;
    continued?: boolean;
    underline?: boolean;
    link?: string;
    [key: string]: unknown;
  }

  class PDFDocument {
    constructor(options?: PDFDocumentOptions);
    x: number;
    y: number;
    page: { width: number; height: number };
    fontSize(size: number): this;
    font(name: string): this;
    text(text: string, x?: number, y?: number, options?: TextOptions): this;
    text(text: string, options?: TextOptions): this;
    moveDown(lines?: number): this;
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;
    stroke(color?: string): this;
    fill(color?: string): this;
    rect(x: number, y: number, w: number, h: number): this;
    fillColor(color: string): this;
    strokeColor(color: string): this;
    lineWidth(width: number): this;
    addPage(options?: PDFDocumentOptions): this;
    end(): void;
    pipe<T extends NodeJS.WritableStream>(destination: T): T;
    on(event: 'data', listener: (chunk: Buffer) => void): this;
    on(event: 'end', listener: () => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
  }

  export = PDFDocument;
}
