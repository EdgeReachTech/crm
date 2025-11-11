import { z } from 'zod';

// Common fields schema
export const commonFields = {
  id: z.string(),
  tenant_id: z.string().uuid(),
  created_at: z.string().transform((str) => new Date(str)),
  updated_at: z.string().transform((str) => new Date(str)),
};

// User Schema
export const userSchema = z.object({
  ...commonFields,
  firebase_uid: z.string().optional(),
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  role: z.enum(['admin', 'manager', 'sales_rep']).default('sales_rep'),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
  profile_image: z.string().url().optional().nullable(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    notification_settings: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      digest_frequency: z.enum(['never', 'daily', 'weekly']).default('daily'),
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
    role: z.enum(['admin', 'sales_rep', 'manager']).default('sales_rep'),
    tenant_id: z.string().uuid().optional(),
    idToken: z.string().optional() // For Firebase-based registration
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string()
  })
});

export const updateProfileSchema = z.object({
  body: z.object({
    first_name: z.string().min(1).optional(),
    last_name: z.string().min(1).optional(),
    avatar_url: z.string().url().optional(),
    role: z.enum(['admin', 'sales_rep', 'manager']).optional(),
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

// Lead Schema
export const leadSchema = z.object({
  ...commonFields,
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  company: z.string().min(1),
  phone: z.string().optional(),
  source: z.enum(['website', 'linkedin', 'referral', 'other']),
  status: z.enum(['new', 'contacted', 'qualified', 'unqualified']),
  score: z.number().min(0).max(100),
  owner_id: z.string().uuid(),
  notes: z.string().optional(),
  last_contacted: z.date().optional(),
});

export type Lead = z.infer<typeof leadSchema>;

// Opportunity Schema
export const opportunitySchema = z.object({
  ...commonFields,
  name: z.string().min(1),
  value: z.number().min(0),
  stage: z.enum(['qualified', 'discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
  probability: z.number().min(0).max(100),
  expected_close_date: z.date(),
  lead_id: z.string().uuid(),
  owner_id: z.string().uuid(),
  notes: z.string().optional(),
  last_activity_date: z.date().optional(),
});

export type Opportunity = z.infer<typeof opportunitySchema>;

// Contact Schema
export const contactSchema = z.object({
  ...commonFields,
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(['decision_maker', 'influencer', 'evaluator', 'gatekeeper', 'other']),
  title: z.string().optional(),
  account_id: z.string().uuid(),
  opt_out: z.boolean().default(false),
  last_activity_date: z.date().optional(),
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

// Account Schema
export const accountSchema = z.object({
  ...commonFields,
  name: z.string().min(1),
  industry: z.string(),
  website: z.string().url().optional(),
  size: z.enum(['small', 'medium', 'large', 'enterprise']),
  parent_account_id: z.string().uuid().optional(),
  annual_revenue: z.number().optional(),
  owner_id: z.string().uuid(),
});

export type Account = z.infer<typeof accountSchema>;

// Marketing Campaign Schema
export const campaignSchema = z.object({
  ...commonFields,
  name: z.string().min(1),
  type: z.enum(['email', 'newsletter', 'nurture', 'webinar', 'social', 'event']),
  status: z.enum(['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled']),
  owner_id: z.string().uuid(),
  description: z.string().optional(),
  start_date: z.date(),
  end_date: z.date().optional(),
  budget: z.number().min(0).optional(),
  segment: z.object({
    filters: z.array(z.object({
      field: z.string(),
      operator: z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than']),
      value: z.any(),
    })),
  }),
  template: z.object({
    subject: z.string(),
    content: z.string(),
    variables: z.array(z.string()).optional(),
  }),
  metrics: z.object({
    sent: z.number().default(0),
    opened: z.number().default(0),
    clicked: z.number().default(0),
    converted: z.number().default(0),
    revenue: z.number().default(0),
  }).optional(),
  settings: z.object({
    track_opens: z.boolean().default(true),
    track_clicks: z.boolean().default(true),
    schedule_type: z.enum(['immediate', 'scheduled', 'recurring']).optional(),
    schedule_config: z.object({
      frequency: z.enum(['once', 'daily', 'weekly', 'monthly']).optional(),
      time: z.string().optional(), // HH:mm format
      days: z.array(z.number().min(0).max(6)).optional(), // 0-6 for Sunday-Saturday
    }).optional(),
  }).optional(),
  utm: z.object({
    source: z.string(),
    medium: z.string(),
    campaign: z.string(),
    term: z.string().optional(),
    content: z.string().optional(),
  }).optional(),
  target_audience: z.array(z.string()).optional(),
});

export type Campaign = z.infer<typeof campaignSchema>;



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
  status: z.enum(['active', 'suspended', 'cancelled']),
  subscription: z.object({
    plan: z.enum(['starter', 'professional', 'enterprise']),
    seats: z.number().min(1),
    billing_cycle: z.enum(['monthly', 'yearly']),
    expires_at: z.date(),
  }),
});

export type Tenant = z.infer<typeof tenantSchema>;

// Activity Log Schema
export const activityLogSchema = z.object({
  ...commonFields,
  actor_id: z.string().uuid(),
  entity_type: z.enum(['lead', 'opportunity', 'contact', 'account', 'campaign', 'user']),
  entity_id: z.string().uuid(),
  action: z.enum(['create', 'update', 'delete', 'convert', 'assign', 'email', 'note']),
  details: z.object({
    changes: z.array(z.object({
      field: z.string(),
      old_value: z.any(),
      new_value: z.any(),
    })).optional(),
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
  rules: z.array(z.object({
    tenant_ids: z.array(z.string().uuid()).optional(),
    user_roles: z.array(z.string()).optional(),
    percentage: z.number().min(0).max(100).optional(),
    start_date: z.date().optional(),
    end_date: z.date().optional(),
  })),
});

export type FeatureFlag = z.infer<typeof featureFlagSchema>;

// Segment Schema
export const segmentSchema = z.object({
  ...commonFields,
  name: z.string().min(1),
  description: z.string().optional(),
  entity_type: z.enum(['lead', 'contact', 'account', 'opportunity']),
  filters: z.array(z.object({
    field: z.string(),
    operator: z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'in', 'not_in']),
    value: z.any(),
  })),
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
  type: z.enum(['meeting', 'call', 'task', 'reminder']),
  entity_type: z.enum(['lead', 'opportunity', 'contact', 'account']).optional(),
  entity_id: z.string().uuid().optional(),
  attendees: z.array(z.object({
    email: z.string().email(),
    response_status: z.enum(['pending', 'accepted', 'declined', 'tentative']).optional(),
  })),
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
  direction: z.enum(['inbound', 'outbound']),
  entity_type: z.enum(['lead', 'opportunity', 'contact', 'account']).optional(),
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
    type: z.enum(['event', 'schedule', 'manual']),
    config: z.object({
      event_type: z.string().optional(), // For event triggers
      cron_expression: z.string().optional(), // For scheduled triggers
    }),
  }),
  enabled: z.boolean().default(true),
  steps: z.array(z.object({
    id: z.string(),
    type: z.enum(['send_email', 'create_task', 'update_field', 'wait', 'condition', 'webhook']),
    config: z.record(z.string(), z.any()),
    next_step_id: z.string().optional(),
    condition_steps: z.record(z.string(), z.string()).optional(), // For condition steps: outcome -> next_step_id
  })),
  last_run_at: z.date().optional(),
  next_run_at: z.date().optional(),
  owner_id: z.string().uuid(),
  metrics: z.object({
    runs: z.number().default(0),
    successful_runs: z.number().default(0),
    failed_runs: z.number().default(0),
    last_error: z.string().optional(),
  }).optional(),
});

export type Workflow = z.infer<typeof workflowSchema>;

// Report Schema
export const reportSchema = z.object({
  ...commonFields,
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['sales', 'leads', 'activities', 'performance', 'custom']),
  query: z.object({
    metrics: z.array(z.string()),
    dimensions: z.array(z.string()),
    filters: z.array(z.object({
      field: z.string(),
      operator: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'not_contains']),
      value: z.any(),
    })).optional(),
    sort: z.array(z.object({
      field: z.string(),
      direction: z.enum(['asc', 'desc']),
    })).optional(),
    limit: z.number().optional(),
  }),
  schedule: z.object({
    enabled: z.boolean().default(false),
    frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
    time: z.string().optional(), // HH:mm
    day: z.number().optional(), // 0-6 for weekly, 1-31 for monthly
    recipients: z.array(z.string().email()).optional(),
    format: z.enum(['pdf', 'csv', 'xlsx']).optional(),
  }).optional(),
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
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  type: z.enum(['call', 'email', 'meeting', 'follow_up', 'other']),
  entity_type: z.enum(['lead', 'opportunity', 'contact', 'account']).optional(),
  entity_id: z.string().uuid().optional(),
  assignee_id: z.string().uuid(),
  workflow_id: z.string().uuid().optional(),
  completed_at: z.date().optional(),
  reminder: z.object({
    enabled: z.boolean().default(false),
    time: z.date().optional(),
    sent: z.boolean().default(false),
  }).optional(),
});

export type Task = z.infer<typeof taskSchema>;

// Integration Schemas
export const integrationProviderSchema = z.enum(['linkedin', 'gmail', 'google_calendar']);

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
  status: z.enum(['active', 'inactive', 'error']),
  last_sync: z.date().optional(),
  error: z.string().optional(),
});

export type Integration = z.infer<typeof integrationSchema>;

// Integration Sync Log Schema
export const integrationSyncLogSchema = z.object({
  ...commonFields,
  integration_id: z.string().uuid(),
  status: z.enum(['success', 'error', 'partial']),
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
  layout: z.array(z.object({
    id: z.string(),
    type: z.enum(['chart', 'metric', 'table', 'list']),
    config: z.object({
      data_source: z.string().optional(),
      metrics: z.array(z.string()).optional(),
      filters: z.array(z.object({
        field: z.string(),
        operator: z.string(),
        value: z.any(),
      })).optional(),
      refresh_interval: z.number().optional(),
    }),
  })),
  is_default: z.boolean().default(false),
  owner_id: z.string().uuid(),
});

export type Dashboard = z.infer<typeof dashboardSchema>;