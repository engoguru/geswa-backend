import express from "express"
import { dashboardRevenueData, dashboardUserData } from "../controllers/dashboard.controller.js";
import { auth } from "../auth/authentication";
const dashboardRoute=express.Route()


dashboardRoute.get("/get-user-data",auth,dashboardUserData)

dashboardRoute.get("/get-revenue-data",auth,dashboardRevenueData)





export default dashboardRoute;