"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLeads } from "@/contexts/LeadContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  BuildingOfficeIcon, 
  CalendarIcon,
  ChartBarIcon,
  UserCircleIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

export default function LeadPage() {
  const { leadId } = useParams(); // gets 12b66c58-94d7-4c60-8c98-99ae4c24d66e
  const { fetchLead, isLoading, error, currentLead } = useLeads();
  const router = useRouter();

  useEffect(() => {
    if (leadId) {
      fetchLead(leadId as string);
    }
  }, [leadId, fetchLead]);

  if (isLoading) return (
        <div className="flex items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-red-600 text-lg">Error: {error}</div>
    </div>
  );
  
  if (!currentLead) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-lg">No lead found.</div>
    </div>
  );

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'qualified': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'contacted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'new': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'unqualified': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  // Helper function to get interest level badge color
  const getInterestBadgeColor = (interest: string) => {
    switch (interest) {
      case 'hot': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'warm': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cold': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  // Helper function to get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={() => {
          router.push("/dashboard")
        }} className='border border-black/50 px-4 py-2 mb-4'>Back to dashboard</button>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {currentLead.first_name} {currentLead.last_name}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
              {currentLead.title} at {currentLead.company}
            </p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(currentLead.status)}`}>
              {currentLead.status.charAt(0).toUpperCase() + currentLead.status.slice(1)}
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">Lead Score: </span>
              <span className={`text-2xl font-bold ${getScoreColor((currentLead as any).score)}`}>
                {currentLead.score}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Contact Info & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircleIcon className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900 dark:text-white">{currentLead.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900 dark:text-white">{currentLead.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Company</p>
                    <p className="text-gray-900 dark:text-white">{currentLead.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ChartBarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Title</p>
                    <p className="text-gray-900 dark:text-white">{currentLead.title}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Qualification & Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5" />
                Qualification Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Source</label>
                    <p className="text-gray-900 dark:text-white capitalize">{currentLead.source.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Source Details</label>
                    <p className="text-gray-900 dark:text-white">{(currentLead as any).source_details}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Qualification Status</label>
                    <p className="text-gray-900 dark:text-white capitalize">{(currentLead as any).qualification_status.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 mr-2">Interest Level</label>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getInterestBadgeColor((currentLead as any).interest_level)}`}>
                      {(currentLead as any).interest_level === 'hot'}
                      {(currentLead as any).interest_level === 'warm'}
                      {(currentLead as any).interest_level === 'cold'}
                      {(currentLead as any).interest_level.charAt(0).toUpperCase() + (currentLead as any).interest_level.slice(1)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Budget Range</label>
                    <p className="text-gray-900 dark:text-white">{(currentLead as any).budget_range}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Timeline</label>
                    <p className="text-gray-900 dark:text-white">{(currentLead as any).timeline}</p>
                  </div>
                </div>
              </div>
              
              {(currentLead as any).pain_points && (
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-500">Pain Points</label>
                  <p className="text-gray-900 dark:text-white mt-1">{(currentLead as any).pain_points}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes Card */}
          {currentLead.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DocumentTextIcon className="h-5 w-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{currentLead.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Timeline & Actions */}
        <div className="space-y-6">
          {/* Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Last Contacted</label>
                <p className="text-gray-900 dark:text-white">
                  {(currentLead as any).last_contacted ? formatDate((currentLead as any).last_contacted) : 'Never'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Next Follow-up</label>
                <p className="text-gray-900 dark:text-white">
                  {(currentLead as any).next_follow_up ? formatDate((currentLead as any).next_follow_up) : 'Not scheduled'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Conversion Status</label>
                <p className="text-gray-900 dark:text-white">
                  {(currentLead as any).converted_to_opportunity ? 'Converted to Opportunity' : 'Not Converted'}
                </p>
              </div>
              {(currentLead as any).conversion_date && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Conversion Date</label>
                  <p className="text-gray-900 dark:text-white">{formatDate((currentLead as any).conversion_date)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-gray-900 dark:text-white">{formatDate(currentLead.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-900 dark:text-white">{formatDate(currentLead.updated_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Lead ID</label>
                <p className="text-gray-900 dark:text-white font-mono text-xs">{currentLead.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button fullWidth variant="primary">
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button fullWidth variant="outline">
                <PhoneIcon className="h-4 w-4 mr-2" />
                Log Call
              </Button>
              <Button fullWidth variant="outline">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Schedule Follow-up
              </Button>
              <Button fullWidth variant="outline">
                Edit Lead
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}