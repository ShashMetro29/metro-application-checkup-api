import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import { CountryController } from '../controllers/country.controller.js';
import { ApplicationController } from '../controllers/application.controller.js';
import { EnvironmentController } from '../controllers/environment.controller.js';
import { ComponentController } from '../controllers/component.controller.js';
import { applicationSchema, environmentSchema, componentSchema } from '../validators/schemas.js';

const r = Router();

r.use(authenticate);

r.get('/countries', authorize('VIEW_COUNTRY'), asyncHandler(CountryController.list));
r.get('/applications', authorize('VIEW_APPLICATION'), asyncHandler(ApplicationController.list));
r.get('/applications/details', authorize('VIEW_APPLICATION'), asyncHandler(ApplicationController.details));
r.get('/applications/:id', authorize('VIEW_APPLICATION'), asyncHandler(ApplicationController.getById));
r.post('/applications', authorize('MANAGE_APPLICATION'), validate(applicationSchema), asyncHandler(ApplicationController.create));
r.post('/environments', authorize('MANAGE_ENVIRONMENT'), validate(environmentSchema), asyncHandler(EnvironmentController.create));
r.get('/components', authorize('VIEW_COMPONENT'), asyncHandler(ComponentController.list));
r.post('/components', authorize('MANAGE_COMPONENT'), validate(componentSchema), asyncHandler(ComponentController.create));

export default r;
