import React, { useState, useMemo } from 'react';
import { 
  ChevronUp, ChevronDown, ChevronsUpDown, Search, 
  ChevronLeft, ChevronRight, Download, FileX, Filter 
} from 'lucide-react';

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T | string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  searchable?: boolean;
  exportable?: boolean;
  selectable?: boolean;
  onRowSelect?: (selectedRows: T[]) => void;
  emptyStateMessage?: string;
  title?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  pageSizeOptions = [10, 20, 50, 100],
  defaultPageSize = 10,
  searchable = true,
  exportable = true,
  selectable = false,
  onRowSelect,
  emptyStateMessage = "No records found.",
  title,
}: DataTableProps<T>) {
  
  // State
  const [globalFilter, setGlobalFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set());

  // Deep value resolver for nested accessor keys (e.g., "user.name")
  const resolveValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  // 1. Filtering
  const filteredData = useMemo(() => {
    if (!globalFilter) return data;
    const lowerFilter = globalFilter.toLowerCase();
    return data.filter((row) => 
      columns.some((col) => {
        if (!col.accessorKey) return false;
        const val = resolveValue(row, col.accessorKey as string);
        return val != null && String(val).toLowerCase().includes(lowerFilter);
      })
    );
  }, [data, globalFilter, columns]);

  // 2. Sorting
  const sortedData = useMemo(() => {
    let sortableData = [...filteredData];
    if (sortConfig) {
      sortableData.sort((a, b) => {
        const valA = resolveValue(a, sortConfig.key);
        const valB = resolveValue(b, sortConfig.key);
        
        if (valA == null) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valB == null) return sortConfig.direction === 'asc' ? 1 : -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        }

        // Try date parsing if it looks like a date string
        const dateA = Date.parse(valA as string);
        const dateB = Date.parse(valB as string);
        if (!isNaN(dateA) && !isNaN(dateB)) {
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }

        // String comparison
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableData;
  }, [filteredData, sortConfig]);

  // 3. Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  
  // Ensure current page is valid after filtering
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  
  const paginatedData = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, validCurrentPage, pageSize]);

  // Handlers
  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        return null; // Toggle off
      }
      return { key, direction: 'asc' };
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = new Set(paginatedData.map((_, i) => (validCurrentPage - 1) * pageSize + i));
      setSelectedRowIds(allIds);
      onRowSelect?.(paginatedData);
    } else {
      setSelectedRowIds(new Set());
      onRowSelect?.([]);
    }
  };

  const handleSelectRow = (index: number, row: T) => {
    const newSelected = new Set(selectedRowIds);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRowIds(newSelected);
    
    if (onRowSelect) {
      const selected = sortedData.filter((_, i) => newSelected.has(i));
      onRowSelect(selected);
    }
  };

  const exportToCSV = () => {
    // Generate headers
    const headers = columns
      .filter(c => c.accessorKey)
      .map(c => c.header)
      .join(',');

    // Generate rows
    const rows = sortedData.map(row => 
      columns
        .filter(c => c.accessorKey)
        .map(c => {
          const val = resolveValue(row, c.accessorKey as string);
          // Escape quotes and wrap in quotes
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col w-full overflow-hidden">
      
      {/* Table Toolbar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 dark:bg-gray-900/50">
        {title && <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h2>}
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {searchable && (
            <div className="relative flex-1 sm:min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search all columns..."
                value={globalFilter}
                onChange={(e) => {
                  setGlobalFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          )}
          
          {exportable && (
            <button
              onClick={exportToCSV}
              className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm font-medium"
              title="Export to CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 select-none">
            <tr>
              {selectable && (
                <th className="px-4 py-3 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    onChange={handleSelectAll}
                    checked={paginatedData.length > 0 && selectedRowIds.size >= paginatedData.length}
                  />
                </th>
              )}
              {columns.map((col, idx) => (
                <th 
                  key={idx}
                  className={`px-4 py-3 font-semibold tracking-wide ${col.sortable !== false && col.accessorKey ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors' : ''}`}
                  style={{ width: col.width, textAlign: col.align || 'left' }}
                  onClick={() => col.sortable !== false && col.accessorKey && handleSort(col.accessorKey as string)}
                >
                  <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                    {col.header}
                    {col.sortable !== false && col.accessorKey && (
                      <span className="text-gray-400">
                        {sortConfig?.key === col.accessorKey ? (
                          sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />
                        ) : (
                          <ChevronsUpDown className="w-4 h-4 opacity-50" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => {
                const absoluteIndex = (validCurrentPage - 1) * pageSize + rowIdx;
                const isSelected = selectedRowIds.has(absoluteIndex);
                
                return (
                  <tr 
                    key={absoluteIndex} 
                    className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                  >
                    {selectable && (
                      <td className="px-4 py-3 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={isSelected}
                          onChange={() => handleSelectRow(absoluteIndex, row)}
                        />
                      </td>
                    )}
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className="px-4 py-3" style={{ textAlign: col.align || 'left' }}>
                        {col.cell 
                          ? col.cell(row) 
                          : col.accessorKey ? String(resolveValue(row, col.accessorKey as string) ?? '-') : '-'}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <FileX className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm">{emptyStateMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="hidden sm:inline">Rows per page:</span>
          <select 
            value={pageSize} 
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded text-sm py-1 pl-2 pr-6 outline-none focus:ring-2 focus:ring-blue-500"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>
            {sortedData.length === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1}-
            {Math.min(validCurrentPage * pageSize, sortedData.length)} of {sortedData.length}
          </span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={validCurrentPage === 1}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage === totalPages || totalPages === 0}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
