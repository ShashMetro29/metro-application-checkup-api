import { ApplicationModel } from '../models/application.model.js';
import { AuthorizationService } from '../services/authorization.service.js';
import { AppError } from '../utils/app-error.js';

export const ApplicationController = {
  list: async (req, res) => {
    const id = Number(req.query.countryId);
    await AuthorizationService.ensureCountry(req.user, id);
    res.json(await ApplicationModel.listByCountry(id));
  },

  details: async (req, res) => {
    const id = Number(req.query.countryId);
    await AuthorizationService.ensureCountry(req.user, id);
    res.json(await ApplicationModel.detailsByCountry(id));
  },

  getById: async (req, res) => {
    const appId = Number(req.params.id);
    const app = await ApplicationModel.findById(appId);
    if (!app) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Application not found' } });
    }

    const countryId = app.country_id;
    await AuthorizationService.ensureCountry(req.user, Number(countryId));
    res.json(app);
  },

  create: async (req, res) => {
    const body = req.validated.body;
    await AuthorizationService.ensureCountry(req.user, body.countryId);
    res.status(201).json(await ApplicationModel.create(body));
  },

  update: async (req, res) => {
    const appId = Number(req.params.id);
    const app = await ApplicationModel.findById(appId);
    if (!app) {
      throw new AppError(404, 'Application not found', 'NOT_FOUND');
    }

    await AuthorizationService.ensureCountry(req.user, app.country_id);
    res.json(await ApplicationModel.update(appId, req.validated.body));
  },

  remove: async (req, res) => {
    const appId = Number(req.params.id);
    const app = await ApplicationModel.findById(appId);
    if (!app) {
      throw new AppError(404, 'Application not found', 'NOT_FOUND');
    }

    await AuthorizationService.ensureCountry(req.user, app.country_id);
    res.json(await ApplicationModel.remove(appId));
  }
};
