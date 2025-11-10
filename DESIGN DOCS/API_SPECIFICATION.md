# 🔌 SALES CRM - API SPECIFICATION

## 📋 Base Configuration

```typescript
// Base URL
const API_BASE = '/api/v1';

// Standard Headers
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ${token}',
  'X-Tenant-ID': '${tenantId}'
}

// Standard Response Format
{
  success: boolean;
  data?: any;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## 🚀 API ENDPOINTS BY MODULE

### **1. AUTHENTICATION & USERS**

#### User Management
```typescript
// Get current user profile
GET /api/users/me
Response: {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'sales_rep' | 'manager';
  monthly_quota: number;
  yearly_quota: number;
  current_revenue: number;
  preferences: object;
}

// Update user profile
PUT /api/users/me
Body: {
  first_name?: string;
  last_name?: string;
  preferences?: object;
}

// Get team members (Manager only)
GET /api/users/team
Response: User[]

// Update user quota (Manager only)
PUT /api/users/:userId/quota
Body: {
  monthly_quota: number;
  yearly_quota: number;
}
```

### **2. SALES STAGES**

```typescript
// Get all sales stages
GET /api/sales-stages
Response: {
  id: string;
  name: string;
  stage_order: number;
  stage_type: 'lead' | 'prospect' | 'opportunity' | 'client';
  probability_weight: number;
  is_active: boolean;
}[]

// Create sales stage (Manager only)
POST /api/sales-stages
Body: {
  name: string;
  stage_order: number;
  stage_type: string;
  probability_weight: number;
}

// Update sales stage (Manager only)
PUT /api/sales-stages/:id
Body: Partial<SalesStage>

// Delete sales stage (Manager only)
DELETE /api/sales-stages/:id
```

### **3. LEAD MANAGEMENT**

```typescript
// Get leads with filters
GET /api/leads?page=1&limit=20&source=website&owner_id=xxx&search=company
Response: {
  data: Lead[];
  pagination: PaginationInfo;
}

// Create new lead
POST /api/leads
Body: {
  first_name: string;
  last_name: string;
  email?: string;
  company: string;
  phone?: string;
  title?: string;
  source: string;
  source_details?: string;
  budget_range?: string;
  timeline?: string;
  pain_points?: string;
  notes?: string;
}

// Get single lead
GET /api/leads/:id
Response: Lead with related data (activities, follow-ups)

// Update lead
PUT /api/leads/:id
Body: Partial<Lead>

// Convert lead to opportunity
POST /api/leads/:id/convert
Body: {
  opportunity_name: string;
  opportunity_value: number;
  expected_close_date: string;
  account_id?: string;
  primary_contact_id?: string;
}

// Update lead score
PUT /api/leads/:id/score
Body: {
  score: number;
  scoring_reason?: string;
}

// Get sales rep's leads
GET /api/leads/my-leads
Response: Lead[]

// Bulk import leads
POST /api/leads/bulk-import
Body: {
  leads: LeadImportData[];
  duplicate_handling: 'skip' | 'update' | 'create';
}
```

### **4. ACCOUNT MANAGEMENT**

```typescript
// Get all accounts
GET /api/accounts?page=1&limit=20&industry=tech&relationship_status=prospect
Response: {
  data: Account[];
  pagination: PaginationInfo;
}

// Create account
POST /api/accounts
Body: {
  name: string;
  industry?: string;
  website?: string;
  size?: string;
  annual_revenue?: number;
  employee_count?: number;
  phone?: string;
  address?: string;
}

// Get single account with related data
GET /api/accounts/:id
Response: {
  account: Account;
  contacts: Contact[];
  opportunities: Opportunity[];
  activities: Activity[];
  revenue_history: RevenueTracking[];
}

// Update account
PUT /api/accounts/:id
Body: Partial<Account>

// Get account contacts
GET /api/accounts/:id/contacts
Response: Contact[]

// Get account opportunities
GET /api/accounts/:id/opportunities
Response: Opportunity[]
```

### **5. CONTACT MANAGEMENT**

```typescript
// Get all contacts
GET /api/contacts?page=1&limit=20&account_id=xxx&role=decision_maker
Response: {
  data: Contact[];
  pagination: PaginationInfo;
}

// Create contact
POST /api/contacts
Body: {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  title?: string;
  role: string;
  account_id: string;
  authority_level: 'low' | 'medium' | 'high';
  budget_influence: boolean;
  contact_preference: string;
}

// Get single contact
GET /api/contacts/:id
Response: Contact with activities and opportunities

// Update contact
PUT /api/contacts/:id
Body: Partial<Contact>

// Delete contact
DELETE /api/contacts/:id
```

### **6. OPPORTUNITY MANAGEMENT**

```typescript
// Get opportunities with filters
GET /api/opportunities?stage_id=xxx&owner_id=xxx&min_value=1000
Response: {
  data: Opportunity[];
  pagination: PaginationInfo;
}

// Create opportunity
POST /api/opportunities
Body: {
  name: string;
  description?: string;
  value: number;
  current_stage_id: string;
  expected_close_date: string;
  lead_id?: string;
  account_id?: string;
  primary_contact_id?: string;
  budget_confirmed?: boolean;
  authority_identified?: boolean;
  need_established?: boolean;
  timeline_defined?: boolean;
  competitors?: string[];
  pricing_strategy?: string;
}

// Get single opportunity
GET /api/opportunities/:id
Response: Opportunity with full details

// Update opportunity
PUT /api/opportunities/:id
Body: Partial<Opportunity>

// Update opportunity stage
PUT /api/opportunities/:id/stage
Body: {
  stage_id: string;
  reason?: string;
  notes?: string;
}

// Record opportunity outcome
PUT /api/opportunities/:id/outcome
Body: {
  outcome: 'won' | 'lost' | 'no_decision';
  actual_close_date: string;
  lost_reason?: string;
  lost_to_competitor?: string;
  notes?: string;
}

// Get pipeline view
GET /api/opportunities/pipeline
Response: {
  stages: SalesStage[];
  opportunities_by_stage: { [stageId: string]: Opportunity[] };
  totals: { [stageId: string]: number };
}

// Get revenue forecast
GET /api/opportunities/forecast?period=quarterly
Response: {
  period: string;
  total_pipeline_value: number;
  weighted_forecast: number;
  opportunities_count: number;
  by_stage: ForecastByStage[];
}
```

### **7. ACTIVITY MANAGEMENT**

```typescript
// Get activities
GET /api/activities?entity_type=lead&entity_id=xxx&type=call
Response: {
  data: Activity[];
  pagination: PaginationInfo;
}

// Create activity
POST /api/activities
Body: {
  title: string;
  description?: string;
  activity_type: 'call' | 'email' | 'meeting' | 'demo' | 'proposal' | 'follow_up' | 'note';
  activity_date: string;
  duration_minutes?: number;
  outcome?: 'positive' | 'neutral' | 'negative' | 'no_response';
  lead_id?: string;
  opportunity_id?: string;
  contact_id?: string;
  account_id?: string;
  notes?: string;
  follow_up_required?: boolean;
  next_action?: string;
}

// Get single activity
GET /api/activities/:id
Response: Activity with related entities

// Update activity
PUT /api/activities/:id
Body: Partial<Activity>

// Get activity timeline
GET /api/activities/timeline?days=30
Response: Activity[]

// Get activities by entity
GET /api/activities/by-entity/:entityType/:entityId
Response: Activity[]
```

### **8. FOLLOW-UP MANAGEMENT**

```typescript
// Get follow-ups
GET /api/follow-ups?status=pending&priority=high&due_date=today
Response: {
  data: FollowUp[];
  pagination: PaginationInfo;
}

// Create follow-up
POST /api/follow-ups
Body: {
  title: string;
  description?: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  lead_id?: string;
  opportunity_id?: string;
  contact_id?: string;
  account_id?: string;
  reminder_minutes?: number;
}

// Update follow-up
PUT /api/follow-ups/:id
Body: Partial<FollowUp>

// Complete follow-up
PUT /api/follow-ups/:id/complete
Body: {
  completion_notes?: string;
  completed_activity_id?: string;
}

// Get due follow-ups
GET /api/follow-ups/due
Response: FollowUp[]

// Get overdue follow-ups
GET /api/follow-ups/overdue
Response: FollowUp[]
```

### **9. EMAIL & TEMPLATES**

```typescript
// Get email templates
GET /api/email-templates?type=initial_contact
Response: EmailTemplate[]

// Create email template
POST /api/email-templates
Body: {
  name: string;
  subject: string;
  body: string;
  template_type: string;
  variables: string[];
}

// Send email
POST /api/emails/send
Body: {
  template_id?: string;
  to_email: string;
  subject: string;
  body: string;
  entity_type?: string;
  entity_id?: string;
  variables?: { [key: string]: string };
}

// Get email history
GET /api/emails/history/:entityType/:entityId
Response: EmailHistory[]
```

### **10. SALES ANALYTICS**

```typescript
// Get revenue analytics
GET /api/analytics/revenue?period=monthly&year=2024&rep_id=xxx
Response: {
  total_revenue: number;
  revenue_by_period: RevenueByPeriod[];
  revenue_by_type: RevenueByType[];
  growth_rate: number;
  target_achievement: number;
}

// Get pipeline analytics
GET /api/analytics/pipeline
Response: {
  pipeline_value: number;
  weighted_pipeline: number;
  conversion_rates: ConversionRate[];
  average_deal_size: number;
  average_cycle_time: number;
  stage_velocity: StageVelocity[];
}

// Get performance metrics
GET /api/analytics/performance/:userId?period=quarterly
Response: {
  revenue_achievement: number;
  deals_closed: number;
  activities_completed: number;
  conversion_rate: number;
  average_deal_size: number;
  cycle_time: number;
  quota_progress: number;
}

// Get forecast
GET /api/analytics/forecast?period=quarterly
Response: {
  forecast_amount: number;
  confidence_level: number;
  contributing_opportunities: Opportunity[];
  best_case: number;
  worst_case: number;
}

// Get conversion rates
GET /api/analytics/conversion-rates?period=yearly
Response: {
  lead_to_opportunity: number;
  opportunity_to_closed: number;
  by_source: ConversionBySource[];
  by_stage: ConversionByStage[];
}

// Get lost deal analysis
GET /api/analytics/lost-deals?period=quarterly
Response: {
  total_lost_value: number;
  lost_deals_count: number;
  by_reason: LostDealsByReason[];
  by_competitor: LostDealsByCompetitor[];
  recovery_opportunities: number;
}
```

### **11. QUOTA & TARGETS**

```typescript
// Get sales targets
GET /api/sales-targets?period=monthly&year=2024
Response: SalesTarget[]

// Create sales target
POST /api/sales-targets
Body: {
  sales_rep_id: string;
  target_period: 'monthly' | 'quarterly' | 'yearly';
  target_year: number;
  target_month?: number;
  target_quarter?: number;
  revenue_target: number;
  deals_target?: number;
  activities_target?: number;
}

// Update sales target
PUT /api/sales-targets/:id
Body: Partial<SalesTarget>

// Get target progress
GET /api/sales-targets/progress/:userId?period=monthly
Response: {
  target: SalesTarget;
  progress_percentage: number;
  actual_vs_target: {
    revenue: { actual: number; target: number; };
    deals: { actual: number; target: number; };
    activities: { actual: number; target: number; };
  };
  projection: {
    end_of_period_revenue: number;
    likelihood_to_achieve: number;
  };
}
```

### **12. MANAGER TOOLS**

```typescript
// Get team overview (Manager only)
GET /api/manager/team-overview
Response: {
  team_members: TeamMember[];
  team_performance: TeamPerformance;
  pipeline_summary: PipelineSummary;
  recent_activities: Activity[];
}

// Get team performance (Manager only)
GET /api/manager/performance?period=monthly
Response: {
  team_revenue: number;
  team_quota: number;
  achievement_rate: number;
  individual_performance: IndividualPerformance[];
  top_performers: User[];
  improvement_needed: User[];
}

// Create manager comment
POST /api/manager/comments
Body: {
  sales_rep_id: string;
  comment_type: 'coaching' | 'feedback' | 'approval' | 'instruction';
  comment: string;
  priority: 'low' | 'medium' | 'high';
  lead_id?: string;
  opportunity_id?: string;
  activity_id?: string;
  requires_action?: boolean;
}

// Get comments for rep
GET /api/manager/comments/:repId
Response: ManagerComment[]

// Mark comment as read
PUT /api/manager/comments/:id/mark-read

// Get deals requiring review
GET /api/manager/deals-requiring-review
Response: Opportunity[]
```

### **13. CLIENT MANAGEMENT**

```typescript
// Get clients
GET /api/clients?satisfaction_score=high
Response: Account[]

// Get client interactions
GET /api/clients/:accountId/interactions
Response: ClientInteraction[]

// Create client interaction
POST /api/clients/:accountId/interactions
Body: {
  interaction_type: 'onboarding' | 'support' | 'upsell' | 'renewal' | 'feedback' | 'complaint';
  description: string;
  outcome?: 'positive' | 'neutral' | 'negative' | 'pending';
  satisfaction_score?: number;
  follow_up_required?: boolean;
}

// Get satisfaction scores
GET /api/clients/satisfaction-scores
Response: {
  average_score: number;
  scores_by_month: SatisfactionByMonth[];
  low_satisfaction_clients: Account[];
}

// Submit client feedback
POST /api/clients/:accountId/feedback
Body: {
  satisfaction_score: number;
  feedback_text: string;
  improvement_areas: string[];
}
```

### **14. CALENDAR INTEGRATION**

```typescript
// Get calendar events
GET /api/calendar/events?start_date=xxx&end_date=xxx
Response: CalendarEvent[]

// Create calendar event
POST /api/calendar/events
Body: {
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  attendees?: string[];
  entity_type?: string;
  entity_id?: string;
}

// Update calendar event
PUT /api/calendar/events/:id
Body: Partial<CalendarEvent>

// Sync calendar
POST /api/calendar/sync

// Get user availability
GET /api/calendar/availability/:userId?date=xxx
Response: {
  available_slots: TimeSlot[];
  busy_slots: TimeSlot[];
  working_hours: WorkingHours;
}
```

## 📊 WEBHOOK ENDPOINTS

```typescript
// Lead capture from website
POST /api/webhooks/lead-capture
Body: {
  source: string;
  form_data: object;
  utm_params?: object;
}

// Calendar event updates
POST /api/webhooks/calendar-update
Body: {
  event_type: 'created' | 'updated' | 'deleted';
  event_data: object;
}

// Email delivery status
POST /api/webhooks/email-status
Body: {
  email_id: string;
  status: 'delivered' | 'opened' | 'clicked' | 'bounced';
  timestamp: string;
}
```

## 🔒 AUTHENTICATION

```typescript
// All requests require:
headers: {
  'Authorization': 'Bearer ' + firebaseIdToken,
  'X-Tenant-ID': tenantId
}

// Role-based access:
// - Sales reps can only access their own data
// - Managers can access all team data
// - Tenant isolation is enforced at database level
```

This API specification covers all endpoints needed for the complete sales workflow from lead capture to client management.