import express from "express"
import { auth } from "../../auth/authentication.js"
import { createDistrict, getDistrictsByState } from "../../controllers/coordinator/district.controller.js"
const districtRoute=express.Router()


districtRoute.post("/create",auth,createDistrict)

districtRoute.get("/viewAll/:stateId",auth,getDistrictsByState)





export default districtRoute