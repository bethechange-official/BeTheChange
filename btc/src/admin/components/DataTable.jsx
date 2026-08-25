import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export function DataTable({
  columns = [],
  data = [],
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  filterComponent,
  actionButton,
  pageSize = 8
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = data.slice(startIndex, startIndex + pageSize);

  return (
    <div className="bg-white border border-gray-200/80 rounded-xl shadow-2xs overflow-hidden">
      {/* Header bar with Search & Filters */}
      <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-gray-50/50">
        <div className="flex flex-1 items-center gap-3">
          {onSearchChange && (
            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={searchPlaceholder}
                className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
              />
            </div>
          )}
          {filterComponent}
        </div>

        {actionButton && <div>{actionButton}</div>}
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-600">
          <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-[10px] border-b border-gray-100">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-5 py-3.5 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-gray-400 font-light text-sm">
                  No items found.
                </td>
              </tr>
            ) : (
              currentData.map((row, rowIdx) => (
                <tr key={row.id || rowIdx} className="hover:bg-gray-50/80 transition-colors">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-5 py-4 ${col.className || ''}`}>
                      {col.cell ? col.cell(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {data.length > 0 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-gray-50/30">
          <span>
            Showing <strong className="font-semibold text-gray-900">{startIndex + 1}</strong> to{' '}
            <strong className="font-semibold text-gray-900">{Math.min(startIndex + pageSize, data.length)}</strong> of{' '}
            <strong className="font-semibold text-gray-900">{data.length}</strong> results
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-gray-200 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="px-3 py-1 font-semibold text-gray-900">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-gray-200 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
