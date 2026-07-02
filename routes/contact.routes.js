import  express from "express"
import { createContact, updateContact, viewAllContact, viewOneContact } from "../controllers/contact.controller.js";
import { auth } from "../auth/authentication.js";

const contactRoute=express.Router()

contactRoute.post("/create",createContact)
contactRoute.get("/all-contact",auth,viewAllContact)
contactRoute.get("/:id",auth,viewOneContact)
contactRoute.put("/update/:id",auth,updateContact)

export default contactRoute;