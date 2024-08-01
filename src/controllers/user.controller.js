
 import {asyncHandler} from "../utils/AsyncHandlers.js"
  import {ApiError} from "../utils/ApiError.js"
  import {User} from "../models/user.model.js"
  import  {uploadCloud} from "../utils/cloudnary.js"
  import {Responce} from "../utils/Responce.js"

const userController = asyncHandler(async(req,res,next)=>{
      // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
   
    const {email ,password , fullName,username }= req.body;
     if([email ,password , fullName,username].some((field)=> field?.trim() === "" )){
      throw new ApiError(400, "All fields are requiredd");
     }
     const ExitedUser = await User.findOne( {email:req.body.email});
     if(ExitedUser){
      throw new ApiError(400,"User already registered")
     }
    
    console.log(req.files);
    const avatarLocalpath  = req.files?.avatar[0].path;
    if(!avatarLocalpath ){
    throw  new ApiError(400, " avatar is required")
    }
    let coverImageLocalPath ;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage[0].lenght >0){
      coverImageLocalPath = req.files.coverImage[0].path
    }
    let avatarUpload= await uploadCloud(avatarLocalpath);
    let coverImageUpload = await uploadCloud(coverImageLocalPath);
    if(!avatarUpload){
      throw new ApiError(400,"avatar uploading on cloudinary error")
    }
    const usercreation = await User.create({
      fullName,
      username ,
      email,
      password,
      avatar:avatarUpload.url,
      coverImage : coverImageUpload ?  coverImageUpload.url : ""
    })
    
    const getuser = await User.findOne({ _id :usercreation._id }).select( "-password -refreshToken");
    console.log(getuser)
    if(!getuser){
      throw new ApiError(400, "Something went wrong in db create user ")
    }
    console.log("Done");
    return res.status(200).json(
       new Responce(200, getuser , "User Sucessfully registered") 
    )

})
export default userController