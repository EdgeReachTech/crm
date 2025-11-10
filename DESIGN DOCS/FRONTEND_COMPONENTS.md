# 🎨 SALES CRM - FRONTEND COMPONENT SPECIFICATION

## 📋 Component Architecture Overview

```
src/
├── components/
│   ├── ui/                    # Base UI components
│   ├── forms/                 # Form components
│   ├── charts/                # Analytics charts
│   ├── sales/                 # Sales-specific components
│   └── layout/                # Layout components
├── pages/                     # Next.js pages
├── hooks/                     # Custom React hooks
├── contexts/                  # Context providers
└── utils/                     # Utility functions
```

## 🧱 BASE UI COMPONENTS

### **1. Core UI Components** (Already existing - enhance as needed)
```typescript
// src/components/ui/
- Button.tsx          ✅ (existing)
- Input.tsx           ✅ (existing) 
- Card.tsx            ✅ (existing)
- Modal.tsx           (new)
- Badge.tsx           (new)
- Spinner.tsx         (new)
- Toast.tsx           (new)
- Dropdown.tsx        (new)
- Table.tsx           (new)
- Tabs.tsx            (new)
- Progress.tsx        (new)
```

### **2. New UI Components to Create**

#### Modal Component
```typescript
// src/components/ui/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

#### Badge Component
```typescript
// src/components/ui/Badge.tsx
interface BadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
```

## 🎯 SALES-SPECIFIC COMPONENTS

### **1. Lead Management Components**

#### Lead Form Component
```typescript
// src/components/sales/LeadForm.tsx
interface LeadFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Lead>;
  onSubmit: (data: LeadFormData) => Promise<void>;
  onCancel: () => void;
}

// Fields:
- Personal Info (name, email, phone, title)
- Company Info (company, industry, size)
- Lead Source (dropdown with details)
- Qualification Info (budget, timeline, pain points)
- Assignment (owner selection)
```

#### Lead Card Component
```typescript
// src/components/sales/LeadCard.tsx
interface LeadCardProps {
  lead: Lead;
  onEdit: (id: string) => void;
  onConvert: (id: string) => void;
  onDelete: (id: string) => void;
  showActions?: boolean;
}

// Features:
- Lead score indicator
- Interest level badge
- Source icon
- Quick action buttons
- Last activity timestamp
```

#### Lead List Component
```typescript
// src/components/sales/LeadList.tsx
interface LeadListProps {
  leads: Lead[];
  loading?: boolean;
  filters: LeadFilters;
  onFilterChange: (filters: LeadFilters) => void;
  onLeadSelect: (lead: Lead) => void;
  pagination: PaginationInfo;
}

// Features:
- Sortable columns
- Filterable by source, score, owner
- Search functionality
- Bulk actions
- Export options
```

#### Lead Score Indicator
```typescript
// src/components/sales/LeadScoreIndicator.tsx
interface LeadScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

// Visual:
- Color-coded (red: 0-30, yellow: 31-70, green: 71-100)
- Circular progress indicator
- Tooltip with scoring breakdown
```

### **2. Opportunity Pipeline Components**

#### Pipeline Kanban Board
```typescript
// src/components/sales/PipelineKanban.tsx
interface PipelineKanbanProps {
  stages: SalesStage[];
  opportunities: Opportunity[];
  onStageChange: (oppId: string, newStageId: string) => void;
  onOpportunityClick: (opportunity: Opportunity) => void;
}

// Features:
- Drag and drop between stages
- Stage value totals
- Probability-weighted forecasts
- Stage-specific actions
- Real-time updates
```

#### Opportunity Card
```typescript
// src/components/sales/OpportunityCard.tsx
interface OpportunityCardProps {
  opportunity: Opportunity;
  onEdit: (id: string) => void;
  onStageChange: (id: string, stageId: string) => void;
  compact?: boolean;
}

// Features:
- Deal value and probability
- Expected close date
- Account/contact info
- Progress indicators
- Quick stage actions
```

#### Opportunity Form
```typescript
// src/components/sales/OpportunityForm.tsx
interface OpportunityFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Opportunity>;
  fromLead?: Lead;
  onSubmit: (data: OpportunityFormData) => Promise<void>;
}

// Sections:
- Basic Info (name, description, value)
- Timeline (expected close date, current stage)
- Relationships (account, primary contact, lead)
- Sales Process (BANT qualification)
- Competition (competitors, pricing strategy)
```

### **3. Activity Management Components**

#### Activity Timeline
```typescript
// src/components/sales/ActivityTimeline.tsx
interface ActivityTimelineProps {
  activities: Activity[];
  entityType?: string;
  entityId?: string;
  onActivityAdd: (activity: ActivityFormData) => void;
  onActivityEdit: (activity: Activity) => void;
}

// Features:
- Chronological activity list
- Activity type icons
- Outcome indicators
- Quick add activity
- Filter by type/date
```

#### Activity Form
```typescript
// src/components/sales/ActivityForm.tsx
interface ActivityFormProps {
  mode: 'create' | 'edit';
  entityType: 'lead' | 'opportunity' | 'contact' | 'account';
  entityId: string;
  initialData?: Partial<Activity>;
  onSubmit: (data: ActivityFormData) => Promise<void>;
}

// Fields:
- Activity type selection
- Date/time picker
- Duration tracker
- Outcome selection
- Notes/description
- Follow-up required checkbox
```

#### Activity Card
```typescript
// src/components/sales/ActivityCard.tsx
interface ActivityCardProps {
  activity: Activity;
  onEdit?: (activity: Activity) => void;
  showEntity?: boolean;
  compact?: boolean;
}

// Features:
- Type-specific icons
- Outcome status indicators
- Duration display
- Entity linking
- Edit/delete actions
```

### **4. Follow-up Management Components**

#### Follow-up List
```typescript
// src/components/sales/FollowUpList.tsx
interface FollowUpListProps {
  followUps: FollowUp[];
  onComplete: (id: string) => void;
  onEdit: (followUp: FollowUp) => void;
  onSnooze: (id: string, newDate: Date) => void;
}

// Features:
- Priority-based sorting
- Due date indicators
- Overdue highlighting
- Quick complete actions
- Batch operations
```

#### Follow-up Form
```typescript
// src/components/sales/FollowUpForm.tsx
interface FollowUpFormProps {
  mode: 'create' | 'edit';
  entityType: string;
  entityId: string;
  initialData?: Partial<FollowUp>;
  onSubmit: (data: FollowUpFormData) => Promise<void>;
}

// Fields:
- Title and description
- Due date/time picker
- Priority selection
- Reminder settings
- Calendar integration
```

## 📊 DASHBOARD & ANALYTICS COMPONENTS

### **1. Dashboard Components**

#### Sales Dashboard
```typescript
// src/components/dashboard/SalesDashboard.tsx
interface SalesDashboardProps {
  userId: string;
  timeRange: DateRange;
  onTimeRangeChange: (range: DateRange) => void;
}

// Widgets:
- Revenue progress chart
- Pipeline health meter
- Activity feed
- Follow-ups due today
- Recent wins/losses
```

#### Manager Dashboard
```typescript
// src/components/dashboard/ManagerDashboard.tsx
interface ManagerDashboardProps {
  teamId: string;
  timeRange: DateRange;
}

// Widgets:
- Team performance overview
- Pipeline by rep
- Activity leaderboards
- Deals requiring attention
- Revenue forecasts
```

### **2. Chart Components**

#### Revenue Chart
```typescript
// src/components/charts/RevenueChart.tsx
interface RevenueChartProps {
  data: RevenueData[];
  timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  showTarget?: boolean;
  height?: number;
}

// Features:
- Line/bar chart options
- Target line overlay
- Interactive tooltips
- Period comparisons
- Export functionality
```

#### Pipeline Health Chart
```typescript
// src/components/charts/PipelineHealthChart.tsx
interface PipelineHealthProps {
  stageData: StageMetrics[];
  conversionRates: ConversionRate[];
  onStageClick: (stage: SalesStage) => void;
}

// Features:
- Funnel visualization
- Conversion rate indicators
- Stage velocity metrics
- Bottleneck identification
```

#### Performance Metrics
```typescript
// src/components/charts/PerformanceMetrics.tsx
interface PerformanceMetricsProps {
  metrics: PerformanceData;
  targets: TargetData;
  period: 'monthly' | 'quarterly' | 'yearly';
}

// Metrics:
- Quota achievement percentage
- Activity completion rate
- Deal conversion rate
- Average cycle time
```

## 🎨 LAYOUT COMPONENTS

### **1. Navigation Components**

#### Sales Sidebar
```typescript
// src/components/layout/SalesSidebar.tsx
interface SalesSidebarProps {
  user: User;
  currentPath: string;
  onNavigate: (path: string) => void;
}

// Menu Items:
- Dashboard
- Leads
- Opportunities
- Accounts & Contacts
- Activities
- Follow-ups
- Analytics
- Settings
```

#### Top Navigation
```typescript
// src/components/layout/TopNavigation.tsx
interface TopNavProps {
  user: User;
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
}

// Features:
- Search bar
- Notification bell
- User menu
- Quick actions
- Global filters
```

### **2. Filter Components**

#### Sales Filter Panel
```typescript
// src/components/filters/SalesFilterPanel.tsx
interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  availableFilters: FilterConfig[];
}

// Common Filters:
- Date range picker
- Owner selection
- Source filter
- Stage filter
- Value range slider
```

## 🔧 FORM COMPONENTS

### **1. Specialized Form Fields**

#### Contact Selector
```typescript
// src/components/forms/ContactSelector.tsx
interface ContactSelectorProps {
  accountId?: string;
  value?: Contact;
  onChange: (contact: Contact) => void;
  allowCreate?: boolean;
}
```

#### Stage Selector
```typescript
// src/components/forms/StageSelector.tsx
interface StageSelectorProps {
  stages: SalesStage[];
  currentStage?: string;
  onChange: (stageId: string) => void;
  showProbability?: boolean;
}
```

#### Lead Score Slider
```typescript
// src/components/forms/LeadScoreSlider.tsx
interface LeadScoreSliderProps {
  value: number;
  onChange: (score: number) => void;
  readonly?: boolean;
  showBreakdown?: boolean;
}
```

## 📱 MOBILE-RESPONSIVE COMPONENTS

### **Mobile-Optimized Components**

#### Mobile Lead Card
```typescript
// src/components/mobile/MobileLeadCard.tsx
// Compact version for mobile screens
// Swipe actions for quick operations
// Touch-friendly buttons
```

#### Mobile Pipeline
```typescript
// src/components/mobile/MobilePipeline.tsx
// Horizontal scrolling pipeline
// Touch-friendly drag and drop
// Simplified card view
```

## 🎯 MANAGER-SPECIFIC COMPONENTS

### **1. Team Management**

#### Team Overview
```typescript
// src/components/manager/TeamOverview.tsx
interface TeamOverviewProps {
  teamMembers: User[];
  onMemberClick: (member: User) => void;
  timeRange: DateRange;
}

// Features:
- Individual performance cards
- Team performance trends
- Activity comparisons
- Quota achievement status
```

#### Coaching Panel
```typescript
// src/components/manager/CoachingPanel.tsx
interface CoachingPanelProps {
  salesRep: User;
  comments: ManagerComment[];
  onAddComment: (comment: CommentData) => void;
}

// Features:
- Comment history
- Action item tracking
- Performance insights
- Goal setting tools
```

## 🔄 REAL-TIME COMPONENTS

### **Live Update Components**

#### Live Pipeline
```typescript
// src/components/realtime/LivePipeline.tsx
// WebSocket integration for real-time updates
// Collaborative editing indicators
// Live notifications for changes
```

#### Activity Feed
```typescript
// src/components/realtime/ActivityFeed.tsx
// Real-time activity stream
// Team activity visibility
// Live commenting system
```

## 📋 COMPONENT IMPLEMENTATION PRIORITY

### **Phase 1 - Core Sales (Weeks 1-4)**
1. Lead management components (LeadForm, LeadList, LeadCard)
2. Basic pipeline (OpportunityForm, Pipeline view)
3. Activity tracking (ActivityForm, ActivityTimeline)
4. Basic dashboard widgets

### **Phase 2 - Advanced Features (Weeks 5-8)**
1. Follow-up management components
2. Analytics charts and dashboards
3. Manager oversight tools
4. Email template components

### **Phase 3 - Polish & Mobile (Weeks 9-12)**
1. Mobile-optimized components
2. Real-time features
3. Advanced filtering
4. Performance optimizations

### **Phase 4 - Advanced Analytics (Weeks 13-16)**
1. Advanced chart components
2. Forecasting visualizations
3. Team comparison tools
4. Export/reporting features

## 🎨 DESIGN SYSTEM GUIDELINES

### **Color Scheme for Sales Stages**
```css
--lead-new: #6B7280          /* Gray - New leads */
--lead-contacted: #3B82F6    /* Blue - Contacted */
--lead-interested: #10B981   /* Green - Interested */
--prospect-qualified: #F59E0B /* Amber - Qualified */
--prospect-analysis: #8B5CF6  /* Purple - Analysis */
--opportunity-proposal: #EC4899 /* Pink - Proposal */
--opportunity-negotiation: #F97316 /* Orange - Negotiation */
--client-won: #059669        /* Emerald - Won */
--client-lost: #DC2626       /* Red - Lost */
```

### **Typography Scale**
```css
--text-xs: 0.75rem;    /* Small labels */
--text-sm: 0.875rem;   /* Secondary text */
--text-base: 1rem;     /* Body text */
--text-lg: 1.125rem;   /* Card titles */
--text-xl: 1.25rem;    /* Page headings */
--text-2xl: 1.5rem;    /* Section headings */
```

This component specification provides complete coverage of the frontend interface needed for the sales CRM, ensuring all sales workflows are supported with intuitive, mobile-friendly components.