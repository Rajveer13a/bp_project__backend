export const DbName="MegaLMS"
export const mailName="ALPHA"
export const emailLimit = 1; //rate limiting on email verification
// export const emailVerificationToken_expiry =(2 * 24 * 60 * 60 * 1000) //2 Days;
export const emailVerificationToken_expiry =(  60 * 1000) //2 Days;
export const randomByteSize = 20 ; //plain verification token size

export const forgotPassword_emailLimit = 4;
export const forgotPassword_expiry = (2 * 24 * 60 * 60 * 1000) //2 Days; ;

export const imageSize = 15*1024*1024 //15mb
export const imageExtn = [".jpg", ".png"] //extensions to be allowed

export const profileImgConfig = {
    resource_type:"image",
    folder: 'udemy/udemy-profile',
    width: 512,
    height: 512,
    gravity: 'faces',
    crop: 'fill'
}; //for cloudinary

export const thumbnailImgConfig = {
    resource_type:"image",
    folder: 'udemy/udemy-thumbnail',
    width: 1080,
    height: 720,
    crop: 'fill'
}; //for cloudinary


export const videoSize = 400*1024*1024 //400mb
export const videoExtn = [".mp4", ".mkv"] //extensions to be allowed

export const fileSize = 400*1024*1024 //400mb
export const fileExtn = [".pdf", ".doc"] //extensions to be allowed


export const ourComission = 2 / 100 ; //2 percent  

export const mintranferAmount = 10000 ; 

export const payrollDate = [1,2,3,23] ; //payrolls execution date


export const priceList = [// Free
    400,
    799,
    1199,
    1499,
    1699,
    1799,
    1999,
    2299,
    2499,
    2699,
    2799,
    2899]; //allowed course prices

export const ageCookie = 3 * 24 * 60 * 60 * 1000 // Cookie expires in 7 days
