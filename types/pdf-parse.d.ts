declare module "pdf-parse" {
  interface PDFData {
    text: string
    numpages: number
    numrender: number
    info: Record<string, unknown>
    metadata: Record<string, unknown>
    version: string
  }

  function pdfParse(dataBuffer: Buffer): Promise<PDFData>

  export default pdfParse
}

declare module "pdf-parse/lib/pdf-parse.js" {
  import pdfParse from "pdf-parse"
  export default pdfParse
}
