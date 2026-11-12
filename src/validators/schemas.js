import { z } from 'zod';

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

const componentPayloadSchema = z.object({
  name: z.string().min(2),
  componentType: z.enum(['UI', 'APPLICATION_SERVER', 'NODE_SERVER', 'DATABASE', 'INTERFACE', 'SSL_CERTIFICATE', 'INSTANCE', 'OTHER']),
  endpoint: z.string().url().optional(),
  hostName: z.string().min(1).optional(),
  port: z.number().int().min(1).max(65535).optional(),
  instanceNumber: z.number().int().positive().optional(),
  technology: z.string().optional(),
  version: z.string().optional(),
  isCritical: z.boolean().default(true),
  enabled: z.boolean().default(true)
}).refine(data => data.endpoint || data.hostName, {
  message: 'endpoint or hostName is required',
  path: ['endpoint']
});

const environmentPayloadSchema = z.object({
  name: z.enum(['PRODUCTION', 'PRE_PRODUCTION']),
  baseUrl: z.string().url().optional(),
  enabled: z.boolean().default(true),
  components: z.array(componentPayloadSchema).default([])
});

export const applicationSchema = z.object({
  body: z.object({
    countryId: z.number().int().positive(),
    name: z.string().min(2),
    code: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/),
    description: z.string().optional(),
    ownerTeam: z.string().optional(),
    documentationUrl: z.string().url().optional(),
    environments: z.array(environmentPayloadSchema).default([])
  })
});

export const environmentSchema = z.object({
  body: z.object({
    applicationId: z.number().int().positive(),
    name: z.enum(['PRODUCTION', 'PRE_PRODUCTION']),
    baseUrl: z.string().url().optional(),
    enabled: z.boolean().default(true)
  })
});

export const componentSchema = z.object({
  body: z.object({
    environmentId: z.number().int().positive(),
    name: z.string().min(2),
    componentType: z.enum(['UI', 'APPLICATION_SERVER', 'NODE_SERVER', 'DATABASE', 'INTERFACE', 'SSL_CERTIFICATE', 'INSTANCE', 'OTHER']),
    endpoint: z.string().url().optional(),
    hostName: z.string().min(1).optional(),
    port: z.number().int().min(1).max(65535).optional(),
    instanceNumber: z.number().int().positive().optional(),
    technology: z.string().optional(),
    version: z.string().optional(),
    isCritical: z.boolean().default(true),
    enabled: z.boolean().default(true)
  }).refine(data => data.endpoint || data.hostName, {
    message: 'endpoint or hostName is required',
    path: ['endpoint']
  })
});
