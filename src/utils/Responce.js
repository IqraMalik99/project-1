class Responce {
    constructor(
        statusCode ,
        data="" ,
        message =""
    ){
this.data=data ;
this.message =message ;
this.statusCode = statusCode;
this.sucess = statusCode < 400
    }
}
export {Responce}