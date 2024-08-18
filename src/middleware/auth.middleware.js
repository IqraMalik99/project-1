import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandlers.js";
import jwt from "jsonwebtoken"
const auth= AsyncHandler(async (req,res,next)=>{
   try {      
       if(!(req.cookies.accessToken)){
           throw new ApiError(400,"Not having token ");
        }
 
    const verification =  jwt.verify(req.cookies.accessToken,"accessSecret");
    if(!verification){
     throw new ApiError(400,"authorization of token")
    }
   const user = await User.findOne({_id : verification._id}).select( "-password -refreshToken ")
   if(!user){
     throw new ApiError(400, "not getting user in middleware db")
   }
   req.user =user
   next()
   } catch (error) {
    throw new ApiError(400,"Having error in auth middleware")
   }
})

export {auth}