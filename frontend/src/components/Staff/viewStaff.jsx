import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance'; 
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faSync, faUser, faEnvelope, faIdCard, faCircle, faSearch, faFilter, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

const ViewStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/staff', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStaffList(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch staff data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleEdit = (id) => {
    navigate(`/dashboard/edit-staff/${id}`);
  };

  const handleAddNew = () => {
    navigate('/dashboard/add-staff');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaffList(staffList.filter(staff => staff.id !== id));
      alert('Staff deleted successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to delete staff');
    }
  };

  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.id.toString().includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || staff.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'on leave': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
            <h3 className="mt-6 text-xl font-semibold text-gray-700">Loading Staff Members</h3>
            <p className="mt-2 text-gray-500">Please wait while we fetch the latest data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-green-700 rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
                  <FontAwesomeIcon icon={faUser} className="mr-3" />
                  Staff Management
                </h1>
                <p className="text-indigo-100 text-lg">
                  View, manage, and organize all staff members in your organization
                </p>
              </div>
              <button
                onClick={handleAddNew}
                className="mt-4 md:mt-0 bg-white text-indigo-600 hover:bg-indigo-50 
                         px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-300 
                         transform hover:-translate-y-0.5 hover:shadow-lg flex items-center shadow-md"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add New Staff
              </button>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="pl-10 pr-10 py-3 w-full border border-gray-300 rounded-xl 
                           focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
                           transition-all duration-300 text-lg"
                  placeholder="Search by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Filter Dropdown */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
                </div>
                <select
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl 
                           focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
                           appearance-none bg-white cursor-pointer text-lg"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on leave">On Leave</option>
                </select>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchStaff}
                className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 
                         hover:text-white px-6 py-3 rounded-xl font-semibold text-lg 
                         transition-all duration-300 flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faSync} className="mr-2" />
                Refresh
              </button>
            </div>

            {/* Results Count */}
            <div className="mt-4 flex justify-between items-center">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{filteredStaff.length}</span> of{' '}
                <span className="font-semibold">{staffList.length}</span> staff members
              </p>
              <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                {filteredStaff.length} Records
              </span>
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {filteredStaff.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        <FontAwesomeIcon icon={faIdCard} className="mr-2" />
                        ID
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        <FontAwesomeIcon icon={faUser} className="mr-2" />
                        Name
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                        Email
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        <FontAwesomeIcon icon={faCircle} className="mr-2" />
                        Status
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStaff.map((staff) => (
                      <tr 
                        key={staff.id}
                        className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                      >
                        <td className="py-4 px-6">
                          <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                            #{staff.id}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">{staff.name}</div>
                        </td>
                        <td className="py-4 px-6">
                          <a 
                            href={`mailto:${staff.email}`}
                            className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                          >
                            {staff.email}
                          </a>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(staff.status)}`}>
                            <span className="w-2 h-2 rounded-full mr-2 bg-current opacity-70"></span>
                            {staff.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(staff.id)}
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 
                                       px-4 py-2 rounded-lg font-medium transition-colors duration-200 
                                       flex items-center"
                            >
                              <FontAwesomeIcon icon={faEdit} className="mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(staff.id)}
                              className="bg-red-50 text-red-600 hover:bg-red-100 
                                       px-4 py-2 rounded-lg font-medium transition-colors duration-200 
                                       flex items-center"
                            >
                              <FontAwesomeIcon icon={faTrash} className="mr-2" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                  No Staff Members Found
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'No staff members have been added yet'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                    }}
                    className="bg-indigo-600 text-white hover:bg-indigo-700 
                             px-6 py-3 rounded-xl font-medium transition-colors duration-300"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center">
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">
                  Total Staff
                </p>
                <p className="text-3xl font-bold text-gray-800">{staffList.length}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center">
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">
                  Active
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {staffList.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center">
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">
                  Inactive
                </p>
                <p className="text-3xl font-bold text-gray-600">
                  {staffList.filter(s => s.status === 'inactive').length}
                </p>
              </div>
            </div>
            
          </div>
        </div>

        {/* Help Button */}
        <button
          onClick={() => alert('Need help? Contact your system administrator.')}
          className="fixed bottom-8 right-8 bg-indigo-600 text-white hover:bg-indigo-700 
                   w-14 h-14 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 
                   flex items-center justify-center text-xl z-50"
          aria-label="Help"
        >
          <FontAwesomeIcon icon={faQuestionCircle} />
        </button>
      </div>
    </div>
  );
};

export default ViewStaff;