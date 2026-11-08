import { AuthorizationModel } from '../models/authorization.model.js'; import { AppError } from '../utils/app-error.js';
export const AuthorizationService={
 hasAnyPermission:async(userId,codes)=>(await AuthorizationModel.permissions(userId,codes)).length>0,
 ensureCountry:async(user,countryId)=>{if(user.is_superuser)return true;if(!(await AuthorizationModel.countryAccess(user.id,countryId)))throw new AppError(403,'No access to this country','COUNTRY_FORBIDDEN');return true;}
};
