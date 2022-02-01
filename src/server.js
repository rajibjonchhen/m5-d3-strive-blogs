import express from 'express'
import listEndpoints from 'express-list-endpoints'
import blogsRouter from './service/blogs/index.js'
import authorsRouter from './service/authors/index.js'
// import filesRouter from './service/files/index.js'
import { join, dirname } from "path";

import cors from 'cors'
import createHttpError from "http-errors"
import { badRequestHandler, unauthorizedHandler, notFoundHandler, genericErrorHandler } from './service/errorHandler.js'

const server = express()
const port = process.env.PORT || 3001
console.log(process.env.PORT)
const publicFolderPath = join(process.cwd(), "./public")

const whiteListOrigins = [process.env.FE_DEV_URL, process.env.FE_PROD_URL]

console.table(whiteListOrigins)

server.use(cors({origin: function(origin,next){
    if(!origin || whiteListOrigins.IndexOf(origin) !== -1){
        next(null, true)
    } else{
        next(new Error('cor error'))
    }
}}))

server.use(express.json())
server.use(express.static(publicFolderPath))
console.table(listEndpoints(server))

server.use("/blogs",blogsRouter)
server.use("/authors",authorsRouter)
// server.use("/files", filesRouter)

server.use(badRequestHandler)
server.use(unauthorizedHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

server.listen(port,() =>{
console.log(`server is running in ${port}`)
})