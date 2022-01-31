import express from "express"
import fs from "fs-extra"
import { fileURLToPath } from "url"
import { join, dirname, extname } from "path"


const { readJSON, writeJSON, writeFile } = fs

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data")
const authorsJSONPath = join(dataFolderPath, "authors.json")
const blogsJSONPath = join(dataFolderPath, "blogs.json")


const authorsPublicFolderPath = join(process.cwd(), "./public/img/authors")

const blogsPublicFolderPath = join(process.cwd(), "./public/img/blogs")

export const getAuthors = () => readJSON(authorsJSONPath)
export const writeAuthors = content => writeJSON(authorsJSONPath, content)
export const getBlogs = () => readJSON(blogsJSONPath)
export const writeBlogs = content => writeJSON(blogsJSONPath, content)




export const coverUploader = (req, res, next) => {
    
    try {
        const {originalname, buffer} = req.file
        const extenstion = extname(originalname)
        
        const fileName =`${req.params.blogId}${extenstion}`
        const pathToFile = join(blogsPublicFolderPath, fileName)
        const imageUrl = `http://localhost3001/${fileName}`
        req.file.imageUrl =imageUrl
        fs.writeFileSync(pathToFile, buffer)
        next()
    } catch (error) {
        next(error)
    }
}

export const avatarUploader = (req, res, next) => {
    try {
        const {originalname, buffer} = req.file
        const extenstion  = extname(originalname)
        const fileName =`${req.params.blogId}${extenstion}`
        const pathToFile = join(authorsPublicFolderPath, fileName)
        
        const imageUrl = `http://localhost3001/${fileName}`
        req.file.imageUrl =imageUrl
        fs.writeFileSync(pathToFile, buffer)
        console.log("i m runnig",fs.file.imageUrl, fileName)
        next()
    } catch (error) {
        next(error)
    }
    }


