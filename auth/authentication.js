import jwt from "jsonwebtoken";
export const auth =(req,res,next)=>{
    try {
        const token=req?.cookies?.microGeswa
        // console.log(token)
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Unauthorized",
            })
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        req.user=decoded
        next()
    } catch (error) {  
       console.log(error) 
    }
}