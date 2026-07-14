import express from "express"
import cors from "cors"
import prisma from "./src/config/prisma.js";
import cookieParser from "cookie-parser";
const app=express()
const PORT=5000||process.env.PORT;

import userRoute from "./routes/user.routes.js";
import contactRoute from "./routes/contact.routes.js";
import hospitalRoute from "./routes/hospital.routes.js";
import blogRoute from "./routes/blog.routes.js";
import careerRoute from "./routes/career.routes.js";
import departmentRoute from "./routes/coordinator/department.routes.js";
import roleRoutes from "./routes/coordinator/role.routes.js";
import employeeRoutes from "./routes/employee/employee.routes.js";
import stateRoutes from "./routes/coordinator/state.routes.js";
import districtRoute from "./routes/coordinator/district.routes.js";
import talukaRoutes from "./routes/coordinator/taluka.routes.js";
import villageRoutes from "./routes/coordinator/village.routes.js";
import assignedRoutes from "./routes/employee/assigned.routes.js";


app.use(express.json())

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://geswango.in",
  "https://www.geswango.in",
  "https://admin.geswango.in"
];
app.use(cors({
 origin:function(origin ,  callback){
    if(!origin){
        return callback(null,true)  
    }
    if(allowedOrigins.includes(origin)){
        return callback(null,true)
 }else{
    return callback(new Error("Not allowed by CORS"))
 }
 },
  credentials: true
}))
app.use(cookieParser())
app.use("/api/user",userRoute)
app.use("/api/contact",contactRoute)


app.use("/api/hospital",hospitalRoute)

app.use("/api/blog",blogRoute)

app.use("/api/job",careerRoute)

app.use("/api/department",departmentRoute)
app.use("/api/role", roleRoutes)

app.use("/api/state",stateRoutes)
app.use("/api/district",districtRoute)
app.use("/api/taluka",talukaRoutes )
app.use("/api/village",villageRoutes)

// employee
app.use("/api/employee",employeeRoutes)

// assigned
app.use("/api/assigned",assignedRoutes)


app.get("/checkUp",(req,res)=>{
    res.send("Hello World")
})

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})

