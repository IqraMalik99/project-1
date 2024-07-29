import mongoose from "mongoose";
import connectDb from './db/in.js'


connectDb();




























// import { dbname } from "./constants.js";
// import express from "express"
// import dotenv from "dotenv"
// dotenv.config({
//   path: './env'
// })
// const app = express();

// ;(async ()=>{
//   try {
//    let connect = await mongoose.connect(`${process.env.MONGODB}/${dbname}`);
//    console.log(connect.connection.host + "    Host name is here ????")
//     app.on("error",(error)=>{
//         console.log(`Having error in app.on :${error}`);
//         throw error
//     });
//     app.listen(8000,function (){
//         console.log(`app is listen on port ${process.env.PORT} `);
//     });
//   } catch (error) {
//     console.error(`having error in connect  :${error}`)
//   }
// })()

