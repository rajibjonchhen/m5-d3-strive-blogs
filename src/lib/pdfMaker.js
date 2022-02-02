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

  let avatarPart = {};
  if (blog.author.avatar) {
    const response = await axios.get(blog.author.avatar, {
      responseType: "arraybuffer",
    });
    const avatarURLParts = blog.author.avatar.split("/");
    const fileName = avatarURLParts[blogCoverURLParts.length - 1];
    const [id, extension] = fileName.split(".");
    const base64 = response.data.toString("base64");
    const base64Image = `data:image/${extension};base64,${base64}`;
   avatarPart = { image: base64Image, width: 50, margin: [0, 0, 0, 40] };
  }

  const docDefinition = {
    content: [
      imagePart,
      { text: blog.title, fontSize: 20, bold: true, margin: [0, 0, 0, 40] },
      { text: striptags(blog.content), lineHeight: 2 },
    
        avatarPart,
        { text:`${blog.comments[0].commentedAt}`, lineHeight: 2 , fontSize: 20, bold: true, margin: [0, 0, 0, 40] },
        { text:`${blog.comments[0].comment} ${blog.comments[0].rate}`, lineHeight: 2 },
        
        { text:`${blog.comments[1].commentedAt}`, lineHeight: 2 , fontSize: 20, bold: true, margin: [0, 0, 0, 40] },
        { text:`${blog.comments[1].comment} ${blog.comments[0].rate}`, lineHeight: 2 },
        
    ],
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  return pdfDoc;
};
