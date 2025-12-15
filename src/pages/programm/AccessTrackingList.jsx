import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import {
  getAllAccessTracking,
  deleteAccessTracking,
  searchAccessTracking,
  getUniqueDonors,
  getUniqueProjects,
  getUniqueLineMinistries,
} from '../../services/db/accessTrackingService';

const AccessTrackingList = () => {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDonor, setFilterDonor] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterMinistry, setFilterMinistry] = useState('');
  const [donors, setDonors] = useState([]);
  const [projects, setProjects] = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadEntries();
    loadFilterOptions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterDonor, filterProject, filterMinistry, entries]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const data = await getAllAccessTracking();
      setEntries(data);
      setFilteredEntries(data);
    } catch (error) {
      console.error('Error loading access tracking entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const [donorList, projectList, ministryList] = await Promise.all([
        getUniqueDonors(),
        getUniqueProjects(),
        getUniqueLineMinistries(),
      ]);
      setDonors(donorList);
      setProjects(projectList);
      setMinistries(ministryList);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const applyFilters = async () => {
    let filtered = [...entries];

    if (searchTerm) {
      filtered = await searchAccessTracking(searchTerm);
    }

    if (filterDonor) {
      filtered = filtered.filter((entry) => entry.donor === filterDonor);
    }

    if (filterProject) {
      filtered = filtered.filter((entry) => entry.projectName === filterProject);
    }

    if (filterMinistry) {
      filtered = filtered.filter((entry) => entry.lineMinistry === filterMinistry);
    }

    setFilteredEntries(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this access tracking entry?')) {
      try {
        await deleteAccessTracking(id);
        loadEntries();
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Failed to delete entry');
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDonor('');
    setFilterProject('');
    setFilterMinistry('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Access Tracking
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Track project access requirements and government coordination
            </p>
          </div>
          <Link
            to="/programm/access-tracking/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Entry
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by donor, project, location, ministry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Donor
                  </label>
                  <select
                    value={filterDonor}
                    onChange={(e) => setFilterDonor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Donors</option>
                    {donors.map((donor) => (
                      <option key={donor} value={donor}>{donor}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project
                  </label>
                  <select
                    value={filterProject}
                    onChange={(e) => setFilterProject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Projects</option>
                    {projects.map((project) => (
                      <option key={project} value={project}>{project}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Line Ministry
                  </label>
                  <select
                    value={filterMinistry}
                    onChange={(e) => setFilterMinistry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Ministries</option>
                    {ministries.map((ministry) => (
                      <option key={ministry} value={ministry}>{ministry}</option>
                    ))}
                  </select>
                </div>
              </div>

              {(filterDonor || filterProject || filterMinistry) && (
                <div className="mt-4">
                  <button onClick={clearFilters} className="text-sm text-primary-500 hover:text-primary-600">
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  S/N
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Donor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Project Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Line Ministry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No access tracking entries found. Click "Add Entry" to create one.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {entry.serialNumber || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {entry.donor}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <div className="max-w-xs truncate" title={entry.projectName}>
                        {entry.projectName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {entry.location || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {entry.lineMinistry || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {entry.startDate && entry.endDate && (
                        <span className="text-xs">
                          {new Date(entry.startDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                          {' - '}
                          {new Date(entry.endDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/programm/access-tracking/${entry.id}`} className="text-primary-500 hover:text-primary-600" title="View">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link to={`/programm/access-tracking/${entry.id}/edit`} className="text-blue-500 hover:text-blue-600" title="Edit">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button onClick={() => handleDelete(entry.id)} className="text-red-500 hover:text-red-600" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredEntries.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredEntries.length} of {entries.length} entry(ies)
        </div>
      )}
    </div>
  );
};

export default AccessTrackingList;
