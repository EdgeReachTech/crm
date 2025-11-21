import { z } from "zod";

// Common fields schema
export const commonFields = {
  id: z.string(),
  tenant_id: z.string().uuid(),
  created_at: z.string().transform((str) => new Date(str)),
  updated_at: z.string().transform((str) => new Date(str)),
};

// User Schema - Updated to match new migration
export const userSchema = z.object({
  ...commonFields,
  firebase_uid: z.string().optional().nullable(),
  email: z.string().email(),
  first_name: z.string().nullable().transform(val => val || ''),
  last_name: z.string().nullable().transform(val => val || ''),
  role: z.enum(['manager', 'sales_rep']).default('sales_rep'),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
  profile_image: z.string().url().optional().nullable(),
  monthly_quota: z.number().default(0),
  yearly_quota: z.number().default(0),
  current_revenue: z.number().default(0),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    notification_settings: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      digest_frequency: z.enum(['never', 'daily', 'weekly']).default('daily'),
      follow_ups: z.boolean().default(true),
      deal_updates: z.boolean().default(true),
    }).optional(),
    working_hours: z.object({
      start: z.string().default('09:00'),
      end: z.string().default('17:00'),
      timezone: z.string().default('UTC'),
    }).optional(),
    default_dashboard: z.string().optional().nullable(),
  }).optional(),
  quota: z.object({
    leads: z.number().optional(),
    revenue: z.number().optional(),
    period: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
  }).optional(),
});

export type User = z.infer<typeof userSchema>;

// Auth Validation Schemas
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    role: z.enum(['manager', 'sales_rep']).default('sales_rep'),
    tenant_id: z.string().uuid().optional(),
    idToken: z.string().optional(), // For Firebase-based registration
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    first_name: z.string().min(1).optional(),
    last_name: z.string().min(1).optional(),
    avatar_url: z.string().url().optional(),
    role: z.enum(['manager', 'sales_rep']).optional(),
    preferences: z.object({
      theme: z.enum(['light', 'dark', 'system']).optional(),
      notification_settings: z.object({
        email: z.boolean().optional(),
        push: z.boolean().optional(),
        digest_frequency: z.enum(['never', 'daily', 'weekly']).optional(),
      }).optional(),
      default_dashboard: z.string().optional(),
    }).optional(),
  })
});

// Lead Schema - Updated for new sales CRM structure
// Lead Schema - Updated for new sales CRM structure
export const leadSchema = z.object({
  ...commonFields,
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  company: z.string().min(1),
  phone: z.string().optional(),
  title: z.string().optional(),
  // source: z.enum(['website', 'linkedin', 'referral', 'cold_outreach', 'event', 'partner', 'other']),
  // source_details: z.string().optional(),
  // title: z.string().optional(),
  source: z.enum(['website', 'linkedin', 'referral', 'cold_outreach', 'event', 'partner', 'other']),
  source_details: z.string().optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'unqualified']),
  interest_level: z.enum(['hot', 'warm', 'cold']).default('cold'),
  qualification_status: z.enum(['unqualified', 'marketing_qualified', 'sales_qualified']).default('unqualified'),
  score: z.number().min(0).max(100),
  budget_range: z.string().optional(),
  timeline: z.string().optional(),
  pain_points: z.string().optional(),
  current_stage_id: z.string().uuid().optional().nullable(),
  decision_maker_contact: z.string().uuid().optional().nullable(),
  next_follow_up: z.string().transform(str => new Date(str)).optional(),
  converted_to_opportunity: z.boolean().default(false),
  conversion_date: z.string().nullable().optional()
    .transform(str => str ? new Date(str) : null),
  owner_id: z.string().uuid(),
  notes: z.string().optional(),
  last_contacted: z.string().transform(str => new Date(str)).optional(),
  // last_contacted: z.string().transform(str => new Date(str)).optional(),
});

export type Lead = z.infer<typeof leadSchema>;

export const updateLeadSchema = leadSchema
  .omit({
    id: true,
    tenant_id: true,
    created_at: true,
    updated_at: true,
  })
  .partial();

// Opportunity Schema - Enhanced for sales CRM
// Opportunity Schema - Enhanced for sales CRM
export const opportunitySchema = z.object({
  ...commonFields,
  name: z.string().min(1),
  description: z.string().optional(),
  value: z.number().min(0),
  stage: z.enum(['qualified', 'discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
  current_stage_id: z.string().uuid().optional(),
  probability: z.number().min(0).max(100),
  expected_close_date: z.string().transform(str => new Date(str)),
  actual_close_date: z.string().transform(str => new Date(str)).optional(),
  account_id: z.string().uuid().optional(),
  primary_contact_id: z.string().uuid().optional(),
  lead_id: z.string().uuid(),
  owner_id: z.string().uuid(),
  sales_process: z.string().optional(),
  budget_confirmed: z.boolean().default(false),
  authority_identified: z.boolean().default(false),
  need_established: z.boolean().default(false),
  timeline_defined: z.boolean().default(false),
  competitors: z.array(z.string()).optional(),
  pricing_strategy: z.string().optional(),
  discount_percentage: z.number().min(0).max(100).default(0),
  outcome: z.enum(['won', 'lost', 'no_decision']).optional(),
  lost_reason: z.string().optional(),
  lost_to_competitor: z.string().optional(),
  next_follow_up: z.string().transform(str => new Date(str)).optional(),
  notes: z.string().optional(),
  last_activity_date: z.string().transform(str => new Date(str)).optional(),
});

export type Opportunity = z.infer<typeof opportunitySchema>;

// Contact Schema - Enhanced for sales process
export const contactSchema = z.object({
  ...commonFields,
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(['decision_maker', 'influencer', 'evaluator', 'gatekeeper', 'end_user']),
  title: z.string().optional(),
  account_id: z.string().uuid(),
  is_primary_contact: z.boolean().default(false),
  authority_level: z.enum(['low', 'medium', 'high']).default('low'),
  budget_influence: z.boolean().default(false),
  last_contacted: z.string().transform(str => new Date(str)).optional(),
  contact_preference: z.enum(['email', 'phone', 'meeting', 'no_contact']).default('email'),
  opt_out: z.boolean().default(false),
  last_activity_date: z.string().transform(str => new Date(str)).optional(),
  preferences: z.object({
    email_marketing: z.boolean().default(true),
    newsletter: z.boolean().default(true),
    communication_frequency: z.enum(['daily', 'weekly', 'monthly', 'none']).default('weekly'),
  }).optional(),
  encrypted_fields: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
});

export type Contact = z.infer<typeof contactSchema>;

// Account Schema - Enhanced for sales CRM
export const accountSchema = z.object({
  ...commonFields,
  name: z.string().min(1),
  industry: z.string(),
  website: z.string().url().optional(),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']),
  employee_count: z.number().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  total_revenue: z.number().default(0),
  last_activity_date: z.string().transform(str => new Date(str)).optional(),
  relationship_status: z.enum(['prospect', 'client', 'partner', 'inactive']).default('prospect'),
  parent_account_id: z.string().uuid().optional(),
  annual_revenue: z.number().optional(),
  owner_id: z.string().uuid(),
});

export type Account = z.infer<typeof accountSchema>;

// Marketing Campaign Schema
export const campaignSchema = z.object({
  ...commonFields,
  name: z.string().min(1),
  type: z.enum([
    "email",
    "newsletter",
    "nurture",
    "webinar",
    "social",
    "event",
  ]),
  status: z.enum([
    "draft",
    "scheduled",
    "active",
    "paused",
    "completed",
    "cancelled",
  ]),
  owner_id: z.string().uuid(),
  description: z.string().optional(),
  start_date: z.date(),
  end_date: z.date().optional(),
  budget: z.number().min(0).optional(),
  segment: z.object({
    filters: z.array(
      z.object({
        field: z.string(),
        operator: z.enum([
          "equals",
          "not_equals",
          "contains",
          "not_contains",
          "greater_than",
          "less_than",
        ]),
        value: z.any(),
      })
    ),
  }),
  template: z.object({
    subject: z.string(),
    content: z.string(),
    variables: z.array(z.string()).optional(),
  }),
  metrics: z
    .object({
      sent: z.number().default(0),
      opened: z.number().default(0),
      clicked: z.number().default(0),
      converted: z.number().default(0),
      revenue: z.number().default(0),
    })
    .optional(),
  settings: z
    .object({
      track_opens: z.boolean().default(true),
      track_clicks: z.boolean().default(true),
      schedule_type: z.enum(["immediate", "scheduled", "recurring"]).optional(),
      schedule_config: z
        .object({
          frequency: z.enum(["once", "daily", "weekly", "monthly"]).optional(),
          time: z.string().optional(), // HH:mm format
          days: z.array(z.number().min(0).max(6)).optional(), // 0-6 for Sunday-Saturday
        })
        .optional(),
    })
    .optional(),
  utm: z
    .object({
      source: z.string(),
      medium: z.string(),
      campaign: z.string(),
      term: z.string().optional(),
      content: z.string().optional(),
    })
    .optional(),
  target_audience: z.array(z.string()).optional(),
});

export type Campaign = z.infer<typeof campaignSchema>;

// Sales Stages Schema - New table from migration
export const salesStageSchema = z.object({
  ...commonFields,
  name: z.string().min(1),
  stage_order: z.number(),
  stage_type: z.enum(['lead', 'prospect', 'opportunity', 'client']),
  probability_weight: z.number().min(0).max(100).default(0),
  is_active: z.boolean().default(true),
});

export type SalesStage = z.infer<typeof salesStageSchema>;

// Activities Schema - New table from migration
export const activitySchema = z.object({
  ...commonFields,
  title: z.string().min(1),
  description: z.string().optional(),
  activity_type: z.enum(['call', 'email', 'meeting', 'demo', 'proposal', 'follow_up', 'note']),
  activity_date: z.string().transform(str => new Date(str)),
  duration_minutes: z.number().optional(),
  outcome: z.enum(['positive', 'neutral', 'negative', 'no_response']).optional(),
  owner_id: z.string().uuid(),
  lead_id: z.string().uuid().optional(),
  opportunity_id: z.string().uuid().optional(),
  contact_id: z.string().uuid().optional(),
  account_id: z.string().uuid().optional(),
  is_completed: z.boolean().default(false),
  calendar_event_id: z.string().optional(),
  follow_up_required: z.boolean().default(false),
  next_action: z.string().optional(),
  notes: z.string().optional(),
});

export type Activity = z.infer<typeof activitySchema>;

// Follow-ups Schema - New table from migration
export const followUpSchema = z.object({
  ...commonFields,
  title: z.string().min(1),
  description: z.string().optional(),
  due_date: z.string().transform(str => new Date(str)),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  owner_id: z.string().uuid(),
  lead_id: z.string().uuid().optional(),
  opportunity_id: z.string().uuid().optional(),
  contact_id: z.string().uuid().optional(),
  account_id: z.string().uuid().optional(),
  calendar_event_id: z.string().optional(),
  reminder_minutes: z.number().default(15),
  completed_at: z.string().transform(str => new Date(str)).optional(),
  completed_activity_id: z.string().uuid().optional(),
});

export type FollowUp = z.infer<typeof followUpSchema>;

// Revenue Tracking Schema - New table from migration
export const revenueTrackingSchema = z.object({
  ...commonFields,
  opportunity_id: z.string().uuid(),
  sales_rep_id: z.string().uuid(),
  revenue_amount: z.number().min(0),
  revenue_date: z.string().transform(str => new Date(str)),
  revenue_type: z.enum(['new_business', 'upsell', 'renewal', 'expansion']).default('new_business'),
  commission_rate: z.number().min(0).max(1).default(0),
  commission_amount: z.number().default(0),
  revenue_month: z.number().min(1).max(12),
  revenue_quarter: z.number().min(1).max(4),
  revenue_year: z.number(),
});

export type RevenueTracking = z.infer<typeof revenueTrackingSchema>;

// Sales Targets Schema - New table from migration
export const salesTargetSchema = z.object({
  ...commonFields,
  sales_rep_id: z.string().uuid(),
  target_period: z.enum(['monthly', 'quarterly', 'yearly']),
  target_year: z.number(),
  target_month: z.number().min(1).max(12).optional(),
  target_quarter: z.number().min(1).max(4).optional(),
  revenue_target: z.number().min(0),
  deals_target: z.number().default(0),
  activities_target: z.number().default(0),
  actual_revenue: z.number().default(0),
  actual_deals: z.number().default(0),
  actual_activities: z.number().default(0),
  target_progress: z.number().min(0).max(100).default(0),
});

export type SalesTarget = z.infer<typeof salesTargetSchema>;

// Manager Comments Schema - New table from migration
export const managerCommentSchema = z.object({
  ...commonFields,
  manager_id: z.string().uuid(),
  sales_rep_id: z.string().uuid(),
  comment_type: z.enum(['coaching', 'feedback', 'approval', 'instruction']),
  comment: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  lead_id: z.string().uuid().optional(),
  opportunity_id: z.string().uuid().optional(),
  activity_id: z.string().uuid().optional(),
  is_read: z.boolean().default(false),
  read_at: z.string().transform(str => new Date(str)).optional(),
  requires_action: z.boolean().default(false),
  action_completed: z.boolean().default(false),
});

export type ManagerComment = z.infer<typeof managerCommentSchema>;

// Email Templates Schema - New table from migration
export const emailTemplateSchema = z.object({
  ...commonFields,
  name: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
  template_type: z.enum(['initial_contact', 'follow_up', 'proposal', 'thank_you', 'closing', 'lost_deal']),
  is_active: z.boolean().default(true),
  created_by: z.string().uuid().optional(),
  variables: z.array(z.string()).default(['first_name', 'last_name', 'company']),
});

export type EmailTemplate = z.infer<typeof emailTemplateSchema>;

// Client Interactions Schema - New table from migration
export const clientInteractionSchema = z.object({
  ...commonFields,
  client_account_id: z.string().uuid(),
  interaction_type: z.enum(['onboarding', 'support', 'upsell', 'renewal', 'feedback', 'complaint']),
  interaction_date: z.string().default(() => new Date().toISOString()).transform(str => new Date(str)),
  description: z.string().min(1),
  outcome: z.enum(['positive', 'neutral', 'negative', 'pending']).optional(),
  owner_id: z.string().uuid(),
  follow_up_required: z.boolean().default(false),
  satisfaction_score: z.number().min(1).max(5).optional(),
});

export type ClientInteraction = z.infer<typeof clientInteractionSchema>;



// Tenant Schema
export const tenantSchema = z.object({
  ...commonFields,
  name: z.string().min(1),
  domain: z.string(),
  settings: z.object({
    branding: z.object({
      logo_url: z.string().url().optional(),
      primary_color: z.string().optional(),
      secondary_color: z.string().optional(),
      favicon_url: z.string().url().optional(),
    }),
    features: z.object({
      marketing_automation: z.boolean().default(true),
      lead_scoring: z.boolean().default(true),
      api_access: z.boolean().default(false),
      multi_currency: z.boolean().default(false),
      custom_fields: z.boolean().default(false),
    }),
    security: z.object({
      mfa_required: z.boolean().default(false),
      password_expiry_days: z.number().optional(),
      session_timeout_minutes: z.number().default(60),
    }),
  }),
  status: z.enum(["active", "suspended", "cancelled"]),
  subscription: z.object({
    plan: z.enum(["starter", "professional", "enterprise"]),
    seats: z.number().min(1),
    billing_cycle: z.enum(["monthly", "yearly"]),
    expires_at: z.date(),
  }),
});

export type Tenant = z.infer<typeof tenantSchema>;

// Activity Log Schema
export const activityLogSchema = z.object({
  ...commonFields,
  actor_id: z.string().uuid(),
  entity_type: z.enum([
    "lead",
    "opportunity",
    "contact",
    "account",
    "campaign",
    "user",
  ]),
  entity_id: z.string().uuid(),
  action: z.enum([
    "create",
    "update",
    "delete",
    "convert",
    "assign",
    "email",
    "note",
  ]),
  details: z.object({
    changes: z
      .array(
        z.object({
          field: z.string(),
          old_value: z.any(),
          new_value: z.any(),
        })
      )
      .optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
  ip_address: z.string().optional(),
});

export type ActivityLog = z.infer<typeof activityLogSchema>;

// Feature Flag Schema
export const featureFlagSchema = z.object({
  ...commonFields,
  name: z.string().min(1),
  description: z.string().optional(),
  enabled: z.boolean().default(false),
  rules: z.array(
    z.object({
      tenant_ids: z.array(z.string().uuid()).optional(),
      user_roles: z.array(z.string()).optional(),
      percentage: z.number().min(0).max(100).optional(),
      start_date: z.date().optional(),
      end_date: z.date().optional(),
    })
  ),
});

export type FeatureFlag = z.infer<typeof featureFlagSchema>;

// Segment Schema
export const segmentSchema = z.object({
  ...commonFields,
  name: z.string().min(1),
  description: z.string().optional(),
  entity_type: z.enum(["lead", "contact", "account", "opportunity"]),
  filters: z.array(
    z.object({
      field: z.string(),
      operator: z.enum([
        "equals",
        "not_equals",
        "contains",
        "not_contains",
        "greater_than",
        "less_than",
        "in",
        "not_in",
      ]),
      value: z.any(),
    })
  ),
  owner_id: z.string().uuid(),
});

export type Segment = z.infer<typeof segmentSchema>;

// Calendar Event Schema
export const calendarEventSchema = z.object({
  ...commonFields,
  title: z.string().min(1),
  description: z.string().optional(),
  start_time: z.date(),
  end_time: z.date(),
  type: z.enum(["meeting", "call", "task", "reminder"]),
  entity_type: z.enum(["lead", "opportunity", "contact", "account"]).optional(),
  entity_id: z.string().uuid().optional(),
  attendees: z.array(
    z.object({
      email: z.string().email(),
      response_status: z
        .enum(["pending", "accepted", "declined", "tentative"])
        .optional(),
    })
  ),
  google_calendar_id: z.string().optional(),
  location: z.string().optional(),
  reminder_minutes: z.number().optional(),
  owner_id: z.string().uuid(),
});

export type CalendarEvent = z.infer<typeof calendarEventSchema>;

// Email Sync Schema
export const emailSchema = z.object({
  ...commonFields,
  subject: z.string(),
  body: z.string(),
  sender: z.string().email(),
  recipients: z.array(z.string().email()),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  sent_at: z.date(),
  thread_id: z.string(),
  gmail_message_id: z.string(),
  direction: z.enum(["inbound", "outbound"]),
  entity_type: z.enum(["lead", "opportunity", "contact", "account"]).optional(),
  entity_id: z.string().uuid().optional(),
  campaign_id: z.string().uuid().optional(),
  opened_at: z.date().optional(),
  clicked_at: z.date().optional(),
});

export type Email = z.infer<typeof emailSchema>;

// Workflow Schema
export const workflowSchema = z.object({
  ...commonFields,
  name: z.string().min(1),
  description: z.string().optional(),
  trigger: z.object({
    type: z.enum(["event", "schedule", "manual"]),
    config: z.object({
      event_type: z.string().optional(), // For event triggers
      cron_expression: z.string().optional(), // For scheduled triggers
    }),
  }),
  enabled: z.boolean().default(true),
  steps: z.array(
    z.object({
      id: z.string(),
      type: z.enum([
        "send_email",
        "create_task",
        "update_field",
        "wait",
        "condition",
        "webhook",
      ]),
      config: z.record(z.string(), z.any()),
      next_step_id: z.string().optional(),
      condition_steps: z.record(z.string(), z.string()).optional(), // For condition steps: outcome -> next_step_id
    })
  ),
  last_run_at: z.date().optional(),
  next_run_at: z.date().optional(),
  owner_id: z.string().uuid(),
  metrics: z
    .object({
      runs: z.number().default(0),
      successful_runs: z.number().default(0),
      failed_runs: z.number().default(0),
      last_error: z.string().optional(),
    })
    .optional(),
});

export type Workflow = z.infer<typeof workflowSchema>;

// Report Schema
export const reportSchema = z.object({
  ...commonFields,
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["sales", "leads", "activities", "performance", "custom"]),
  query: z.object({
    metrics: z.array(z.string()),
    dimensions: z.array(z.string()),
    filters: z
      .array(
        z.object({
          field: z.string(),
          operator: z.enum([
            "equals",
            "not_equals",
            "greater_than",
            "less_than",
            "contains",
            "not_contains",
          ]),
          value: z.any(),
        })
      )
      .optional(),
    sort: z
      .array(
        z.object({
          field: z.string(),
          direction: z.enum(["asc", "desc"]),
        })
      )
      .optional(),
    limit: z.number().optional(),
  }),
  schedule: z
    .object({
      enabled: z.boolean().default(false),
      frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
      time: z.string().optional(), // HH:mm
      day: z.number().optional(), // 0-6 for weekly, 1-31 for monthly
      recipients: z.array(z.string().email()).optional(),
      format: z.enum(["pdf", "csv", "xlsx"]).optional(),
    })
    .optional(),
  last_run_at: z.date().optional(),
  owner_id: z.string().uuid(),
});

export type Report = z.infer<typeof reportSchema>;

// Task Schema
export const taskSchema = z.object({
  ...commonFields,
  title: z.string().min(1),
  description: z.string().optional(),
  due_date: z.date().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  type: z.enum(["call", "email", "meeting", "follow_up", "other"]),
  entity_type: z.enum(["lead", "opportunity", "contact", "account"]).optional(),
  entity_id: z.string().uuid().optional(),
  assignee_id: z.string().uuid(),
  workflow_id: z.string().uuid().optional(),
  completed_at: z.date().optional(),
  reminder: z
    .object({
      enabled: z.boolean().default(false),
      time: z.date().optional(),
      sent: z.boolean().default(false),
    })
    .optional(),
});

export type Task = z.infer<typeof taskSchema>;

// Integration Schemas
export const integrationProviderSchema = z.enum([
  "linkedin",
  "gmail",
  "google_calendar",
]);

export const integrationSchema = z.object({
  ...commonFields,
  provider: integrationProviderSchema,
  name: z.string().min(1),
  config: z.object({
    credentials: z.object({
      access_token: z.string(),
      refresh_token: z.string().optional(),
      expires_at: z.date(),
    }),
    settings: z.record(z.any()).optional(),
  }),
  status: z.enum(["active", "inactive", "error"]),
  last_sync: z.date().optional(),
  error: z.string().optional(),
});

export type Integration = z.infer<typeof integrationSchema>;

// Integration Sync Log Schema
export const integrationSyncLogSchema = z.object({
  ...commonFields,
  integration_id: z.string().uuid(),
  status: z.enum(["success", "error", "partial"]),
  items_processed: z.number(),
  items_succeeded: z.number(),
  items_failed: z.number(),
  error: z.string().optional(),
  details: z.record(z.any()).optional(),
});

export type IntegrationSyncLog = z.infer<typeof integrationSyncLogSchema>;

// Dashboard Schema
export const dashboardSchema = z.object({
  ...commonFields,
  name: z.string().min(1),
  description: z.string().optional(),
  layout: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["chart", "metric", "table", "list"]),
      config: z.object({
        data_source: z.string().optional(),
        metrics: z.array(z.string()).optional(),
        filters: z
          .array(
            z.object({
              field: z.string(),
              operator: z.string(),
              value: z.any(),
            })
          )
          .optional(),
        refresh_interval: z.number().optional(),
      }),
    })
  ),
  is_default: z.boolean().default(false),
  owner_id: z.string().uuid(),
});

export type Dashboard = z.infer<typeof dashboardSchema>;
