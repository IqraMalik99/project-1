//  I DONOT UNDESTAND IT SO THATS WHY I DONOT WRITE IT
const AsyncHandler = (func)=>{
    return  (req,res,next)=>{
        Promise.resolve(func(req,res,next)).catch((err)=> next(err))
    }
}

export {AsyncHandler}