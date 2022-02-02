import PdfPrinter from "pdfmake"





export const getPDFReadableStream = post => {
//    const fonts = {
//         Roboto: {
//           normal: 'Roboto-Regular.ttf',
//           bold: 'Roboto-Medium.ttf',
//           italics: 'Roboto-Italic.ttf',
//           bolditalics: 'Roboto-MediumItalic.ttf'
//         }
//       };

  const printer = new PdfPrinter(fonts)

  const docDefinition = {
    content: [
      {
        text: post.title,
        style: "header",
      },
      {
        image: post.cover,
        width: 150
    },
      
      {
          text: post.content,
          style: ["quote", "small"],
        },
        {
            text: "Comments",
            style: "subheader",
          },
          `${post.comment}`
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
  }

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition, {})
  pdfReadableStream.end()

  return pdfReadableStream
}
