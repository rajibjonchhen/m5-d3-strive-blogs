import PdfPrinter from "pdfmake";
import striptags from "striptags";
import axios from "axios";
const fonts = {
  Roboto: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
};

const printer = new PdfPrinter(fonts);

export const generateBlogPDF = async (blog) => {
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
      imagePart,
      { text: blog.title, fontSize: 20, bold: true, margin: [0, 0, 0, 40] },
      { text: striptags(blog.content), lineHeight: 2 },
    ],
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  return pdfDoc;
};
// import PdfPrinter from "pdfmake"
// import axios from "axios";




// export const getPDFReadableStream = async (blog) => {
//    const fonts = {
//     Helvetica: {
//         normal: "Helvetica",
//         bold: "Helvetica-Bold",
//         italics: "Helvetica-Italics",
//       },
//       };

//   const printer = new PdfPrinter(fonts)

//   let imagePart = {};

//   if (blog.cover) {
//     const response = await axios.get(blog.cover, {
//       responseType: "arraybuffer",
//     });
//     const blogCoverURLParts = blog.cover.split("/");
//     const fileName = blogCoverURLParts[blogCoverURLParts.length - 1];
//     const [id, extension] = fileName.split(".");
//     const base64 = response.data.toString("base64");
//     const base64Image = `data:image/${extension};base64,${base64}`;
//     imagePart = { image: base64Image, width: 500, margin: [0, 0, 0, 40] };
//   }

//   const docDefinition = {
//     content: [
//       {
//         text: blog.title,
//         style: "header",
//       },
//       imagePart,
      
//       {
//           text: blog.content,
//           style: ["quote", "small"],
//         },
//         {
//             text: "Comments",
//             style: "subheader",
//           },
//           `${blog.comment}`
//     ],
//     styles: {
//       header: {
//         fontSize: 18,
//         bold: true,
//       },
//       subheader: {
//         fontSize: 15,
//         bold: true,
//       },
//       quote: {
//         italics: true,
//       },
//       small: {
//         fontSize: 8,
//       },
//     },
//     defaultStyle: {
//         font: "Helvetica",
//       },
//   }

//   const pdfReadableStream = printer.createPdfKitDocument(docDefinition, {})
//   pdfReadableStream.end()

//   return pdfReadableStream
// }
