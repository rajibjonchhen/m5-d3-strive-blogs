import express from "express";
import fs from "fs"
import uniqid from 'uniqid'
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const blogsRouter = express.Router()

const currentFilePath = fileURLToPath(import.meta.url)
const parentFolderPath = dirname(currentFilePath)
const blogsJSONPath  = join(parentFolderPath, 'blogs.json')

const getBlogs = () => JSON.parse(fs.readFileSync(blogsJSONPath))
const writeBlogs = content => fs.writeFileSync(blogsJSONPath,JSON.stringify(content))

// for posting new blogs
blogsRouter.post("/",(req,res,next)=>{
    const blogsArray = getBlogs()
    const newBlog = {...req.body,createdAt:new Date(),_id:uniqid()}
    blogsArray.push(newBlog)
    writeBlogs(blogsArray)
    res.status().send({msg:"New blog added with the id - " +_id})
    
})

// for getting list of blogs
blogsRouter.get("/",(req,res,next)=>{
    const blogsArray = getBlogs()
  
    res.status().send()
})

// for getting single blog from array
blogsRouter.get("/:_id",(req,res,next)=>{
    const blogsArray = getBlogs()
    const blogId = req.params._id
    const singleBlog = blogsArray.find(blog => blog._id === blogId)
    res.status().send(singleBlog)
})

// for editing the post with id
blogsRouter.put("/:_id",(req,res,next)=>{
    const blogsArray = getBlogs()
    const blogId = req.params._id
    const index = blogsArray.findIndex(blog => blog._id === blogId)
    const oldBlog = blogsArray[index]
    const updatedBlog = {...oldBlog, ...req.body, updatedAt:new Date()}
    blogsArray[index] = updatedBlog
    writeBlogs(blogsArray)
    res.status().send
    
})

    // for deleting the post with id
    blogsRouter.delete("/:_id",(req,res,next)=>{
        const blogsArray = getBlogs()
        const blogId = req.params._id
        const remainingBlogs = blogsArray.filter(blog => blog._id !== blogId)

    })


export default blogsRouter