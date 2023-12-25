class ApiErrorClass extends Error{

    constructor(errorCode,errorMessage){
        super(errorMessage);
        this.errorCode=errorCode
    }
}

export default function apiError(errorCode,errorMessage){
    throw new ApiErrorClass(errorCode,errorMessage)
}