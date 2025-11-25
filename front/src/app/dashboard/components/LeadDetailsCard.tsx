'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  DocumentDuplicateIcon,
  EllipsisVerticalIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { useLeads } from '@/contexts/LeadContext';
import SmallLoading from '@/components/smallLoading';

interface LeadDetailsCardProps {
  lead: any;
  onDelete?: () => void;
}

export default function LeadDetailsCard({ lead }: LeadDetailsCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { createLead, isLoading, error, clearError, deleteLead, fetchLeads } = useLeads();

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);


  const handleEdit = () => {
    router.push(`/lead/create-lead?lead_id=${lead.id}`);
    setShowDropdown(false);
  };

  const handleView = () => {
    router.push(`/lead/view/${lead.id}`);
    setShowDropdown(false);
  };

  const handleDuplicate = async () => {
    // Implement duplicate logic
    const duplicate = { ...lead, firstName: lead.first_name, lastName: lead.last_name }
    const response = await createLead(duplicate);
    if(response?.id){
      await fetchLeads()
      setShowDropdown(false);
    }
  };

  const handleSendEmail = () => {
    // Implement send email logic
    console.log('Send email to:', lead.email);
    setShowDropdown(false);
  };

  // const handleCall = () => {
  //   // Implement call logic
  //   console.log('Call:', lead.phone);
  //   setShowDropdown(false);
  // };

  const handleDelete = async () => {
    if (!window.confirm(`Delete lead ${lead.first_name} ${lead.last_name}?`)) {
      setShowDropdown(false);
      return;
    }

    setIsDeleting(true);
    try {
     await deleteLead(lead?.id);
     await fetchLeads()
      setShowDropdown(false);
    } catch (err) {
      alert('Failed to delete lead: ' + ((err as any)?.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
      setShowDropdown(false);
    }
  };

  const getInterestBadgeVariant = (interest?: string) => {
    switch (interest) {
      case 'hot':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'warm':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cold':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200';
    }
  };

  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case 'qualified':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'contacted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'new':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'unqualified':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200';
    }
  };

  if(error){
    <div className="fixed inset-0 flex items-center justify-center bg-black/30">
    <div className="bg-white p-4 rounded shadow w-80">
      <p className="text-red-600 font-semibold mb-3">{error}</p>

      <button
        className="bg-red-600 text-white px-4 py-2 rounded"
        onClick={clearError}
      >
        Clear
      </button>
    </div>
  </div>
  }

  return (
    <div onClick={handleView}>
      <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] h-full flex flex-col group">
        <CardHeader className="pb-4 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate text-neutral-900 dark:text-neutral-100">
                {lead.firstName} {lead.lastName}
              </CardTitle>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate mt-1">
                {lead.company}
              </p>
            </div>

            {/* Score and Dropdown */}
            <div className="flex items-center gap-2">
              {lead.score !== undefined && (
                <div className={`p-2 text-center border border-black/20`}>
                  <p className="text-[8px] font-semibold opacity-75">Score</p>
                  <p className="text-xs font-bold">{lead.score}</p>
                </div>
              )}
              
              {/* Dropdown Menu */}
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(!showDropdown)
                  }}
                >
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </Button>
                
                {showDropdown && (
                  <div className="absolute right-0 top-10 z-10 w-48 bg-white dark:bg-neutral-800  shadow-lg border border-neutral-200 dark:border-neutral-700 py-1">
                    <button
                      onClick={handleView}
                      className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                      <EyeIcon className="h-4 w-4 mr-3" />
                      View Details
                    </button>
                    <button
                      onClick={handleEdit}
                      className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                      <PencilIcon className="h-4 w-4 mr-3" />
                      Edit Lead
                    </button>
                    <button
                      onClick={handleDuplicate}
                      className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                      {isLoading ?  <SmallLoading/> : <DocumentDuplicateIcon className="h-4 w-4 mr-3" />}
                      Duplicate
                    </button>
                    <button
                      onClick={handleSendEmail}
                      className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                      <EnvelopeIcon className="h-4 w-4 mr-3" />
                      Send Email
                    </button>
                    <div className="border-t border-neutral-200 dark:border-neutral-700 my-1"></div>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 disabled:opacity-50"
                    >
                      {isDeleting ? <SmallLoading /> : <TrashIcon className="h-4 w-4 mr-3" />}
                      {isDeleting ? 'Deleting...' : 'Delete Lead'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-4">
          {/* Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <EnvelopeIcon className="h-4 w-4 mr-2 text-neutral-400" />
              <span className="text-neutral-900 dark:text-neutral-100 truncate">{lead.email}</span>
            </div>
            {lead.phone && (
              <div className="flex items-center text-sm">
                <PhoneIcon className="h-4 w-4 mr-2 text-neutral-400" />
                <span className="text-neutral-900 dark:text-neutral-100">{lead.phone}</span>
              </div>
            )}
            {lead.title && (
              <div className="text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Title: </span>
                <span className="text-neutral-900 dark:text-neutral-100">{lead.title}</span>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {lead.status && (
              <span className={`px-3 py-1  text-xs font-medium ${getStatusBadgeVariant(lead.status)}`}>
                {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
              </span>
            )}
            {lead.interest_level && (
              <span className={`px-3 py-1  text-xs font-medium ${getInterestBadgeVariant(lead.interest_level)}`}>
                {lead.interest_level === 'hot'}
                {lead.interest_level === 'warm'}
                {lead.interest_level === 'cold'}
                {lead.interest_level.charAt(0).toUpperCase() + lead.interest_level.slice(1)}
              </span>
            )}
          </div>

          {/* Tags */}
          {lead.tags && lead.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {lead.tags.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1  bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                >
                  #{tag}
                </span>
              ))}
              {lead.tags.length > 3 && (
                <span className="text-xs px-2 py-1 text-neutral-500 dark:text-neutral-400">
                  +{lead.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Notes preview */}
          {lead.notes && (
            <div className="mt-2 p-3 bg-neutral-50 dark:bg-neutral-800 ">
              <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 italic">
                {lead.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}