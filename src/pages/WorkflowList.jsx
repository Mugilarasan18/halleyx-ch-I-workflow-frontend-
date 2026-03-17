import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Play, Eye } from 'lucide-react';
import { workflowService } from '../services/api';
import toast from 'react-hot-toast';
import './WorkflowList.css';

const WorkflowList = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchWorkflows();
  }, [page, searchTerm]);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await workflowService.getAll(page, 10, searchTerm);
      setWorkflows(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await workflowService.delete(id);
        toast.success('Workflow deleted successfully');
        fetchWorkflows();
      } catch (error) {
        console.error('Error deleting workflow:', error);
        toast.error('Failed to delete workflow');
      }
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  if (loading && workflows.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="workflow-list-page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="page-header">
          <div>
            <h1>Workflows</h1>
            <p className="page-subtitle">Manage and organize your workflow definitions</p>
          </div>
          <Link to="/workflows/create" className="btn btn-primary">
            <Plus size={20} />
            Create Workflow
          </Link>
        </div>

        <div className="card">
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>

          {workflows.length === 0 ? (
            <div className="empty-state">
              <p>No workflows found</p>
              <Link to="/workflows/create" className="btn btn-primary mt-2">
                <Plus size={20} />
                Create Your First Workflow
              </Link>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Steps</th>
                      <th>Version</th>
                      <th>Status</th>
                      <th>Executions</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workflows.map((workflow, index) => (
                      <motion.tr
                        key={workflow.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <td>
                          <div className="workflow-name">
                            <strong>{workflow.name}</strong>
                          </div>
                        </td>
                        <td>
                          <div className="workflow-description">
                            {workflow.description || 'No description'}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-primary">
                            {workflow.stepCount || 0}
                          </span>
                        </td>
                        <td>
                          <span className="version-badge">v{workflow.version}</span>
                        </td>
                        <td>
                          <span className={`badge ${workflow.isActive ? 'badge-success' : 'badge-error'}`}>
                            {workflow.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-info">
                            {workflow.executionCount || 0}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Link
                              to={`/workflows/${workflow.id}/execute`}
                              className="btn-icon"
                              title="Execute"
                            >
                              <Play size={16} />
                            </Link>
                            <Link
                              to={`/workflows/${workflow.id}/edit`}
                              className="btn-icon"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </Link>
                            <button
                              onClick={() => handleDelete(workflow.id, workflow.name)}
                              className="btn-icon btn-icon-danger"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 0}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages - 1}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default WorkflowList;
