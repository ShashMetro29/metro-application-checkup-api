import { verifyAccessToken } from '../utils/jwt.util.js'; import { UserModel } from '../models/user.model.js'; import { AppError } from '../utils/app-error.js';
export async function authenticate(req,res,next) {
  try { const header=req.headers.authorization||''; if(!header.startsWith('Bearer ')) throw new AppError(401,'Bearer token required','UNAUTHENTICATED');
    const payload=verifyAccessToken(header.slice(7)); const user=await UserModel.findAuthById(payload.sub);
    if(!user?.is_active) throw new AppError(401,'Invalid or inactive user','UNAUTHENTICATED'); req.user=user; next();
  } catch(error) { next(error instanceof AppError?error:new AppError(401,'Invalid or expired token','UNAUTHENTICATED')); }
}
