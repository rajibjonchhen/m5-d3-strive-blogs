import express from "express";
import fs from "fs"
import uniqid from 'uniqid'
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const blogsRouter = express.Router()

const currentFilePath = fileURLToPath(import.meta.url)
const parentFolderPath = dirname(currentFilePath)
const blogsJSONPath  = join(parentFolderPath, 'blogs.json')


export default blogsRouter