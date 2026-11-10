import { EnvironmentModel } from '../models/environment.model.js';
import { ApplicationModel } from '../models/application.model.js';
import { AuthorizationService } from '../services/authorization.service.js';
import { AppError } from '../utils/app-error.js';

export const EnvironmentController = {
  create: async (req, res) => {
    const b = req.validated.body;
    const countryId = await ApplicationModel.findCountryId(b.applicationId ?? b.application_id);
    if (!countryId) throw new AppError(404, 'Application not found', 'NOT_FOUND');
    await AuthorizationService.ensureCountry(req.user, countryId);
    res.status(201).json(await EnvironmentModel.create(b));
  },

  update: async (req, res) => {
    const id = Number(req.params.id);
    const environment = await EnvironmentModel.findById(id);
    if (!environment) throw new AppError(404, 'Environment not found', 'NOT_FOUND');
    await AuthorizationService.ensureCountry(req.user, environment.country_id);
    res.json(await EnvironmentModel.update(id, req.validated.body));
  },

  remove: async (req, res) => {
    const id = Number(req.params.id);
    const environment = await EnvironmentModel.findById(id);
    if (!environment) throw new AppError(404, 'Environment not found', 'NOT_FOUND');
    await AuthorizationService.ensureCountry(req.user, environment.country_id);
    res.json(await EnvironmentModel.remove(id));
  }
};
