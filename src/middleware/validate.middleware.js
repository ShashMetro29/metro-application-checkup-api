import { AppError } from '../utils/app-error.js';
export const validate=schema=>(req,res,next)=>{const result=schema.safeParse({body:req.body,params:req.params,query:req.query});if(!result.success)return next(new AppError(400,result.error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; '),'VALIDATION_ERROR'));req.validated=result.data;next();};
