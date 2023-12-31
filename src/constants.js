export const DbName="MegaLMS"
export const mailName="ALPHA"
export const emailLimit = 4; //rate limiting on email verification
export const emailVerificationToken_expiry =(2 * 24 * 60 * 60 * 1000) //2 Days;
export const randomByteSize = 20 ; //plain verification token size

export const forgotPassword_emailLimit = 4;
export const forgotPassword_expiry = (2 * 24 * 60 * 60 * 1000) //2 Days; ;

export const imageSize = 15*1024*1024 //15mb
export const imageExtn = [".jpg", ".png"] //extensions to be allowed

