import React, { useState } from 'react';
import { DataTable } from '../components/DataTable';
import type { ColumnDef } from '../components/DataTable';
import { User, Shield, Briefcase, Mail } from 'lucide-react';

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  joinDate: string;
  status: 'Active' | 'Inactive';
  performance: number;
}

const generateMockData = (count: number): MockUser[] => {
  const roles = ['Student', 'Teacher', 'HOD', 'Admin'];
  const depts = ['Computer Science', 'Mathematics', 'Physics', 'Biology'];
  const statuses: ('Active' | 'Inactive')[] = ['Active', 'Inactive'];
  
  return Array.from({ length: count }).map((_, i) => ({
    id: `USR-${1000 + i}`,
    name: `Test User ${i + 1}`,
    email: `user${i + 1}@college.edu`,
    role: roles[Math.floor(Math.random() * roles.length)],
    department: depts[Math.floor(Math.random() * depts.length)],
    joinDate: new Date(2020 + Math.random() * 4, Math.random() * 12, Math.random() * 28).toISOString().split('T')[0],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    performance: Number((Math.random() * 100).toFixed(2)),
  }));
};

const MOCK_DATA = generateMockData(150);

export default function DataTableDemo() {
  const [data, setData] = useState(MOCK_DATA);

  const columns: ColumnDef<MockUser>[] = [
    {
      header: 'User Info',
      accessorKey: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{row.name}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3"/> {row.email}</p>
          </div>
        </div>
      ),
      sortable: true
    },
    {
      header: 'Role & Dept',
      accessorKey: 'role',
      cell: (row) => (
        <div>
          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center w-fit gap-1 mb-1">
            <Shield className="w-3 h-3" /> {row.role}
          </span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Briefcase className="w-3 h-3" /> {row.department}
          </span>
        </div>
      )
    },
    {
      header: 'Join Date',
      accessorKey: 'joinDate',
      sortable: true,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {row.status}
        </span>
      ),
      sortable: true
    },
    {
      header: 'Performance',
      accessorKey: 'performance',
      align: 'right',
      cell: (row) => (
        <div className="font-mono text-gray-900 dark:text-white">
          {row.performance}%
        </div>
      ),
      sortable: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Data Table Component Demo</h1>
          <p className="text-gray-600 dark:text-gray-400">Testing client-side sorting, pagination, global filtering, and row selection.</p>
        </div>

        <DataTable 
          data={data}
          columns={columns}
          title="User Directory"
          searchable={true}
          exportable={true}
          selectable={true}
          defaultPageSize={10}
          onRowSelect={(rows) => console.log('Selected:', rows)}
        />
      </div>
    </div>
  );
}
