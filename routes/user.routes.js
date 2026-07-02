import express from "express"
import { forgetPassword, resetPassword, updateUser, userLogin, userLogout, userRegister, verifyOtp, viewAllUser, viewOneUser } from "../controllers/user.controller.js"
import { auth } from "../auth/authentication.js";

const userRoute=express.Router()



userRoute.post("/register", userRegister);
userRoute.post("/login",userLogin );

userRoute.post("/forget-password",forgetPassword)
userRoute.post("/verify-otp",verifyOtp)
userRoute.post("/reset-password",resetPassword)


userRoute.get("/all-user",auth,viewAllUser)
userRoute.get("/detail/:id",auth,viewOneUser)


userRoute.post("/update/:id",auth, updateUser)


// get login user data
userRoute.get("/verifyUser", auth,(req,res)=>{
    res.json({
        success:true,
        user:req.user
    })
})


userRoute.post("/logout",auth,userLogout)

export default userRoute