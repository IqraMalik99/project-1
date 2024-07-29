class ApiError extends Error{
    constructor(
        statusCode,
        message="Something went wrong",
        errors=[],
        stack=""
    ){
        super(message);
        this.errors=errors;
        this.message=message;
        this.statusCode=statusCode;
        if(stack){
            this.stack=stack;
        }else{
            Error.captureStackTrace(this,this.constructor)
        }

    }
}
export {ApiError}



// ||||||||||||||||||||||  STILL NEED TO UNDERSTAND WHY WE USE 2 PARAMETER IN CAPTURESTACKTRACE   ||||||||||||||||
/*  super constructor (error class ) has can give error message and cause , we can give another error in the cause  
like this                       const cause = new Error('Underlying issue');
                                const err = new Error('Something went wrong', { cause });
                                console.log(err.cause.message); 
                                Error.captureStackTrace(targetObject[, constructorOpt])
ConstructorOpt (optional): A function. If provided, all frames above this function, including 
this function, will be omitted from the generated stack trace.    The constructorOpt parameter 
is an optional argument for Error.captureStackTrace. When you pass a function to it, the stack
trace generated will exclude that function and any functions called above it. This helps to hide 
implementation details from the stack trace, making it easier to debug by showing only the relevant 
parts of the stack trace.
                                */