import express from "express";
import fs from "fs"
import uniqid from 'uniqid'
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import createHttpError from "http-errors"
import { validationResult } from "express-validator"
import { newBlogValidation } from "./validation.js" 
import { getBlogs, writeBlogs } from "../../lib/fs-tools.js";
import { saveBlogPostCover } from "../../lib/fs-tools.js"

import multer from 'multer'

const blogsRouter = express.Router()

// const currentFilePath = fileURLToPath(import.meta.url)
// const parentFolderPath = dirname(currentFilePath)
// const blogsJSONPath  = join(parentFolderPath, 'blogs.json')



// for posting new blogs
blogsRouter.post("/", newBlogValidation, async (req,res,next)=>{ 
    try {
    const errorsList = validationResult(req)
    if(errorsList.isEmpty()){ 
        const blogsArray = await getBlogs()
        const uniqId = uniqid()
        const newBlog = {...req.body,createdAt:new Date(),blogId:uniqId, cover:`http://localhost:3001/blogs/${uniqId}`,comments:[]}
        blogsArray.push(newBlog)
       await writeBlogs(blogsArray)
        res.status(201).send({msg:"New blog added with the id - " +blogId})
    } else{
        next(createHttpError(400,"Error in creating new post",{errorsList}))
    }
    
    } catch (error) {
        next(error)
    }   
})

// for getting list of blogs
blogsRouter.get("/", async (req,res,next)=>{
    const blogsArray =  await getBlogs()
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
blogsRouter.get("/:blogId", async (req,res,next)=>{
    try {
    const blogsArray =  await getBlogs()
    const blogId = req.params.blogId
    const searchedBlog = blogsArray.find(blog => blog.blogId === blogId)

    if (searchedBlog) {
        res.send(searchedBlog)
      } else {
        next(createHttpError(404, `Book with id ${req.params.blogId} not found!`))
      }

    } catch (error) {
        next(error)
    }
})

// for editing the post with id
blogsRouter.put("/:blogId", async (req,res,next)=>{
    try {
    const blogsArray =  await getBlogs()
    const blogId = req.params.blogId
    const index = blogsArray.findIndex(blog => blog.blogId === blogId)
    const oldBlog = blogsArray[index]
    const updatedBlog = {...oldBlog, ...req.body, updatedAt:new Date()}
    blogsArray[index] = updatedBlog
    await writeBlogs(blogsArray)
    res.send(updatedBlog)
     

    } catch (error) {
        next(error)
        
    }
    
})

    // for deleting the post with id
    blogsRouter.delete("/:blogId", async (req,res,next)=>{
        try {
        const blogsArray =  await getBlogs()
        const blogId = req.params.blogId
        const remainingBlogs = blogsArray.filter(blog => blog.blogId !== blogId)
        await writeBlogs(remainingBlogs)
        res.status(204).send()

        } catch (error) {
        next(error)
            
        }

    })

    // for uploading cover image
   blogsRouter.post("/:blogId/uploadCover", multer().single("cover"), async (req, res, next) =>{
        try {
            const blogId = req.params.blogId
            await saveBlogPostCover(`${blogId}`, req.file.buffer)
            res.send("cover photo added")
        } catch (error) {
            
        }
        })


    // for commenting a
    blogsRouter.post("/:blogId/comments",  async (req, res, next) =>{
        try {
            const blogsArray = await getBlogs()
            const blogId = req.params.blogId
            const index = blogsArray.findIndex(blog => blog.blogId === blogId)
            if (index) {
                const oldBlog = blogsArray[index]
                console.log("the old blog is ", oldBlog)
                const newComment = {...req.body, commentId:uniqid(),  commentedAt:new Date()}
                console.log("the new comment is ", newComment)
                const updatedBlog = {...oldBlog,comments:[...oldBlog.comments,newComment]}
                oldBlog.comments.push(newComment)
                console.log("the updated blog is ", updatedBlog)
                blogsArray[index] = updatedBlog
                await writeBlogs(blogsArray)
                res.send(updatedBlog)
              } else {
                next(createHttpError(404, `Book with id ${req.params.blogId} not found!`))
              }
        
            } catch (error) {
                next(error)
            }
    })
// for getting comments
blogsRouter.get("/:blogId/comments", async (req,res,next)=>{
    try {
    const blogsArray =  await getBlogs()
    const blogId = req.params.blogId
    const searchedBlog = blogsArray.find(blog => blog.blogId === blogId)

    if (searchedBlog) {
        res.send(searchedBlog.comments)
      } else {
        next(createHttpError(404, `Book with id ${req.params.blogId} not found!`))
      }

    } catch (error) {
        next(error)
    }
})


export default blogsRouter