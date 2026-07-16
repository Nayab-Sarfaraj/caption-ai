import { z } from 'zod'
import { COMPOSITION_IDS, FONT_VALUES } from '@/src/helpers/style-options'

export const uploadRequestSchema = z.object({
  filename: z.string().max(255),
  contentType: z.enum(['video/mp4', 'video/quicktime']),
  fileSize: z.number().positive().max(500 * 1024 * 1024), // 500MB
})

export const captionUploadSchema = z.object({
  jobId: z.string().min(1),
  content: z.string().min(1),
  filename: z.string().min(1),
})

// Max 10 files per batch — keeps the daily-upload-cap check and presign loop bounded.
export const batchUploadRequestSchema = z.object({
  files: z.array(uploadRequestSchema).min(1).max(10),
})

// Single source of truth for composition ids / hex colors / fonts — shared by
// job.controller.ts (render trigger) and brand-kit.controller.ts (defaults).
// Redeclaring these per-file lets them drift as compositions are added.
export const compositionIdSchema = z.enum(COMPOSITION_IDS)
export const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/)
export const fontFamilySchema = z.enum(FONT_VALUES)

export const jobConfirmSchema = z.object({
  jobId: z.string().min(1),
  compositionId: compositionIdSchema.optional(),
  width: z.number().positive().int().max(7680).optional(),
  height: z.number().positive().int().max(7680).optional(),
})

// Each field nullable (explicit clear) + optional (omit = leave untouched by $set).
export const brandKitSchema = z.object({
  fontFamily: fontFamilySchema.nullable().optional(),
  activeColor: hexColorSchema.nullable().optional(),
  textColor: hexColorSchema.nullable().optional(),
  accentColor: hexColorSchema.nullable().optional(),
  defaultCompositionId: compositionIdSchema.nullable().optional(),
})

export const billingTierSchema = z.enum(['weekly', 'monthly', 'yearly'])

export const createCheckoutSchema = z.object({
  tier: billingTierSchema,
})

export const supportMessageSchema = z.object({
  type: z.enum(['bug', 'feedback', 'other']),
  message: z.string().min(10).max(5000),
  email: z.string().email(),
})

export type UploadRequest = z.infer<typeof uploadRequestSchema>
