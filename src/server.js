import express from 'express'
import listEndpoints from 'express-list-endpoints'
import blogsRouter from './service/blogs/index.js'
import cors from 'cors'


const server = express()
const port = 3001

server.use(express.json())
server.use(cors())

console.table(listEndpoints(server))

server.use("/blogs",blogsRouter)

server.listen(port,() =>{
console.log(`server is running in ${port}`)
})