import express from 'express'
import listEndpoints from 'express-list-endpoints'
import blogsRouter from './service/blogs/index.js'
import cors from 'cors'
import createHttpError from "http-errors"
import { badRequestHandler, unauthorizedHandler, notFoundHandler, genericErrorHandler } from './service/errorHandler.js'

const server = express()
const port = 3001

server.use(cors())

server.use(express.json())
console.table(listEndpoints(server))

server.use("/blogs",blogsRouter)

server.use(badRequestHandler)
server.use(unauthorizedHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

server.listen(port,() =>{
console.log(`server is running in ${port}`)
})