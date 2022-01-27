import express from "express"
import multer from "multer"
import { saveAuthorAvatar, saveBlogPostCover } from "../../lib/fs-tools.js"

const filesRouter = express.Router()

// for avatar
// filesRouter.post("/uploadSingleAvatar", multer().single("avatar"), async (req, res, next) => {
//   try {
//     console.log("FILE: ", req.file)
//     await saveAuthorAvatar(req.file.originalname, req.file.buffer)
//     res.send("author's avatar added")
//   } catch (error) {
//     next(error)
//   }
// })


// for cover picture
// filesRouter.post("/uploadSingleCover", multer().single("cover"), async (req, res, next) =>{
//     try {
//         await saveBlogPostCover(req.file.originalname, req.file.buffer)
//         res.send("cover photo added")
//     } catch (error) {
        
//     }
//     })

export default filesRouter