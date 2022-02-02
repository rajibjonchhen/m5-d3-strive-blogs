import PdfPrinter from "pdfmake"




export const getPDFReadableStream = data => {
  const fonts = {
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Italics",
    },
  }

  const printer = new PdfPrinter(fonts)

  const docDefinition = {
    content: [
      {
        text: data,
        style: "header",
      },
      `${data.title}`,
      {
          text: "Subheader 1 - using subheader style",
          style: "subheader",
        },
        
        `${data.content}`,
     
      {
        text: "It is possible to apply multiple styles, by passing an array. This paragraph uses two styles: quote and small. When multiple styles are provided, they are evaluated in the specified order which is important in case they define the same properties",
        style: ["quote", "small"],
      },
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
      },
      subheader: {
        fontSize: 15,
        bold: true,
      },
      quote: {
        italics: true,
      },
      small: {
        fontSize: 8,
      },
    },
    defaultStyle: {
      font: "Helvetica",
    },
  }

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition, {})
  pdfReadableStream.end()

  return pdfReadableStream
}
