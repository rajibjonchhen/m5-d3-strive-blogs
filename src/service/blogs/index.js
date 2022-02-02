
import express from "express";
import fs from "fs"
import uniqid from 'uniqid'
import multer from 'multer'
import createHttpError from "http-errors"
import { validationResult } from "express-validator"
import { newBlogValidation } from "./validation.js" 
import { getBlogs, writeBlogs, uploadCover ,uploadAvatar} from "../../lib/fs-tools.js";
// upload in cloudinary
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
// for file download
import { pipeline } from "stream"
import { generateBlogPDF } from "../../lib/pdfMaker.js"

const blogsRouter = express.Router()

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
  cloudinary,
    params:{
      folder:'blogs'
    }
  })
}).single("image")



// pdf creater
blogsRouter.get("/downloadpdf/:id", async(req, res, next) => {
  
  try {
    const blogsArray =  await getBlogs()
    const blogId = req.params.blogId
    const searchedBlog = blogsArray.find(blog => blog.blogId === blogId)

    res.setHeader("Content-Disposition", `attachment; filename=download.pdf`)
    const source = await generateBlogPDF(searchedBlog)
    const destination = res
    pipeline(source, destination, err => {
      if (err) next(err)
    })
  } catch (error) {
    next(error)
  }
})


// for posting new blogs
blogsRouter.post("/",  async (req,res,next)=>{ 
    try {
    const errorsList = validationResult(req)
    if(errorsList.isEmpty()){ 
        const blogsArray = await getBlogs()
        const uniqId = uniqid()
        console.log({body:req.body})
        const newBlog = {...req.body,createdAt:new Date(),blogId:uniqId, cover:`http://localhost:3001/blogs/${uniqId}`,comments:[]}
        blogsArray.push(newBlog)
       await writeBlogs(blogsArray)
        res.status(201).send({blogId: newBlog.blogId})
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

// upload avatar with cloudinary avatar
  blogsRouter.put("/:blogId/cloudinaryUploadAvatar", cloudinaryUploader, async (req, res, next) => {
      try {
        console.log(req.file)
        const blogs = await getBlogs()
        const index = blogs.findIndex(blog => blog.id === req.params.blogId)
        const oldBlog= blogs[index]
        const updatedBlog = { ...oldBlog, author:{...oldBlog.author,avatar: req.file.path }}
        blogs[index] = updatedBlog
        await writeBlogs(blogs)
        res.send("Uploaded on Cloudinary!")
      } catch (error) {
        next(error)
      }
    })

    // upload cover with cloudinary
    blogsRouter.put("/:blogId/cloudinaryUploadCover", cloudinaryUploader, async (req, res, next) => {
      try {
        console.log("--> ",req.file)
        const blogs = await getBlogs()
        const index = blogs.findIndex(blog => blog.id === req.params.blogId)
        const oldBlog= blogs[index]
        const updatedBlog = { ...oldBlog, cover: req.file.path }
        console.log(updatedBlog)
       
        blogs[index] = updatedBlog
        await writeBlogs(blogs)
        res.send("Uploaded on Cloudinary!")
      } catch (error) {
        next(error)
      }
    })
    // for uploading cover image
    blogsRouter.put("/:blogId/uploadCover",  multer().single('image'), uploadCover, async (req, res, next) =>{
      console.log(req.file.imageUrl)    
      console.log('hi')
    try {
            const blogId = req.params.blogId
            const blogsArray = await getBlogs()
            const index = blogsArray.findIndex(blog => blog.blogId === blogId)
            const oldBlog = blogsArray[index]
            const updatedBlog = {...oldBlog, cover:req.file.imageUrl, updatedAt:new Date()}
            blogsArray[index]  = updatedBlog
            await writeBlogs(blogsArray)
            res.send("cover photo added")
        } catch (error) {
         next(error)   
        }
        })

    
    
        // for uploading the avatar
blogsRouter.put("/:blogId/uploadAvatar", multer().single("image"), uploadAvatar, async (req, res, next) => {  
  try {
    const blogId = req.params.blogId
    const blogsArray = await getBlogs()
    const index = blogsArray.findIndex(blog => blog.blogId === blogId)
    const oldBlog  = blogsArray[index]
    console.log("i m runnig", req.file.imageUrl)
    const updatedBlog = {...oldBlog, author:{...oldBlog.author, avatar:req.file.imageUrl, updatedAt: new Date()}}
    blogsArray[index] = updatedBlog
    console.log("author's avatar added",req.file.imageUrl)    
    await writeBlogs(blogsArray)
    
    res.send("author's avatar added")
    } catch (error) {
      next(error)
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

// for getting single comment
blogsRouter.get("/:blogId/comments/:commentId", async (req,res,next)=>{
    try {
    const blogsArray =  await getBlogs()
    const blogId = req.params.blogId
    const commentId = req.params.commentId
    const searchedBlog = blogsArray.find(blog => blog.blogId === blogId)
    const searchedComment = searchedBlog.comments.find(comment => comment.commentId === commentId)
    if (searchedBlog) {
        res.send(searchedComment)
      } else {
        next(createHttpError(404, `Book with id ${req.params.blogId} not found!`))
      }

    } catch (error) {
        next(error)
    }
})

// for editing single comment
blogsRouter.put("/:blogId/comments/:commentId", async (req,res,next)=>{
    try {
    const blogsArray =  await getBlogs()
    const blogId = req.params.blogId
    const commentId = req.params.commentId
    const blogIndex = blogsArray.findIndex(blog => blog.blogId === blogId)
    const searchedBlog = blogsArray[blogIndex]

    const commentIndex = searchedBlog.comments.findIndex(comment => comment.commentId === commentId)
    const searchedComment =searchedBlog.comments[commentIndex]
    if (searchedComment) {
        console.log(searchedComment)
        const editedComment = {...searchedComment, ...req.body ,UpdatedAt:new Date()}
        searchedBlog.comments[commentIndex] = editedComment
        blogsArray[blogIndex] = searchedBlog
        console.log(blogsArray[blogIndex] )
        console.log("the updated blog is ", updatedBlog)
        blogsArray[index] = updatedBlog

        await writeBlogs(blogsArray)
        res.send(blogsArray[blogIndex])
      } else {
        next(createHttpError(404, `Book with id ${req.params.blogId} not found!`))
      }

    } catch (error) {
        next(error)
    }
})


// for deleting single comment
blogsRouter.delete("/:blogId/comments/:commentId", async (req,res,next)=>{
    try {
    const blogsArray =  await getBlogs()
    const blogId = req.params.blogId
    const commentId = req.params.commentId
    const blogIndex = blogsArray.findIndex(blog => blog.blogId === blogId)
    const searchedBlog = blogsArray[blogIndex]
    

    if (searchedBlog) {
        const remainingComments = searchedBlog.comments.filter(comment => comment.commentId !== commentId)
        searchedBlog.comments = remainingComments
        blogsArray[blogIndex] = searchedBlog
        
        console.log("the updated blog is ", searchedBlog)
        blogsArray[index] = updatedBlog
        console.log(blogsArray[index])
        await writeBlogs(blogsArray)
        res.send('Deleted')
      } else {
        next(createHttpError(404, `Book with id ${req.params.blogId} not found!`))
      }

    } catch (error) {
        next(error)
    }
})



export default blogsRouter