declare module 'pdf-parse/lib/pdf-parse.js' {
  import { Buffer } from 'buffer';
  interface PDFInfo {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
    text: string;
  }

  function pdfParse(dataBuffer: Buffer): Promise<PDFInfo>;
  export = pdfParse;
}
