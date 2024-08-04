
import { asyncHandler } from "../utils/AsyncHandlers.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadCloud } from "../utils/cloudnary.js"
import { Responce } from "../utils/Responce.js"
import jwt from "jsonwebtoken"

let genAcessAndRefreshToken = async (userid) => {
  try {
    let getuser = await User.findById(userid);
    // console.log(getuser)
    if (!getuser) {
      throw new ApiError(400, " give proper user for token");
    }
    let accessToken = await getuser.genAccessToken();
    let refreshToken = await getuser.generateRefreshToken();
    getuser.refreshToken = refreshToken;
    await getuser.save({ validateBeforeSave: false })
    return {
      accessToken, refreshToken
    }
  } catch (error) {
    throw new ApiError(400, "Error is generating token");
  }
}
let userController = asyncHandler(async (req, res, next) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  let { email, password, fullName, username } = req.body;
  if ([email, password, fullName, username].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are requiredd");
  }
  let ExitedUser = await User.findOne({ email: req.body.email });
  if (ExitedUser) {
    throw new ApiError(400, "User already registered")
  }

  console.log(req.files);
  let avatarLocalpath = req.files?.avatar[0].path;
  if (!avatarLocalpath) {
    throw new ApiError(400, " avatar is required")
  }
  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage[0].lenght > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
  }
  let avatarUpload = await uploadCloud(avatarLocalpath);
  let coverImageUpload = await uploadCloud(coverImageLocalPath);
  if (!avatarUpload) {
    throw new ApiError(400, "avatar uploading on cloudinary error")
  }
  let usercreation = await User.create({
    fullName,
    username,
    email,
    password,
    avatar: avatarUpload.url,
    coverImage: coverImageUpload ? coverImageUpload.url : ""
  })

  let getuser = await User.findOne({ _id: usercreation._id }).select("-password -refreshToken");
  console.log(getuser)
  if (!getuser) {
    throw new ApiError(400, "Something went wrong in db create user ")
  }
  console.log("Done");
  return res.status(200).json(
    new Responce(200, getuser, "User Sucessfully registered")
  )

})

let login = asyncHandler(async (req, res, next) => {
  let { email, username, password } = req.body;
  if (!(email || password)) {
    throw new ApiError(400, "username or email is required");
  }
  let user = await User.findOne({
    $or: [{ username }, { email }]
  })
  if (!user) {
    throw new ApiError(400, "user is not registered");
  }
  let passwordCheck = user.ispasswordcorrect(password);
  if (!passwordCheck) {
    throw new ApiError(400, "wrong password enter ");
  }
  let { accessToken, refreshToken } = await genAcessAndRefreshToken(user._id);
  console.log(accessToken + "lllllmm++++");
  
  let loggedUser = await User.findOne({ _id: user._id }).select("-password -refreshToken");
  let options = {
    httpOnly: true,
    secure: true
  }
  res.status(200).cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options).json(
      new Responce(200,
        {
          user: loggedUser, accessToken, refreshToken
        },
        "done with looged in"
      )
    );

})

let logout = asyncHandler(async (req, res, next) => {
  let user = req.user;
  let getUser = await User.findById(user._id);
  if (!getUser) {
    throw new ApiError(400, "not having user from logout");
  }
  getUser.refreshToken = "";
  await getUser.save({ validateBeforeSave: false });
  let options = {
    httpOnly: true,
    secure: true
  }
  res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(200,
    {}, "userlogged out"
  )
})

const refershMyTokens = asyncHandler(async(req,res,neext)=>{
 try {
  let commingrefreshtoken = req.cookies.refreshToken || req.body.refreshToken ;   // in some time token is in body
   if(!commingrefreshtoken){
        throw new ApiError(400,"Not having token for refresh")
   }
  let user =  jwt.verify(commingrefreshtoken ,"refreshToken" );
  if(!user){
   throw new  ApiError(400," not having user in refreshing token")
  }
  let getuser = await User.findById(user._id);
  if(!getuser){
   throw new ApiError(400," not getting uder with refresing token");
  }
  if( getuser?.refreshToken !== commingrefreshtoken){
  throw new ApiError(400 ,"unauthorizated token ")
  } 
 let {newaccess, newrefresh} = await genAcessAndRefreshToken(getuser._id);
 let options ={
   httpOnly : true ,
   secure :true
 }
 res.status(200).cookie("accessToken", newaccess , options)
     .cookie("refreshToken",newrefresh , options).json(
       new Responce(200,
         {
           accessToken :newaccess,
           refreshToke :newrefresh
         },
         "Sucessfully refresh tokens"
       )
     );
 
 } catch (error) {
  throw new ApiError (400,"error in refreshing token")
 }

})

export {
  userController,
  login,
  logout ,
  refershMyTokens
}


//  $or: [{username}, {email}]    mongodb operator
// .some  , .select
//  so methods created by .method in model(usermodel) cannot get acess throw moongoose obj User it can use with
// the user get through find one in (check in login passwordCheck)