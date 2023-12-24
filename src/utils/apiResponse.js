export default class apiResponse{

    constructor(message,data,success=true){
        this.success=success;
        this.message=message;
        this.data=data;
    }
}