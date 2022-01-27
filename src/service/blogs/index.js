import express from "express";
import fs from "fs"
import uniqid from 'uniqid'
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import createHttpError from "http-errors"
import { validationResult } from "express-validator"
import { newBlogValidation } from "./validation.js" 

const blogsRouter = express.Router()

const currentFilePath = fileURLToPath(import.meta.url)
const parentFolderPath = dirname(currentFilePath)
const blogsJSONPath  = join(parentFolderPath, 'blogs.json')

const getBlogs = () => JSON.parse(fs.readFileSync(blogsJSONPath))
const writeBlogs = content => fs.writeFileSync(blogsJSONPath,JSON.stringify(content))

// for posting new blogs
blogsRouter.post("/",newBlogValidation,(req,res,next)=>{
    try {
    const errorsList = validationResult(req)
    if(errorsList.isEmpty()){
        const blogsArray = getBlogs()
        const newBlog = {...req.body,createdAt:new Date(),_id:uniqid()}
        blogsArray.push(newBlog)
        writeBlogs(blogsArray)
        res.status(201).send({msg:"New blog added with the id - " +_id})
    } else{
        next(createHttpError(400,"Error in creating new post",{errorsList}))
    }
    
    } catch (error) {
        next(error)
    }   
})

// for getting list of blogs
blogsRouter.get("/",(req,res,next)=>{
    const blogsArray = getBlogs()
    try {
    if(req.query && req.query.category){
        const filteredBlogs = blogsArray.filter(blog => blog.category === blog.query.category)
        res.send(filteredBlogs)
    } else {
        res.send(blogsArray)
    }
     

    } catch (error) {
        next(error)
    }
})

// for getting single blog from array
blogsRouter.get("/:_id",(req,res,next)=>{
    try {
    const blogsArray = getBlogs()
    const blogId = req.params._id
    const searchedBlog = blogsArray.find(blog => blog._id === blogId)

    if (searchedBlog) {
        res.send(searchedBlog)
      } else {
        next(createHttpError(404, `Book with id ${req.params._id} not found!`))
      }

    } catch (error) {
        next(error)
    }
})

// for editing the post with id
blogsRouter.put("/:_id",(req,res,next)=>{
    try {
        const blogsArray = getBlogs()
    const blogId = req.params._id
    const index = blogsArray.findIndex(blog => blog._id === blogId)
    const oldBlog = blogsArray[index]
    const updatedBlog = {...oldBlog, ...req.body, updatedAt:new Date()}
    blogsArray[index] = updatedBlog
    writeBlogs(blogsArray)
    res.send(updatedBlog)
     

    } catch (error) {
        next(error)
        
    }
    
})

    // for deleting the post with id
    blogsRouter.delete("/:_id",(req,res,next)=>{
        try {
        const blogsArray = getBlogs()
        const blogId = req.params._id
        const remainingBlogs = blogsArray.filter(blog => blog._id !== blogId)
        writeBlogs(remainingBlogs)
        res.status(204).send()

        } catch (error) {
        next(error)
            
        }

    })


export default blogsRouter