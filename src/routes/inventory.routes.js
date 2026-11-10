import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import { CountryController } from '../controllers/country.controller.js';
import { ApplicationController } from '../controllers/application.controller.js';
import { EnvironmentController } from '../controllers/environment.controller.js';
import { ComponentController } from '../controllers/component.controller.js';
import { applicationSchema, applicationUpdateSchema, environmentSchema, environmentUpdateSchema, componentSchema, componentUpdateSchema } from '../validators/schemas.js';

const r = Router();

r.use(authenticate);

r.get('/countries', authorize('VIEW_COUNTRY'), asyncHandler(CountryController.list));
r.get('/applications', authorize('VIEW_APPLICATION'), asyncHandler(ApplicationController.list));
r.get('/applications/details', authorize('VIEW_APPLICATION'), asyncHandler(ApplicationController.details));
r.get('/applications/:id', authorize('VIEW_APPLICATION'), asyncHandler(ApplicationController.getById));
r.post('/applications', authorize('MANAGE_APPLICATION'), validate(applicationSchema), asyncHandler(ApplicationController.create));
r.patch('/applications/:id', authorize('MANAGE_APPLICATION'), validate(applicationUpdateSchema), asyncHandler(ApplicationController.update));
r.delete('/applications/:id', authorize('MANAGE_APPLICATION'), asyncHandler(ApplicationController.remove));
r.post('/environments', authorize('MANAGE_ENVIRONMENT'), validate(environmentSchema), asyncHandler(EnvironmentController.create));
r.patch('/environments/:id', authorize('MANAGE_ENVIRONMENT'), validate(environmentUpdateSchema), asyncHandler(EnvironmentController.update));
r.delete('/environments/:id', authorize('MANAGE_ENVIRONMENT'), asyncHandler(EnvironmentController.remove));
r.get('/components', authorize('VIEW_COMPONENT'), asyncHandler(ComponentController.list));
r.post('/components', authorize('MANAGE_COMPONENT'), validate(componentSchema), asyncHandler(ComponentController.create));
r.patch('/components/:id', authorize('MANAGE_COMPONENT'), validate(componentUpdateSchema), asyncHandler(ComponentController.update));
r.delete('/components/:id', authorize('MANAGE_COMPONENT'), asyncHandler(ComponentController.remove));

export default r;
