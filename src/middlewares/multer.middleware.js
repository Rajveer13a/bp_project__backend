import path from "path";
import multer from "multer";

function multerfunc(fileSize,allowedfile){
    const upload=multer({
        dest: "uploads",
        limits: {fileSize}, //fileSize:15*1024*1024
        storage: multer.diskStorage({
            destination:"public/",
            filename:(_req,file,cb)=>{
                const uniqueStr= Date.now() + '-' + Math.round(Math.random() * 1E9)
                cb(null, (uniqueStr + "-"+file.originalname) );
            },
        }),
        fileFilter: (_req,file,cb)=>{
            let ext=path.extname(file.originalname);
            if( !(allowedfile.includes(ext)) ){//ext!==".jpg" && ext!==".png"
                cb(new Error(`unsupported file type ${ext}`),false);
                return;
            }
            
            cb(null,true);
    
        }
    });

    return upload;
} 

export default multerfunc;