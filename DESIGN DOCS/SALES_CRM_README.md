# Sales-Focused CRM Database Schema

## Overview
This CRM is designed specifically for sales teams with a focus on lead management, opportunity tracking, and sales performance analytics. The system supports two primary roles: **Sales Representatives** and **Managers**.

## Core Sales Workflow

```
Lead → Prospect → Opportunity → Client
  ↓        ↓           ↓         ↓
New    Qualified   Proposal   Won/Lost
```

## Database Tables

### Core Entities

#### 1. **tenants** - Multi-tenant support
- `id` - Unique tenant identifier
- `name` - Tenant company name
- Basic timestamps

#### 2. **users** - Sales team members
- **Roles**: `sales_rep`, `manager`
- **Quotas**: `monthly_quota`, `yearly_quota`, `current_revenue`
- **Preferences**: Working hours, notifications
- **Status**: `active`, `inactive`

#### 3. **sales_stages** - Configurable pipeline stages
- **Types**: `lead`, `prospect`, `opportunity`, `client`
- **Default stages**:
  - New Lead (5% probability)
  - Contacted (10% probability)
  - Qualified Prospect (25% probability)
  - Needs Analysis (40% probability)
  - Proposal Sent (60% probability)
  - Negotiation (80% probability)
  - Closed Won (100% probability)
  - Closed Lost (0% probability)

### Sales Entities

#### 4. **accounts** - Companies/Organizations
- Company details (name, industry, size, revenue)
- **Relationship status**: `prospect`, `client`, `partner`, `inactive`
- Revenue tracking and owner assignment

#### 5. **contacts** - Individual people at accounts
- Contact information and role
- **Authority levels**: `low`, `medium`, `high`
- **Roles**: `decision_maker`, `influencer`, `evaluator`, `gatekeeper`, `end_user`
- Budget influence and contact preferences

#### 6. **leads** - Potential sales opportunities
- **Source tracking**: `website`, `linkedin`, `referral`, `cold_outreach`, `event`, `partner`
- **Qualification**: `unqualified`, `marketing_qualified`, `sales_qualified`
- **Interest levels**: `hot`, `warm`, `cold`
- **Scoring**: 0-100 automatic scoring system
- Pain points, budget range, timeline
- Conversion tracking to opportunities

#### 7. **opportunities** - Active sales deals
- Deal value and probability
- Pipeline stage tracking
- **Sales process fields**: Budget confirmed, authority identified, need established
- Competition and pricing strategy
- **Outcome tracking**: `won`, `lost`, `no_decision` with reasons

### Activity & Follow-up Management

#### 8. **activities** - All sales activities
- **Types**: `call`, `email`, `meeting`, `demo`, `proposal`, `follow_up`, `note`
- **Outcomes**: `positive`, `neutral`, `negative`, `no_response`
- Duration tracking and calendar integration
- Linked to leads, opportunities, contacts, or accounts

#### 9. **follow_ups** - Reminders and scheduled tasks
- Due dates with priority levels
- Calendar integration with reminders
- **Status**: `pending`, `in_progress`, `completed`, `cancelled`
- Automatic activity creation when completed

### Analytics & Management

#### 10. **revenue_tracking** - Detailed revenue analytics
- **Revenue types**: `new_business`, `upsell`, `renewal`, `expansion`
- Commission tracking
- Monthly/quarterly/yearly breakdowns
- Linked to specific opportunities and sales reps

#### 11. **manager_comments** - Coaching and feedback
- **Types**: `coaching`, `feedback`, `approval`, `instruction`
- Action tracking and read receipts
- Linked to specific deals or activities

## Key Features

### Sales Rep Features
1. **Lead Management**
   - Create and qualify leads
   - Automatic lead scoring
   - Source attribution
   - Conversion to opportunities

2. **Opportunity Pipeline**
   - Visual pipeline with drag-drop
   - Stage progression tracking
   - Probability and value management
   - Competition tracking

3. **Activity Tracking**
   - All touchpoints logged
   - Calendar integration
   - Follow-up reminders
   - Outcome tracking

4. **Performance Tracking**
   - Personal revenue dashboard
   - Quota progress
   - Activity metrics
   - Deal conversion rates

### Manager Features
1. **Team Oversight**
   - Full pipeline visibility
   - Team performance dashboards
   - Revenue forecasting
   - Activity monitoring

2. **Coaching Tools**
   - Comment and feedback system
   - Deal review capabilities
   - Performance analytics
   - Action item tracking

3. **Analytics**
   - Revenue by rep/period
   - Conversion rate analysis
   - Lost deal analysis
   - Pipeline health metrics

## Automatic Scoring System

### Lead Scoring Algorithm
The system automatically calculates lead scores (0-100) based on:
- **Source quality**: Referrals (30), LinkedIn (25), Website (20), etc.
- **Activity engagement**: +5 points per activity in last 30 days
- **Recency penalty**: -1 point per day after 30 days old
- **Bounds**: Always between 0-100

## Security & Access Control

### Row Level Security (RLS)
- **Sales Reps**: Can only see/edit their own records
- **Managers**: Can see all records in their tenant
- **Tenant Isolation**: Complete data separation between tenants

### Key Policies
- Ownership-based access for leads and opportunities
- Manager oversight for all sales activities
- Secure comment and feedback system

## Performance Optimizations

### Database Indexes
- Owner and tenant-based queries
- Date-based filtering for activities and follow-ups
- Score-based lead sorting
- Revenue analytics queries

### Functions
- `calculate_lead_score()` - Automatic lead scoring
- `update_updated_at_column()` - Timestamp management

## Calendar Integration

### Supported Features
- Automatic follow-up scheduling
- Meeting sync with opportunities
- Reminder management
- Activity completion tracking

## Revenue Analytics

### Tracking Capabilities
- Individual rep performance
- Monthly/quarterly/yearly breakdowns
- Revenue type classification
- Commission calculations
- Pipeline forecasting

## Next Steps for Implementation

1. **API Development**: Build REST endpoints for all entities
2. **Frontend Components**: Create sales pipeline UI components
3. **Calendar Integration**: Implement calendar API connections
4. **Analytics Dashboard**: Build manager and rep dashboards
5. **Mobile Optimization**: Ensure mobile-friendly interface

This schema provides a complete foundation for a sales-focused CRM that matches real-world sales workflows while maintaining simplicity and performance.