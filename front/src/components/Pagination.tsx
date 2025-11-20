import React from 'react'
import { Button } from './ui/Button'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface IPagination{
    pagination: any,
    handlePrevious: any,
    currentPage: any,
    handleNext: any,
    getPageNumbers: any,
    handlePageChange: any    
}

export default function Pagination({
    pagination,
    handlePrevious,
    currentPage,
    handleNext,
    getPageNumbers,
    handlePageChange
}: IPagination) {
  return (
    <div>
      {pagination?.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-neutral-200 pt-6 dark:border-neutral-700">
                <div className="flex flex-1 justify-between sm:hidden">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    leftIcon={<ChevronLeftIcon className="h-4 w-4" />}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleNext}
                    disabled={currentPage === pagination?.totalPages}
                    rightIcon={<ChevronRightIcon className="h-4 w-4" />}
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                      Showing{' '}
                      <span className="font-medium">
                        {(currentPage - 1) * pagination?.pageSize + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * pagination?.pageSize, pagination?.total)}
                      </span>{' '}
                      of <span className="font-medium">{pagination?.total}</span> results
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentPage === 1}
                      className="px-3"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                    </Button>

                    {getPageNumbers().map((pageNum: any) => (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "ghost" : "outline"}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 hover:text-white ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white hover:bg-blue-600 hover:text-white'
                            : "hover:text-blue-600"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      onClick={handleNext}
                      disabled={currentPage === pagination?.totalPages}
                      className="px-3"
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
    </div>
  )
}
