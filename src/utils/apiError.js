export default class ApiError extends Error{

    constructor(errorCode,errorMessage){
        super(errorMessage);
        this.errorCode=errorCode
    }
}