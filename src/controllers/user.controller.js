
import { asyncHandler } from "../utils/AsyncHandlers.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadCloud } from "../utils/cloudnary.js"
import { Responce } from "../utils/Responce.js"
import jwt from "jsonwebtoken"
import { subscription } from "../models/subscription.model.js"
import mongoose from "mongoose"

let genAcessAndRefreshToken = async (userid) => {
  try {
    let getuser = await User.findById(userid);
    // console.log("i am get user in func           "+getuser)
    if (!getuser) {
      throw new ApiError(400, " give proper user for token");
    }
    let accessToken = await getuser.genAccessToken();
    let refreshToken = await getuser.generateRefreshToken();
    
    getuser.refreshToken = refreshToken;
    await getuser.save({ validateBeforeSave: false })
    // console.log(` my      refresh token   ${getuser.refreshToken}`)
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
 

  let loggedUser = await User.findOne({ _id: user._id }).select("-password -refreshToken");
  let options = {
    httpOnly: true,
    secure: true
  }
  return res.status(200).cookie("accessToken", accessToken, options)
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
  return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(200,
    {}, "userlogged out"
  )
})

const refershMyTokens = asyncHandler(async (req, res, neext) => {
  try {
    let commingrefreshtoken = req.cookies.refreshToken || req.body.refreshToken;   // in some time token is in body
    // console.log(`berfore refresh ${commingrefreshtoken}`);
    if (!commingrefreshtoken) {
      throw new ApiError(400, "Not having token for refresh")
    }
    let user = jwt.verify(commingrefreshtoken, "refreshToken");
    // console.log(`user after jwt verification ${user}`);
    
    if (!user) {
      throw new ApiError(400, " not having user in refreshing token")
    }
    let getuser = await User.findById(user._id);
    if (!getuser) {
      throw new ApiError(400, " not getting uder with refresing token");
    }
    console.log(`get user with user ${getuser}`);
    if (getuser?.refreshToken !== commingrefreshtoken) {
      throw new ApiError(400, "unauthorizated token ")
    }    
    let token = await genAcessAndRefreshToken(getuser._id);
    console.log(`new acess token ${token.accessToken} and refresh is   ${token.refreshToken}`);
    
    let options = {
      httpOnly: true,
      secure: true
    }
    return res.status(200).cookie("accessToken",token.accessToken, options)
      .cookie("refreshToken",token.refreshToken, options).json(
        new Responce(200,
          {
            accessToken : token.accessToken,
            refreshToken: token.refreshToken
          },
          "Sucessfully refresh tokens"
        )
      );

  } catch (error) {
    throw new ApiError(400, "error in refreshing token")
  }

})
const changepassword = asyncHandler(async (req, res, next) => {
  let { oldpassword, newpassword } = req.body;
  let user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(400, " Not havin logged in user")
  }
  let verify = user.ispasswordcorrect(oldpassword);
  if (!verify) {
    throw new ApiError(400, "wrong password");
  }
  user.password = newpassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new Responce(200, {}, "Password changed successfully"))

})
const updateData = asyncHandler(async (req, res, next) => {
  let { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "All fields required for update data");
  }
  let updateUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        email,
        fullName
      }
    },
    {
      new: true
    }
  ).select("-password -refreshToken");
  return res.status(200).json(new Responce(200, { updateUser }, "Done with update in data"));

})
const currentUser = asyncHandler(async (req, res, next) => {
  return res.status(200).json(
    new Responce(200, req.user, "Done with getting current user")
  )
})

let changeAvatar = asyncHandler(async (req, res, next) => {
  let user = req.user;
  let newavatar = req.file?.path;
  if (!newavatar) {
    throw new ApiError(400, "not having local file path");
  }
  let cloud = await uploadCloud(newavatar);
  if (!cloud.url) {
    throw new ApiError(400, "not having cloud url in updating");
  }
  let getuser = await User.findByIdAndUpdate(user._id,
    {
      $set: {
        avatar: cloud.url
      }
    }, {
    new: true
  }
  ).select(" -password ");
  return res.status(200).json(new Responce(200, getuser, "successfully change avatar"))
})

let changeCoverImage = asyncHandler(async (req, res, next) => {
  let user = req.user;
  let newcover = req.file?.path;
  if (!newcover) {
    throw new ApiError(400, "not having local file path");
  }
  let cloud = await uploadCloud(newcover);
  if (!cloud.url) {
    throw new ApiError(400, "not having cloud url in updating");
  }
  let getuser = await User.findByIdAndUpdate(user._id,
    {
      $set: {
        coverImage: cloud.url
      }
    }, {
    new: true
  }
  ).select(" -password ");
  return res.status(200).json(new Responce(200, getuser, "successfully change avatar"))
})

let userProfile = asyncHandler( async(req, res, next) => {
  let { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "cannot get User from params user");
  }
  let channel = await  User.aggregate([
    {
      $match: {
        username: username.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "people",
        as: "subscribedTo"
      }
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers"
        },
        subscribeTo: {
          $size: "$subscribedTo"
        }
        ,
        isSubscribe: {
          $cond: {
            if: {
              $in: [req.user?.id,
              {
                $map: {
                  input: "$subscribers",
                  as: "sub",
                  in: "$$sub.people"
                }
              }
              ]
            },
            then: true,
            else: false
          }
        }

      }
    }, {
      $project: {
        username: 1,
        email: 1,
        fullName: 1,
        avatar: 1,
        coverImage: 1,
        subscriberCount: 1,
        subscribeTo: 1,
        isSubscribe: 1
      }
    }
  ]);
  console.log(channel.length);
  if (!channel?.length) {
    throw new ApiError(400, "error in getting channel or maybe in pipelines")
  }
  return res.status(200).json(new Responce(200, channel[0], "sucessfully give profile subscribers"))
});
let watchHistory = asyncHandler( async(req, res, next) => {
  let history =await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory"
        , pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner"
              , pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
            }
          },
          {
            $addFields:{
              owner:{
                $first:"$owner"
              }
            }
          }
        ]
      }
    }
  ])
  console.log(history)
  return res.status(200).json(200,history[0].watchHistory,"sucessfully get watch history")
});
export {
  userController,
  login,
  logout,
  refershMyTokens,
  changepassword,
  currentUser,
  changeAvatar,
  changeCoverImage,
  userProfile,
  watchHistory,
  updateData
}


//  $or: [{username}, {email}]    mongodb operator
// .some  , .select
//  so methods created by .method in model(usermodel) cannot get acess throw moongoose obj User it can use with
// the user get through find one in (check in login passwordCheck)