import { body } from "express-validator"

export const newBlogValidation = [
    body("category").exists().withMessage("Category is a mandatory field!"),
    body("title").exists().withMessage("Title is a mandatory field!"),
    // body("author.name").exists().withMessage('Author name is mandatory')
]


