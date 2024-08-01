import {dbname} from '../constants.js'
import mongoose from 'mongoose'
import dotenv from "dotenv"
dotenv.config({
  path: './env'
})
const connectDb= async()=>{
    try {
      let connect =  await mongoose.connect(`${process.env.MONGODB}/${dbname}`);
      console.log(connect.connection.host);
    } catch (error) {
        console.log("Cannot connect to database");
        process.exit(1);
    }
}
export  default connectDb