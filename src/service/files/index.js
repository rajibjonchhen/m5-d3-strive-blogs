import express from "express"
import {pipeline} from "stream"
import json2csv from "json2csv"
import {createGzip} from "zlib"
import { getPDFReadableStream, generatePDFAsync } from "../../lib/pdfMaker.js"
import { getBlogsReadableStream } from "../../lib/fs-tools.js"

const filesRouter = express.Router()

filesRouter.get("/downloadPdf",async(req,res,next)=>{

    try {
        res.setHeader("Content-Disposition","attachment=test.pdf")
        const source = getPDFReadableStream("My Blogs")
        const destination = res
        pipeline(source,destination, err => {
            if(err) next(err)
        })
    } catch (error) {
        next(error)
    }
})

filesRouter.get("/downloadCSV", (req, res, next) => {
    try {  
    res.setHeader("Content-Disposition", "attachment; filename=books.csv")
    const source = getBlogsReadableStream()
    const transform = new json2csv.Transform({ fields: ["asin", "title", "price", "category"] })
    const destination = res

    pipeline(source, transform, destination, err => {
    if (err) next(err)
    })
} catch (error) {
    next(error)
}
})

filesRouter.get("/asyncPDF", async (req, res, next) => {
try {
    const path = await generatePDFAsync()
    res.send({ path })
} catch (error) {
    next(error)
}
})




export default filesRouter