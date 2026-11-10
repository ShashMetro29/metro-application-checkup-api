import { z } from 'zod';

const environmentMap = {
  PROD: 'PRODUCTION',
  PRODUCTION: 'PRODUCTION',
  PRE_PROD: 'PRE_PRODUCTION',
  PRE_PRODUCTION: 'PRE_PRODUCTION'
};

const normalizeEnvironmentName = value => {
  const normalized = String(value || '').trim().toUpperCase();
  return environmentMap[normalized] || normalized;
};

const componentTypeMap = {
  API: 'APPLICATION_SERVER',
  APP: 'APPLICATION_SERVER',
  APPLICATION: 'APPLICATION_SERVER',
  APP_SERVER: 'APPLICATION_SERVER',
  SERVER: 'APPLICATION_SERVER',
  DB: 'DATABASE',
  DATABASE: 'DATABASE',
  SQL: 'DATABASE',
  MQ: 'INTERFACE',
  MESSAGE_BROKER: 'INTERFACE',
  BROKER: 'INTERFACE',
  MESSAGE_QUEUE: 'INTERFACE',
  UI: 'UI',
  WEB: 'UI',
  FRONTEND: 'UI',
  NODE: 'NODE_SERVER',
  NODE_SERVER: 'NODE_SERVER',
  SSL: 'SSL_CERTIFICATE',
  CERTIFICATE: 'SSL_CERTIFICATE',
  INSTANCE: 'INSTANCE',
  OTHER: 'OTHER'
};

const normalizeComponentType = value => {
  const normalized = String(value || '').trim().toUpperCase().replace(/[-\s]+/g, '_');
  return componentTypeMap[normalized] || normalized;
};

const environmentNameSchema = z.union([
  z.enum(['PRODUCTION', 'PRE_PRODUCTION']),
  z.string().trim().transform(value => normalizeEnvironmentName(value)).refine(value => ['PRODUCTION', 'PRE_PRODUCTION'].includes(value), { message: 'Environment name must be PRODUCTION or PRE_PRODUCTION' })
]);

const componentTypeSchema = z.union([
  z.enum(['UI', 'APPLICATION_SERVER', 'NODE_SERVER', 'DATABASE', 'INTERFACE', 'SSL_CERTIFICATE', 'INSTANCE', 'OTHER']),
  z.string().trim().transform(value => normalizeComponentType(value)).refine(value => ['UI', 'APPLICATION_SERVER', 'NODE_SERVER', 'DATABASE', 'INTERFACE', 'SSL_CERTIFICATE', 'INSTANCE', 'OTHER'].includes(value), { message: 'componentType must be a valid inventory type' })
]);

const componentPayloadBaseSchema = z.object({
  name: z.string().trim().min(2),
  componentType: componentTypeSchema,
  endpoint: z.string().trim().url().optional(),
  hostName: z.string().trim().min(1).optional(),
  port: z.coerce.number().int().min(1).max(65535).optional(),
  instanceNumber: z.coerce.number().int().positive().optional(),
  technology: z.string().trim().optional(),
  version: z.string().trim().optional(),
  isCritical: z.boolean().default(true),
  enabled: z.boolean().default(true),
  component_type: z.string().trim().optional(),
  host_name: z.string().trim().min(1).optional(),
  instance_number: z.coerce.number().int().positive().optional(),
  is_critical: z.boolean().optional(),
  _id: z.any().optional()
});

const componentPayloadSchema = componentPayloadBaseSchema.refine(data => data.endpoint || data.hostName || data.host_name, {
  message: 'endpoint or hostName is required',
  path: ['endpoint']
}).transform(data => ({
  name: data.name,
  componentType: data.componentType || normalizeComponentType(data.component_type || 'OTHER'),
  endpoint: data.endpoint || null,
  hostName: data.hostName || data.host_name || null,
  port: data.port ?? null,
  instanceNumber: data.instanceNumber ?? data.instance_number ?? null,
  technology: data.technology || null,
  version: data.version || null,
  isCritical: data.isCritical ?? data.is_critical ?? true,
  enabled: data.enabled ?? true
}));

const componentPatchPayloadSchema = componentPayloadBaseSchema.partial().transform(data => {
  const result = {};

  if (data.name !== undefined) result.name = data.name;
  if (data.componentType !== undefined) result.componentType = data.componentType;
  else if (data.component_type) result.componentType = normalizeComponentType(data.component_type);

  if (data.endpoint !== undefined) result.endpoint = data.endpoint;
  if (data.hostName !== undefined) result.hostName = data.hostName;
  else if (data.host_name !== undefined) result.hostName = data.host_name;

  if (data.port !== undefined) result.port = data.port;
  if (data.instanceNumber !== undefined) result.instanceNumber = data.instanceNumber;
  else if (data.instance_number !== undefined) result.instanceNumber = data.instance_number;

  if (data.technology !== undefined) result.technology = data.technology;
  if (data.version !== undefined) result.version = data.version;
  if (data.isCritical !== undefined) result.isCritical = data.isCritical;
  else if (data.is_critical !== undefined) result.isCritical = data.is_critical;
  if (data.enabled !== undefined) result.enabled = data.enabled;

  return result;
});

const environmentPayloadBaseSchema = z.object({
  applicationId: z.coerce.number().int().positive().optional(),
  application_id: z.coerce.number().int().positive().optional(),
  name: environmentNameSchema,
  baseUrl: z.string().trim().url().optional(),
  base_url: z.string().trim().url().optional(),
  enabled: z.boolean().default(true),
  components: z.array(componentPayloadSchema).optional(),
  _id: z.any().optional()
});

const environmentPayloadSchema = environmentPayloadBaseSchema.transform(data => ({
  applicationId: data.applicationId ?? data.application_id ?? null,
  name: normalizeEnvironmentName(data.name),
  baseUrl: data.baseUrl || data.base_url || null,
  enabled: data.enabled ?? true,
  components: data.components || []
}));

const environmentPatchPayloadSchema = environmentPayloadBaseSchema.partial().transform(data => ({
  applicationId: data.applicationId ?? data.application_id ?? undefined,
  name: data.name ? normalizeEnvironmentName(data.name) : undefined,
  baseUrl: data.baseUrl ?? data.base_url ?? undefined,
  enabled: data.enabled ?? undefined,
  components: data.components || undefined
}));

const applicationCoreBaseSchema = z.object({
  countryId: z.coerce.number().int().positive().optional(),
  country_id: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(2),
  code: z.string().trim().regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/),
  description: z.string().trim().optional(),
  ownerTeam: z.string().trim().optional(),
  owner_team: z.string().trim().optional(),
  documentationUrl: z.string().trim().url().optional(),
  documentation_url: z.string().trim().url().optional(),
  isActive: z.boolean().default(true),
  is_active: z.boolean().optional(),
  environments: z.array(environmentPayloadSchema).optional(),
  _id: z.any().optional()
});

const applicationCoreSchema = applicationCoreBaseSchema.transform(data => ({
  countryId: data.countryId ?? data.country_id,
  name: data.name,
  code: data.code,
  description: data.description || null,
  ownerTeam: data.ownerTeam || data.owner_team || null,
  documentationUrl: data.documentationUrl || data.documentation_url || null,
  isActive: data.isActive ?? data.is_active ?? true,
  environments: data.environments || []
}));

const applicationPatchPayloadSchema = applicationCoreBaseSchema.partial().transform(data => ({
  countryId: data.countryId ?? data.country_id ?? undefined,
  name: data.name || undefined,
  code: data.code || undefined,
  description: data.description ?? undefined,
  ownerTeam: data.ownerTeam ?? data.owner_team ?? undefined,
  documentationUrl: data.documentationUrl ?? data.documentation_url ?? undefined,
  isActive: data.isActive ?? data.is_active ?? undefined,
  environments: data.environments || undefined
}));

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    password: z.string().min(8)
  })
});

export const signupSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    password: z.string().min(8),
    display_name: z.string().trim().min(2).optional(),
    displayName: z.string().trim().min(2).optional(),
    countryId: z.coerce.number().int().positive().optional(),
    country_id: z.coerce.number().int().positive().optional()
  }).refine(data => data.display_name || data.displayName, {
    message: 'display_name is required',
    path: ['display_name']
  }).refine(data => data.countryId || data.country_id, {
    message: 'countryId is required',
    path: ['countryId']
  }).transform(data => ({
    email: data.email,
    password: data.password,
    displayName: data.display_name || data.displayName,
    countryId: data.countryId ?? data.country_id
  }))
});

export const applicationSchema = z.object({
  body: applicationCoreSchema
});

export const applicationUpdateSchema = z.object({
  body: applicationPatchPayloadSchema
});

export const environmentSchema = z.object({
  body: environmentPayloadSchema
});

export const environmentUpdateSchema = z.object({
  body: environmentPatchPayloadSchema
});

export const componentSchema = z.object({
  body: componentPayloadSchema
});

export const componentUpdateSchema = z.object({
  body: componentPatchPayloadSchema
});
