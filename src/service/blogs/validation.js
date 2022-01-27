import { body } from "express-validator"

export const newBlogValidation = [
    // body("category").exists().withMessage("Category is a mandatory field!"),
    body("title").exists().withMessage("Title is a mandatory field!"),
    // body("author.name").exists().withMessage('Author name is mandatory')
]


/*{	
    "category": "Scifi",
    "title": "Out of the world",
    "cover":"https://1.bp.blogspot.com/-CCiFxYsX8_8/YLmYYaTn4OI/AAAAAAABAxw/SNKOxdrwtr0Z4ESPR1NTw9IKSiJcpzk6QCLcBGAsYHQ/s1600/Ancient_Gods_by_fresh_style.jpg",
    "readTime": {
        "value": 2,
      "unit": "minute"
     },
    "author": {
        "name": "Stefen",
        "avatar":"AUTHOR AVATAR LINK"
        },
     "content":"HTML"
    }*/