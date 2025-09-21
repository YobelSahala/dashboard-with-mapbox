import { useMemo, useEffect, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { useFilterStore } from '../store/useFilterStore';
import { loadCSVData } from '../utils/csvLoader';
import type { DataUsageRecord } from '../types/data';

// Import CSV file as text
import csvData from '../../data.csv?raw';

const columnHelper = createColumnHelper<DataUsageRecord>();

const DataTable = () => {
  const { category, status, search, apn } = useFilterStore();
  const [data, setData] = useState<DataUsageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🚀 Starting CSV parsing...');
        
        const parsedData = await loadCSVData(csvData);
        setData(parsedData);
        
        console.log('✅ CSV parsing completed!');
      } catch (err) {
        console.error('❌ Failed to load CSV:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.accessor('msisdn', {
        header: 'MSISDN',
        cell: info => (
          <div className="font-mono text-sm">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('kelurahan', {
        header: 'Location',
        cell: info => (
          <div className="text-sm">
            <div className="font-medium">{info.getValue()}</div>
            <div className="text-xs text-gray-500">{info.row.original.kecamatan}</div>
          </div>
        ),
      }),
      columnHelper.accessor('data_usage_raw_total', {
        header: 'Data Usage',
        cell: info => {
          const bytes = info.getValue() || 0;
          const mb = bytes / (1024 * 1024);
          return (
            <div className="font-mono text-sm">
              {mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`}
            </div>
          );
        },
      }),
      columnHelper.accessor('region', {
        header: 'Region',
        cell: info => (
          <div className="badge badge-outline text-xs">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('current_billing_status', {
        header: 'Status',
        cell: info => {
          const status = info.getValue();
          const badgeClass = {
            'IN-BILLING': 'badge-success',
            'OUT-OF-BILLING': 'badge-warning',
            'SUSPENDED': 'badge-error'
          }[status] || 'badge-ghost';
          
          return (
            <div className={`badge ${badgeClass} text-xs`}>
              {status}
            </div>
          );
        },
      }),
    ],
    []
  );

  const filteredData = useMemo(() => {
    return data.filter(record => {
      const matchesCategory = !category || record.region === category;
      const matchesStatus = !status || record.current_billing_status === status;
      const matchesApn = !apn || record.apn_name === apn;
      const matchesSearch = !search ||
        (record.msisdn && record.msisdn.toString().toLowerCase().includes(search.toLowerCase())) ||
        (record.kelurahan && record.kelurahan.toString().toLowerCase().includes(search.toLowerCase())) ||
        (record.kecamatan && record.kecamatan.toString().toLowerCase().includes(search.toLowerCase()));

      return matchesCategory && matchesStatus && matchesApn && matchesSearch;
    });
  }, [data, category, status, apn, search]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 6,
      },
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <div className="mt-4 text-sm text-base-content/70">
            Loading CSV data... This may take a moment for large files.
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <div>
          <strong>Error loading data:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 text-sm text-base-content/70">
        📊 Loaded {data.length} records from CSV | Showing {filteredData.length} after filters
      </div>
      <table className="table table-zebra w-full">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="cursor-pointer select-none"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-2">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="hover">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {filteredData.length === 0 && (
        <div className="text-center py-8 text-base-content/60">
          No records found matching the current filters.
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-base-content/70">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              filteredData.length
            )}{' '}
            of {filteredData.length} records
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            className="btn btn-sm btn-outline"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </button>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </button>
          
          <span className="flex items-center gap-1 text-sm">
            Page{' '}
            <strong>
              {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </strong>
          </span>
          
          <button
            className="btn btn-sm btn-outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </button>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;