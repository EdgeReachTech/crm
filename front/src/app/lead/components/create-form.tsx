'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LeadFormData, LeadFormProps } from '@/types/leadTypes';
import { useLeads } from '@/contexts/LeadContext';
import { useRouter, useSearchParams } from 'next/navigation';



export default function LeadForm() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const leadId = searchParams.get("lead_id");

  const router = useRouter();

    const { fetchLead, isLoading, error, currentLead: initialData, createLead, updateLead } = useLeads();
  
    useEffect(() => {
      if (leadId) {
        fetchLead(leadId as string);
      }
    }, [leadId, fetchLead]);
  
    const DEFAULT_FORM_DATA: LeadFormData = {
      firstName: '',
      lastName: '',
      email: '',
      company: '',
      phone: '',
      title: '',
      source: 'website',
      source_details: '',
      status: 'new',
      interest_level: 'cold',
      qualification_status: 'unqualified',
      current_stage_id: '',
      score: 0,
      budget_range: '',
      timeline: '',
      pain_points: '',
      decision_maker_contact: '',
      next_follow_up: '',
      converted_to_opportunity: false,
      conversion_date: '',
      owner_id: user?.id || '',
      notes: '',
      last_contacted: '',
    };
  

  // Helper to map API data to form data
  const mapApiToFormData = (apiData: any): Partial<LeadFormData> => {
    if (!apiData) return {};
    
    return {
      firstName: apiData.first_name || '',
      lastName: apiData.last_name || '',
      email: apiData.email || '',
      company: apiData.company || '',
      phone: apiData.phone || '',
      title: apiData.title || '',
      source: apiData.source || 'website',
      source_details: apiData.source_details || '',
      status: apiData.status || 'new',
      interest_level: apiData.interest_level || 'cold',
      qualification_status: apiData.qualification_status || 'unqualified',
      current_stage_id: apiData.current_stage_id || '',
      score: apiData.score || 0,
      budget_range: apiData.budget_range || '',
      timeline: apiData.timeline || '',
      pain_points: apiData.pain_points || '',
      decision_maker_contact: apiData.decision_maker_contact || '',
      next_follow_up: apiData.next_follow_up || '',
      converted_to_opportunity: apiData.converted_to_opportunity || false,
      conversion_date: apiData.conversion_date || '',
      notes: apiData.notes || '',
      last_contacted: apiData.last_contacted || '',
      // owner_id is handled separately in DEFAULT_FORM_DATA
    };
  };

  const [data, setData] = useState<LeadFormData>({
    ...DEFAULT_FORM_DATA,
    ...mapApiToFormData(initialData)
  });

  useEffect(() => {
  if (initialData) {
    setData({
      ...DEFAULT_FORM_DATA,
      ...mapApiToFormData(initialData),
      owner_id: user?.id || ''
    });
  }
}, [initialData, user?.id]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  // const { error, isLoading } = useLeads();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!data.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!data.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email))
      newErrors.email = 'Valid email is required';
    if (!data.company.trim()) newErrors.company = 'Company is required';
    if (!data.source) newErrors.source = 'Source is required';
    if (data.score < 0 || data.score > 100)
      newErrors.score = 'Score must be between 0 and 100';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

    if (leadId && isLoading && !initialData?.first_name) return (
        <div className="flex items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
    );
    
    if (error && leadId) return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-red-600 text-lg">Error: {error}</div>
      </div>
    );
    
    if (leadId && !isLoading && !initialData) return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">No lead found.</div>
      </div>
    );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { id, type, value, checked }: any = e.target;
    
    if (id === 'score') {
      setData((prev) => ({
        ...prev,
        [id]: Number(value),
      }));
      return;
    }

    if (type === 'checkbox') {
      setData((prev) => ({
        ...prev,
        [id]: checked,
      }));
      return;
    }

    setData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setMessage('Please fix the errors in the form.');
      return;
    }

    try {
      setMessage(null);

      let response;

      if(initialData?.id){
        response = await updateLead(initialData?.id, data)
      }else {
        response = await createLead(data as any);
      }

      if(response?.id){
        router.push("/dashboard")
      }
    } catch {
      setMessage('Failed to submit form.');
    }
  };

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
       <div className='flex items-center justify-between'>
         <h2 className="mb-4 text-2xl font-semibold">
          {initialData?.first_name ? 'Edit Lead' : 'Create New Lead'}
        </h2>
        <button onClick={() => {
          router.push("/dashboard")
        }} className='border border-black/50 px-4 py-2'>Back to dashboard</button>
       </div>

        <form onSubmit={handleSubmit}>
          {/* BASIC INFO */}
          <h3 className="mb-3 text-lg font-medium">Basic Info</h3>
          <div className="mb-4 grid gap-3">
            <div>
              <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700">
                First Name *
              </label>
              <input
                id="firstName"
                type="text"
                value={data.firstName}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.firstName && (
                <small className="text-sm text-red-500">{errors.firstName}</small>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700">
                Last Name *
              </label>
              <input
                id="lastName"
                type="text"
                value={data.lastName}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.lastName && (
                <small className="text-sm text-red-500">{errors.lastName}</small>
              )}
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={data.email}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && (
                <small className="text-sm text-red-500">{errors.email}</small>
              )}
            </div>

            <div>
              <label htmlFor="company" className="mb-1 block text-sm font-medium text-gray-700">
                Company *
              </label>
              <input
                id="company"
                type="text"
                value={data.company}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.company && (
                <small className="text-sm text-red-500">{errors.company}</small>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                id="phone"
                type="text"
                value={data.phone}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
                Job Title
              </label>
              <input
                id="title"
                type="text"
                value={data.title}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* QUALIFICATION */}
          <h3 className="mb-3 text-lg font-medium">Qualification</h3>
          <div className="mb-4 grid gap-3">
            <div>
              <label htmlFor="source" className="mb-1 block text-sm font-medium text-gray-700">
                Source *
              </label>
              <select
                id="source"
                value={data.source}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="website">Website</option>
                <option value="linkedin">LinkedIn</option>
                <option value="referral">Referral</option>
                <option value="cold_outreach">Cold Outreach</option>
                <option value="event">Event</option>
                <option value="partner">Partner</option>
                <option value="other">Other</option>
              </select>
              {errors.source && (
                <small className="text-sm text-red-500">{errors.source}</small>
              )}
            </div>

            <div>
              <label htmlFor="source_details" className="mb-1 block text-sm font-medium text-gray-700">
                Source Details
              </label>
              <input
                id="source_details"
                type="text"
                value={data.source_details}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                value={data.status}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="unqualified">Unqualified</option>
              </select>
            </div>

            <div>
              <label htmlFor="interest_level" className="mb-1 block text-sm font-medium text-gray-700">
                Interest Level
              </label>
              <select
                id="interest_level"
                value={data.interest_level}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hot">Hot</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
              </select>
            </div>

            <div>
              <label htmlFor="qualification_status" className="mb-1 block text-sm font-medium text-gray-700">
                Qualification Status
              </label>
              <select
                id="qualification_status"
                value={data.qualification_status}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="unqualified">Unqualified</option>
                <option value="marketing_qualified">Marketing Qualified</option>
                <option value="sales_qualified">Sales Qualified</option>
              </select>
            </div>

            <div>
              <label htmlFor="score" className="mb-1 block text-sm font-medium text-gray-700">
                Lead Score (0–100) *
              </label>
              <input
                id="score"
                type="number"
                min={0}
                max={100}
                value={data.score}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.score && (
                <small className="text-sm text-red-500">{errors.score}</small>
              )}
            </div>

            <div>
              <label htmlFor="budget_range" className="mb-1 block text-sm font-medium text-gray-700">
                Budget Range
              </label>
              <input
                id="budget_range"
                type="text"
                value={data.budget_range}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="timeline" className="mb-1 block text-sm font-medium text-gray-700">
                Timeline
              </label>
              <input
                id="timeline"
                type="text"
                value={data.timeline}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="pain_points" className="mb-1 block text-sm font-medium text-gray-700">
                Pain Points
              </label>
              <textarea
                id="pain_points"
                value={data.pain_points}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>

          {/* FOLLOW-UP & CONVERSION */}
          <h3 className="mb-3 text-lg font-medium">Follow-Up & Conversion</h3>
          <div className="mb-4 grid gap-3">
            <div>
              <label htmlFor="last_contacted" className="mb-1 block text-sm font-medium text-gray-700">
                Last Contacted
              </label>
              <input
                id="last_contacted"
                type="date"
                value={formatDateForInput(data.last_contacted)}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="next_follow_up" className="mb-1 block text-sm font-medium text-gray-700">
                Next Follow-Up
              </label>
              <input
                id="next_follow_up"
                type="date"
                value={formatDateForInput(data.next_follow_up)}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="converted_to_opportunity"
                checked={data.converted_to_opportunity}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="converted_to_opportunity" className="text-sm font-medium text-gray-700">
                Converted to Opportunity
              </label>
            </div>

            {data.converted_to_opportunity && (
              <div>
                <label htmlFor="conversion_date" className="mb-1 block text-sm font-medium text-gray-700">
                  Conversion Date
                </label>
                <input
                  id="conversion_date"
                  type="date"
                  value={formatDateForInput(data.conversion_date)}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* ADDITIONAL INFO */}
          <h3 className="mb-3 text-lg font-medium">Additional Info</h3>
          <div className="grid gap-3">
            <div>
              <label htmlFor="notes" className="mb-1 block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                value={data.notes}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>

          {/* MESSAGE */}
          {(error || message) && (
            <div className="mt-4 rounded border border-red-200 bg-red-50 p-2 text-red-800">
              {error ?? message}
            </div>
          )}

          {/* BUTTONS */}
          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-md bg-green-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-green-400"
            >
              {isLoading
                ? 'Saving...'
                : initialData?.id
                  ?  'Save Changes'
                  : 'Create Lead'
                }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}