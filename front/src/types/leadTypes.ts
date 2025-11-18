export interface LeadFormData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone?: string;
  title?: string;
  source: 'website' | 'linkedin' | 'referral' | 'cold_outreach' | 'event' | 'partner' | 'other';
  source_details?: string;
  status: 'new' | 'contacted' | 'qualified' | 'unqualified';
  interest_level: 'hot' | 'warm' | 'cold';
  qualification_status: 'unqualified' | 'marketing_qualified' | 'sales_qualified';
  current_stage_id?: string;
  score: number;
  budget_range?: string;
  timeline?: string;
  pain_points?: string;
  decision_maker_contact?: string;
  next_follow_up?: string;
  converted_to_opportunity: boolean;
  conversion_date?: string;
  owner_id: string;
  notes?: string;
  last_contacted?: string;
}

export interface LeadFormProps {
  mode?: 'create' | 'edit';
  initialData?: Partial<LeadFormData>;
  onSubmit: (data: LeadFormData) => Promise<void>;
  onCancel?: () => void;
  setLeadId: React.Dispatch<React.SetStateAction<string>>
}

export const leads = [
  {
    id: 'bdd4ded3-3a9b-4e91-8f3d-fcfd4dc676a2',
    tenant_id: '4ab5d82b-30e2-4e42-b369-47d88ffe4f3c',
    created_at: new Date('2025-11-15T11:33:52.190Z'),
    updated_at: new Date('2025-11-15T11:33:52.190Z'),
    firstName: 'Alice',
    lastName: 'Niyonsaba',
    email: 'alice.niyonsaba@example.com',
    company: 'EdgeReachTech',
    phone: '0781705734',
    title: 'IT',
    source: 'referral',
    source_details: 'www.coroute.ca',
    status: 'unqualified',
    interest_level: 'warm',
    qualification_status: 'unqualified',
    current_stage_id: undefined,
    score: 57,
    budget_range: '10000 - 70000',
    timeline: 'Within 6 months',
    pain_points: 'Every single we have to try twice in order to get him',
    decision_maker_contact: undefined,
    next_follow_up: new Date('2025-11-30T00:00:00.000Z'),
    converted_to_opportunity: false,
    conversion_date: undefined,
    owner_id: '92cac60a-6e3c-4c3d-b4bb-6b193bd17560',
    notes: 'This lead is for our client in case he believes in us',
    last_contacted: new Date('2025-11-07T00:00:00.000Z')
  },
  {
    id: 'a1f2b3c4-5678-4e91-8f3d-fcfd4dc676b1',
    tenant_id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    created_at: new Date('2025-11-12T09:20:00.000Z'),
    updated_at: new Date('2025-11-14T15:45:00.000Z'),
    firstName: 'Jean',
    lastName: 'Mukamana',
    email: 'jean.mukamana@example.com',
    company: 'TechBridge Ltd',
    phone: '0788123456',
    title: 'Procurement Officer',
    source: 'linkedin',
    source_details: 'LinkedIn campaign',
    status: 'new',
    interest_level: 'cold',
    qualification_status: 'unqualified',
    score: 23,
    budget_range: '5000 - 15000',
    timeline: 'Within 3 months',
    pain_points: 'Needs reliable supplier for IT equipment',
    next_follow_up: new Date('2025-11-25T00:00:00.000Z'),
    converted_to_opportunity: false,
    owner_id: 'c2d3e4f5-6789-4c3d-b4bb-6b193bd17561',
    notes: 'Reached via LinkedIn ad campaign',
    last_contacted: new Date('2025-11-10T00:00:00.000Z')
  },
  {
    id: 'd4e5f6a7-1234-4e91-8f3d-fcfd4dc676c2',
    tenant_id: '8d9f6679-7425-40de-944b-e07fc1f90ae8',
    created_at: new Date('2025-11-10T08:00:00.000Z'),
    updated_at: new Date('2025-11-15T12:00:00.000Z'),
    firstName: 'Maria',
    lastName: 'Kamanzi',
    email: 'maria.kamanzi@example.com',
    company: 'BrightFuture Consulting',
    phone: '0789456123',
    title: 'HR Manager',
    source: 'event',
    source_details: 'Kigali Tech Expo',
    status: 'contacted',
    interest_level: 'warm',
    qualification_status: 'marketing_qualified',
    score: 65,
    budget_range: '20000 - 50000',
    timeline: 'Within 1 year',
    pain_points: 'Needs HR software integration',
    next_follow_up: new Date('2025-12-01T00:00:00.000Z'),
    converted_to_opportunity: false,
    owner_id: 'e3f4g5h6-7890-4c3d-b4bb-6b193bd17562',
    notes: 'Met at Kigali Tech Expo',
    last_contacted: new Date('2025-11-13T00:00:00.000Z')
  },
  {
    id: 'f7g8h9i0-2345-4e91-8f3d-fcfd4dc676d3',
    tenant_id: '9e0f6679-7425-40de-944b-e07fc1f90ae9',
    created_at: new Date('2025-11-09T10:15:00.000Z'),
    updated_at: new Date('2025-11-14T16:30:00.000Z'),
    firstName: 'David',
    lastName: 'Uwimana',
    email: 'david.uwimana@example.com',
    company: 'SmartLogistics Ltd',
    phone: '0789988776',
    title: 'Operations Manager',
    source: 'cold_outreach',
    source_details: 'Email campaign',
    status: 'qualified',
    interest_level: 'hot',
    qualification_status: 'sales_qualified',
    score: 89,
    budget_range: '30000 - 90000',
    timeline: 'Within 2 months',
    pain_points: 'Needs fleet management solution',
    next_follow_up: new Date('2025-11-20T00:00:00.000Z'),
    converted_to_opportunity: true,
    conversion_date: new Date('2025-11-14T00:00:00.000Z'),
    owner_id: 'f4g5h6i7-8901-4c3d-b4bb-6b193bd17563',
    notes: 'Strong interest in fleet solution',
    last_contacted: new Date('2025-11-14T00:00:00.000Z')
  },
  {
    id: 'g1h2i3j4-3456-4e91-8f3d-fcfd4dc676e4',
    tenant_id: '0f1g6679-7425-40de-944b-e07fc1f90ae0',
    created_at: new Date('2025-11-08T14:00:00.000Z'),
    updated_at: new Date('2025-11-15T09:00:00.000Z'),
    firstName: 'Claudine',
    lastName: 'Habimana',
    email: 'claudine.habimana@example.com',
    company: 'GreenEnergy Solutions',
    phone: '0787654321',
    title: 'Project Coordinator',
    source: 'partner',
    source_details: 'Partnership referral',
    status: 'contacted',
    interest_level: 'warm',
    qualification_status: 'marketing_qualified',
    score: 72,
    budget_range: '15000 - 60000',
    timeline: 'Within 9 months',
    pain_points: 'Needs renewable energy project support',
    next_follow_up: new Date('2025-11-28T00:00:00.000Z'),
    converted_to_opportunity: false,
    owner_id: 'g5h6i7j8-9012-4c3d-b4bb-6b193bd17564',
    notes: 'Partner referral from SolarTech',
    last_contacted: new Date('2025-11-12T00:00:00.000Z')
  },
  // … add 4 more in same pattern
];
