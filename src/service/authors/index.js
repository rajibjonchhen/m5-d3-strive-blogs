import express from "express";
import fs from 'fs'
import uniqid from 'uniqid'
import { writeAuthors, getAuthors } from "../../lib/fs-tools.js";

const authorsRouter = express.Router()



// for checking email 
authorsRouter.get("/checkEmail/:email", async(req,res)=>{
    const authorsArray =  await getAuthors()
    const emailTaken = (authorsArray.find(author => author.email === req.params.email? true:false)? true:false)

    res.status(201).send(emailTaken)
})
// for creating

authorsRouter.post("/", async (req,res)=>{

console.log("new post body",req.body)

const newAuthor = {...req.body, createdAt: new Date(), authorId: uniqid() }
console.log('the new author is',newAuthor)

const authorsArray = await getAuthors();

let statusCode =''
let msg=''
const isEmailTaken = (authorsArray.find(author => author.email === newAuthor.email))? true:false
if(isEmailTaken !== true){
    authorsArray.push(newAuthor)
    await writeAuthors(authorsArray)
    msg = `successfully created with authorId ${newAuthor.authorId}`
    statusCode = '201'
} else {
    msg = 'email already registered'
    statusCode = '401'

}


res.status(statusCode).send(msg)

})
// for getting the list
authorsRouter.get("/", async(req,res)=>{ 
const authorsArray = await getAuthors()
res.status(200).send(authorsArray)
})


// for getting  the individual items
authorsRouter.get("/:authorId",async(req,res)=>{
const authorsArray =  await getAuthors()
const singleAuthor = authorsArray.find(author=> author.authorId === req.params.authorId)
res.send(singleAuthor)
})

// for editing the information
authorsRouter.put("/:authorId",async(req,res)=>{
    const authorsArray =  await getAuthors()
    const index = authorsArray.findIndex(author => author.authorId === req.params.authorId)
    const singleAuthor = authorsArray[index]
    const updatedSingleAuthor = {...singleAuthor, ...req.body, updatedAt: new Date()}

    let statusCode =''
    let msg=''
    const isEmailTaken = authorsArray.find(author => author.email === updatedSingleAuthor.email)? true:false
    if(!isEmailTaken){
    authorsArray[index] = updatedSingleAuthor
    await writeAuthors(authorsArray)
    msg = `successfully updated`
    statusCode = '204'
} else{
    msg = 'cannot be updated email already registered'
    statusCode = '401'
}
res.status(statusCode).send(msg)
})

// for deleting the items
authorsRouter.delete("/:authorId",async(req,res)=>{
    const authorsArray =  await getAuthors()
    const newArray = authorsArray.filter(author => author.authorId !== req.params.authorId)
    await writeAuthors(newArray)
    res.status(204).send(newArray)
})


// for uploading the image
authorsRouter.post("/uploadSingleAvatar", multer().single("avatar"), async (req, res, next) => {
    try {
      console.log("FILE: ", req.file)
      await saveAuthorAvatar(req.file.originalname, req.file.buffer)
      res.send("author's avatar added")
    } catch (error) {
      next(error)
    }
  })



export default  authorsRouter