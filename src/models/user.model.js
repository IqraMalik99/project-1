import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
// import dotenv from "dotenv"
// dotenv.config({
//     path: "./env"
// })

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: [true, "Enter your email"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,
            required: true
        },
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: " Video"
            }
        ],
        password: {
            type: String,
            required: true
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
)
//METHODS
userSchema.methods.genAccessToken = async function () {
    console.log("1");
     const token = await  jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    },
      "accessSecret"
        // {
        //     expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        // }
    )
    console.log("22")
    return token
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        "refreshToken",
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


//MODELS
userSchema.methods.ispasswordcorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}
// MIDDLEWARE
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(this.password, salt);
            this.password = hashedPassword;
        } catch (err) {
            return next(err);
        }
    }
    next();
});

 const User = mongoose.model('User', userSchema);
 export {User}
// Other Middleware Types
// function(){}  is used because arrow does not give ref of this ,next is used
// Pre and Post Remove: Runs before or after a document is removed.
// Pre and Post Update: Runs before or after an update operation
// Pre and Post Validate: Runs before or after a document is validated.
// validator is used also in schema like : some have biltin validator like max ,min ,required
// validate: {
//     validator: function(v) {
//       return v.length >= 6; // Password must be at least 6 characters long
//     }, or like

// userSchema.pre('save', function(next) {
//     // Check if the password field has been modified
//     if (this.isModified('password')) {
//       // Perform custom validation
//       if (this.password.length < 6) {
//         // Add a validation error to the schema if the condition is not met
//         this.invalidate('password', 'Password must be at least 6 characters long.');
//       }
//       // Optionally hash the password here
//       // this.password = hashPassword(this.password); // Hypothetical hashing function
//     }
//     next(); // Continue with the save operation
//   });

// Frequently Used Middleware Types and Hooks
// save: Runs before and after a document is saved.
// remove: Runs before and after a document is removed.
// updateOne: Runs before and after an update operation.
// find and findOne: Useful for actions that need to be performed before or after finding documents.