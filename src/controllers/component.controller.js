import { ComponentService } from '../services/component.service.js';
import { ComponentModel } from '../models/component.model.js';
import { EnvironmentModel } from '../models/environment.model.js';
import { AuthorizationService } from '../services/authorization.service.js';
import { AppError } from '../utils/app-error.js';

export const ComponentController = {
  create: async (req, res) => {
    res.status(201).json(await ComponentService.create(req.user, req.validated.body));
  },

  list: async (req, res) => {
    res.json(await ComponentService.list(req.user, Number(req.query.environmentId)));
  },

  update: async (req, res) => {
    const id = Number(req.params.id);
    const component = await ComponentModel.findById(id);
    if (!component) {
      throw new AppError(404, 'Component not found', 'NOT_FOUND');
    }

    const countryId = await EnvironmentModel.countryId(component.environment_id);
    await AuthorizationService.ensureCountry(req.user, countryId);
    res.json(await ComponentModel.update(id, req.validated.body));
  },

  remove: async (req, res) => {
    const id = Number(req.params.id);
    const component = await ComponentModel.findById(id);
    if (!component) {
      throw new AppError(404, 'Component not found', 'NOT_FOUND');
    }

    const countryId = await EnvironmentModel.countryId(component.environment_id);
    await AuthorizationService.ensureCountry(req.user, countryId);
    res.json(await ComponentModel.remove(id));
  }
};
