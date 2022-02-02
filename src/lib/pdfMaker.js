import PdfPrinter from "pdfmake"
import axios from "axios";




export const getPDFReadableStream = async (post) => {
   const fonts = {
    Helvetica: {
        normal: "Helvetica",
        bold: "Helvetica-Bold",
        italics: "Helvetica-Italics",
      },
      };

  const printer = new PdfPrinter(fonts)

  let imagePart = {};

  if (blog.cover) {
    const response = await axios.get(blog.cover, {
      responseType: "arraybuffer",
    });
    const blogCoverURLParts = blog.cover.split("/");
    const fileName = blogCoverURLParts[blogCoverURLParts.length - 1];
    const [id, extension] = fileName.split(".");
    const base64 = response.data.toString("base64");
    const base64Image = `data:image/${extension};base64,${base64}`;
    imagePart = { image: base64Image, width: 500, margin: [0, 0, 0, 40] };
  }

  const docDefinition = {
    content: [
      {
        text: post.title,
        style: "header",
      },
      imagePart,
      
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
    defaultStyle: {
        font: "Helvetica",
      },
  }

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition, {})
  pdfReadableStream.end()

  return pdfReadableStream
}
