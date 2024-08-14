import mongoose, { Schema } from "mongoose";
const subscription = new Schema({
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    people: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
})
export {subscription}

// IN USER MODEL GET PROFILE OF ANY USER : 
// ham pehly url se username lety hn q ka hum user collection ma ha
//  tw wo match kray ga har document ma  name jo doc match ho ga then wo first lookup pipe line ma jae ga
//  .subscription ek collection ha jis ka har doc ma channel or people ha  channel and channel wale user ki id
//  aur people and jis bande na subscribe kia ha aus ki id tw jab bhi koi kisi channel ko subscribe kray ga to
//  ek doc bane ga . tw ham aur user ki id jo hame match se mili ha subscription colletcion ka har document se
//   kren ga agr to aus user ka subscriber chahiye to channnel ma check kren aur agar ya check krna ha ka aus
//bande na kis kis ko subscribe kia ha tw people ma check kren .

//   if: {$in: [req.user?._id, "$subscribers.subscriber"]}, $subscribers is an array of document so
//  how we can get directly $subscribers.subscriber i think it should be $subscribers.indexno.subscriber
//    the indexno then increment till the end of collection. code will be     :                                                                                                                                                                                                         isSubscribed: {
//   $cond: {
//             if: {
//                 $in: [
//                     req.user?._id,
//                     {
//                         $map: {
//                             input: "$subscribers",
//                             as: "sub",
//                             in: "$$sub.subscriber"
//                         }
//                     }
//                 ]
//             },
//             then: true,
//             else: false
//         }
//     }   
// we use channel[0] because aggregation return array for frontened relaxation