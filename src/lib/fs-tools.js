import fs from "fs-extra" // 3rd party module
import { fileURLToPath } from "url"
import { join, dirname } from "path"

const { readJSON, writeJSON, writeFile } = fs

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data")
const authorsPublicFolderPath = join(process.cwd(), "./public/image/authors")
const blogsPublicFolderPath = join(process.cwd(), "./public/image/blogs")

const authorsJSONPath = join(dataFolderPath, "authors.json")
const blogsJSONPath = join(dataFolderPath, "blogs.json")

console.log(authorsJSONPath, blogsJSONPath)
export const getAuthors = () => readJSON(authorsJSONPath)
export const writeAuthors = content => writeJSON(authorsJSONPath, content)
export const getBlogs = () => readJSON(blogsJSONPath)
export const writeBlogs = content => writeJSON(blogsJSONPath, content)

export const saveAuthorAvatar = (filename, contentAsABuffer) => writeFile(join(authorsPublicFolderPath, filename), contentAsABuffer)
export const saveBlogPostCover = (filename, contentAsABuffer) => writeFile(join(blogsPublicFolderPath, filename), contentAsABuffer)

