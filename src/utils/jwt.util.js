import jwt from 'jsonwebtoken'; 
import { env } from '../config/env.js';
export const createAccessToken = user => jwt.sign({sub:String(user.id),email:user.email},env.JWT_ACCESS_SECRET,{algorithm:'HS256',expiresIn:env.ACCESS_TOKEN_TTL,issuer:env.JWT_ISSUER,audience:env.JWT_AUDIENCE});
export const verifyAccessToken = token => jwt.verify(token,env.JWT_ACCESS_SECRET,{algorithms:['HS256'],issuer:env.JWT_ISSUER,audience:env.JWT_AUDIENCE});
