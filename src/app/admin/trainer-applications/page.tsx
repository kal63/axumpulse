'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Search, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { apiClient, TrainerApplication } from '@/lib/api-client';
import { toast } from 'sonner';
import { PaginatedTable } from '@/components/pagination/PaginatedTable';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending Review',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: Clock
  },
  under_review: {
    label: 'Under Review',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: FileText
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: CheckCircle
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: XCircle
  }
};

export default function TrainerApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<TrainerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page,
        pageSize
      };

      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (searchQuery) {
        params.q = searchQuery;
      }

      const response = await apiClient.getTrainerApplications(params);

      if (response.success && response.data) {
        setApplications(response.data.items || []);
        if (response.data.pagination) {
          setTotalItems(response.data.pagination.totalItems);
          setTotalPages(response.data.pagination.totalPages);
        }
      } else {
        toast.error(response.error?.message || 'Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('An error occurred while fetching applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page, pageSize, statusFilter, searchQuery]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1); // Reset to first page on new search
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
    setSearchInput('');
    setPage(1);
  };

  const handleRowClick = (application: TrainerApplication) => {
    router.push(`/admin/trainer-applications/${application.id}`);
  };

  const columns = [
    {
      key: 'user',
      header: 'Applicant',
      render: (app: TrainerApplication) => (
        <div>
          <p className="font-medium text-gray-900">{app.user?.name || 'N/A'}</p>
          <p className="text-sm text-gray-500">{app.user?.phone || 'N/A'}</p>
          {app.user?.email && <p className="text-xs text-gray-400">{app.user.email}</p>}
        </div>
      )
    },
    {
      key: 'specialties',
      header: 'Specialties',
      render: (app: TrainerApplication) => (
        <div className="flex flex-wrap gap-1">
          {Array.isArray(app.specialties) && app.specialties.slice(0, 2).map((specialty, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {specialty}
            </Badge>
          ))}
          {Array.isArray(app.specialties) && app.specialties.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{app.specialties.length - 2}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'yearsOfExperience',
      header: 'Experience',
      render: (app: TrainerApplication) => (
        <span className="text-sm">
          {app.yearsOfExperience ? `${app.yearsOfExperience} years` : 'Not specified'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (app: TrainerApplication) => {
        const config = STATUS_CONFIG[app.status] || {
          label: 'Unknown Status',
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: AlertCircle
        };
        const Icon = config.icon;
        return (
          <Badge className={`${config.color} border`}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        );
      }
    },
    {
      key: 'submittedAt',
      header: 'Submitted',
      render: (app: TrainerApplication) => (
        <div className="text-sm">
          <p>{new Date(app.submittedAt).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">
            {new Date(app.submittedAt).toLocaleTimeString()}
          </p>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (app: TrainerApplication) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/admin/trainer-applications/${app.id}`);
          }}
        >
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trainer Applications</h1>
          <p className="text-gray-500 mt-1">
            Review and manage trainer application submissions
          </p>
        </div>
        <Button onClick={fetchApplications} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
          <CardDescription>
            Search and filter trainer applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, phone, or email..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(statusFilter !== 'all' || searchQuery) && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Active filters:</span>
              {statusFilter !== 'all' && (
                <Badge variant="secondary">
                  Status: {STATUS_CONFIG[statusFilter as keyof typeof STATUS_CONFIG]?.label || statusFilter}
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary">
                  Search: {searchQuery}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="ml-2"
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Applications ({totalItems})
          </CardTitle>
          <CardDescription>
            Click on any row to view full application details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaginatedTable<TrainerApplication>
            columns={columns}
            data={applications}
            currentPage={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={(newSize: number) => {
              setPageSize(newSize);
              setPage(1);
            }}
            loading={loading}
            emptyMessage="No trainer applications found"
            onRowClick={handleRowClick}
          />
        </CardContent>
      </Card>
    </div>
  );
}

