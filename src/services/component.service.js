import { ComponentModel } from '../models/component.model.js';
import { EnvironmentModel } from '../models/environment.model.js';
import { AuthorizationService } from './authorization.service.js';
import { AppError } from '../utils/app-error.js';

export const ComponentService = {
  create: async (user, b) => {
    const countryId = await EnvironmentModel.countryId(b.environmentId);
    if (!countryId) throw new AppError(404, 'Environment not found', 'NOT_FOUND');
    await AuthorizationService.ensureCountry(user, countryId);

    return ComponentModel.create({
      ...b,
      endpoint: b.endpoint || null,
      hostName: b.hostName || null,
      port: b.port ?? null,
      instanceNumber: b.instanceNumber ?? null,
      technology: b.technology || null,
      version: b.version || null,
      isCritical: b.isCritical ?? true
    });
  },

  list: async (user, environmentId) => {
    const countryId = await EnvironmentModel.countryId(environmentId);
    if (!countryId) throw new AppError(404, 'Environment not found', 'NOT_FOUND');
    await AuthorizationService.ensureCountry(user, countryId);
    return ComponentModel.list(environmentId);
  }
};
