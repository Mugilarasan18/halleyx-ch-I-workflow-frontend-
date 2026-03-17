import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, RefreshCw, X, Clock } from 'lucide-react';
import { executionService } from '../services/api';
import toast from 'react-hot-toast';
import './ExecutionList.css';

const ExecutionList = () => {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchExecutions();
  }, [page]);

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const response = await executionService.getAll(page, 10);
      setExecutions(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error('Error fetching executions:', error);
      toast.error('Failed to load executions');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (id) => {
    try {
      await executionService.retry(id);
      toast.success('Execution retried successfully');
      fetchExecutions();
    } catch (error) {
      console.error('Error retrying execution:', error);
      toast.error(error.response?.data?.message || 'Failed to retry execution');
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this execution?')) {
      try {
        await executionService.cancel(id);
        toast.success('Execution canceled successfully');
        fetchExecutions();
      } catch (error) {
        console.error('Error canceling execution:', error);
        toast.error(error.response?.data?.message || 'Failed to cancel execution');
      }
    }
  };

  const formatDuration = (ms) => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading && executions.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="execution-list-page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="page-header">
          <div>
            <h1>Workflow Executions</h1>
            <p className="page-subtitle">Track and monitor workflow execution history</p>
          </div>
          <button onClick={fetchExecutions} className="btn btn-secondary">
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        <div className="card">
          {executions.length === 0 ? (
            <div className="empty-state">
              <p>No executions found</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Workflow</th>
                      <th>Version</th>
                      <th>Status</th>
                      <th>Started At</th>
                      <th>Duration</th>
                      <th>Triggered By</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {executions.map((execution, index) => (
                      <motion.tr
                        key={execution.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <td>
                          <div className="execution-name">
                            <strong>{execution.workflowName}</strong>
                          </div>
                        </td>
                        <td>
                          <span className="version-badge">v{execution.workflowVersion}</span>
                        </td>
                        <td>
                          <span className={`badge badge-${getStatusColor(execution.status)}`}>
                            {execution.status}
                          </span>
                        </td>
                        <td>
                          <div className="time-info">
                            <Clock size={14} />
                            {new Date(execution.startedAt).toLocaleString()}
                          </div>
                        </td>
                        <td>
                          <span className="duration">
                            {formatDuration(execution.durationMs)}
                          </span>
                        </td>
                        <td>
                          <span className="triggered-by">{execution.triggeredBy}</span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Link
                              to={`/executions/${execution.id}`}
                              className="btn-icon"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </Link>
                            {execution.status === 'FAILED' && (
                              <button
                                onClick={() => handleRetry(execution.id)}
                                className="btn-icon"
                                title="Retry"
                              >
                                <RefreshCw size={16} />
                              </button>
                            )}
                            {(execution.status === 'IN_PROGRESS' || execution.status === 'PENDING') && (
                              <button
                                onClick={() => handleCancel(execution.id)}
                                className="btn-icon btn-icon-danger"
                                title="Cancel"
                              >
                                <X size={16} />
                              </button>
                            )}
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

const getStatusColor = (status) => {
  const colors = {
    COMPLETED: 'success',
    FAILED: 'error',
    IN_PROGRESS: 'info',
    PENDING: 'warning',
    CANCELED: 'error',
  };
  return colors[status] || 'primary';
};

export default ExecutionList;
