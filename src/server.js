import express from 'express'
import listEndpoints from 'express-list-endpoints'
import blogsRouter from './service/blogs/index.js'
import authorsRouter from './service/authors/index.js'
import filesRouter from './service/files/index.js'
// import filesRouter from './service/files/index.js'
import { join, dirname } from "path";
import morgan from "morgan";
import helmet from "helmet";
import cors from 'cors'
import createHttpError from "http-errors"
import { badRequestHandler, unauthorizedHandler, notFoundHandler, genericErrorHandler } from './service/errorHandler.js'

const server = express()
const port = process.env.PORT || 3001
console.log(process.env.PORT)

server.use(helmet());
server.use(morgan("tiny"));
const publicFolderPath = join(process.cwd(), "./public")

const whiteListOrigins = [process.env.FE_DEV_URL, process.env.FE_PROD_URL,process.env.CLOUDINARY_URL]
console.table(whiteListOrigins)

// server.use(cors())
server.use(cors({origin: function(origin,next){
    console.log(origin)
    if(!origin || whiteListOrigins.indexOf(origin) !== -1){
        next(null, true)
    } else{
        next(new Error('cor error'))
    }
}}))

server.use(express.json())
server.use(express.static(publicFolderPath))

server.use("/blogs",blogsRouter)
server.use("/authors",authorsRouter)
server.use("/files",filesRouter)
// server.use("/files", filesRouter)

server.use(badRequestHandler)
server.use(unauthorizedHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

console.table(listEndpoints(server))
server.listen(port,() =>{
console.log(`server is running in ${port}`)
})