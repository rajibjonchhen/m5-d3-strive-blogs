
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
import { getPDFReadableStream } from "../../lib/pdfMaker.js"
import {sendNewBlog} from '../../lib/email-tools.js'

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
// get single blogs
blogsRouter.get("/:id/pdf", async (req, res, next) => {
  try {
    const blogsArray =  await getBlogs()
    const blogId = req.params.id
    const blog = blogsArray.find(blog => blog.blogId === blogId)
    if (!blog) {
      res
      .status(404)
      .send({ message: `blog with ${req.params.id} is not found!` });
    } else{
      console.log("req.params.id and blog",req.params.id, blog)
      const pdfStream = await getPDFReadableStream(blog);
      res.setHeader("Content-Type", "application/pdf");
      pdfStream.pipe(res);
      pdfStream.end();
    }
  } catch (error) {
    res.status(500).send({ errMessage: error.message });
  }
});


// for posting new blogs
blogsRouter.post("/",  async (req,res,next)=>{ 
    try {
    const errorsList = validationResult(req)
    if(errorsList.isEmpty()){ 
        const blogsArray = await getBlogs()
        const uniqId = uniqid()
        const newBlog = {...req.body,createdAt:new Date(),blogId:uniqId, cover:`http://localhost:3001/blogs/${uniqId}`,comments:[]}
        blogsArray.push(newBlog)
        console.log("from post new ",newBlog, req.body)
        await writeBlogs(blogsArray)
        sendNewBlog(newBlog)
        res.status(201).send(newBlog)
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
    const updatedBlog = {...oldBlog, ...req.body, updatedAt:new Date(),author:{}}
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
        console.log("old blog",oldBlog,"index", index)

        if(index !== -1){
          oldBlog.author = {...oldBlog.author, avatar:req.file.path}
          const updatedBlog = { ...oldBlog, author:{...oldBlog.author,avatar: req.file.path }}
          blogs[index] = oldBlog
          console.log("index oldblog and updatedblog",index, oldBlog)
          await writeBlogs(blogs)
          res.send(updatedBlog)
        } else{
          res.send({err:`avatar url can not be updated ${blogId} not found and index is ${index}`})
          
        }
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
        console.log("index oldblog and updatedblog",index, oldBlog,updatedBlog)
        blogs[index] = updatedBlog
        await writeBlogs(blogs)
        res.send(updatedBlog)
      } catch (error) {
        next(error)
      }
    })
    // for uploading cover image in localhost
    // blogsRouter.put("/:blogId/uploadCover",  multer().single('image'), uploadCover, async (req, res, next) =>{
    //   console.log(req.file.imageUrl)    
    //   console.log('hi')
    // try {
    //         const blogId = req.params.blogId
    //         const blogsArray = await getBlogs()
    //         const index = blogsArray.findIndex(blog => blog.blogId === blogId)
    //         const oldBlog = blogsArray[index]
    //         const updatedBlog = {...oldBlog, cover:req.file.imageUrl, updatedAt:new Date()}
    //         blogsArray[index]  = updatedBlog
    //         await writeBlogs(blogsArray)
    //         res.send("cover photo added")
    //     } catch (error) {
    //      next(error)   
    //     }
    //     })

    
    
        // for uploading the avatar in localhost
// blogsRouter.put("/:blogId/uploadAvatar", multer().single("image"), uploadAvatar, async (req, res, next) => {  
//   try {
//     const blogId = req.params.blogId
//     const blogsArray = await getBlogs()
//     const index = blogsArray.findIndex(blog => blog.blogId === blogId)
//     const oldBlog  = blogsArray[index]
//     console.log("i m runnig", req.file.imageUrl)
//     const updatedBlog = {...oldBlog, author:{...oldBlog.author, avatar:req.file.imageUrl, updatedAt: new Date()}}
//     blogsArray[index] = updatedBlog
//     console.log("author's avatar added",req.file.imageUrl)    
//     await writeBlogs(blogsArray)
    
//     res.send("author's avatar added")
//     } catch (error) {
//       next(error)
//     }
//   })
  
  

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