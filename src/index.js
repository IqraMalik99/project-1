import mongoose from "mongoose";
import connectDb from './db/in.js'
import dotenv from "dotenv"
import { app } from './app.js'
dotenv.config({
  path: './env'
})

connectDb()
.then(()=>{
    app.listen(process.env.PORT || 8000 ,function (){
                console.log(`app is listen on port ${process.env.PORT} `);
            });
})
.catch((err)=>{
  console.log(`Something went wrong in db ${err}`)
});




























// import { dbname } from "./constants.js";
//
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

