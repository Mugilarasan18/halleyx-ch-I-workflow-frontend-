import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { executionService } from '../services/api';
import toast from 'react-hot-toast';
import './ExecutionDetails.css';

const ExecutionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [execution, setExecution] = useState(null);
  const [logs, setLogs] = useState([]);
  const [inputData, setInputData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExecutionDetails();
    const interval = setInterval(fetchExecutionDetails, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchExecutionDetails = async () => {
    try {
      const response = await executionService.getById(id);
      setExecution(response.data);

      // Parse logs
      try {
        const parsedLogs = JSON.parse(response.data.logs || '[]');
        setLogs(parsedLogs);
      } catch (error) {
        setLogs([]);
      }

      // Parse input data
      try {
        const parsedData = JSON.parse(response.data.data || '{}');
        setInputData(parsedData);
      } catch (error) {
        setInputData({});
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching execution details:', error);
      toast.error('Failed to load execution details');
      setLoading(false);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle size={20} className="status-icon success" />;
      case 'FAILED':
        return <XCircle size={20} className="status-icon error" />;
      case 'IN_PROGRESS':
      case 'PENDING':
        return <Clock size={20} className="status-icon info" />;
      default:
        return <AlertCircle size={20} className="status-icon" />;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="empty-state">
        <p>Execution not found</p>
      </div>
    );
  }

  return (
    <div className="execution-details">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="page-header">
          <div className="header-left">
            <button onClick={() => navigate('/executions')} className="btn btn-secondary">
              <ArrowLeft size={20} />
              Back
            </button>
            <div>
              <h1>Execution Details</h1>
              <p className="page-subtitle">{execution.workflowName}</p>
            </div>
          </div>
          <div className="status-badge-large">
            {getStatusIcon(execution.status)}
            <span className={`badge badge-${getStatusColor(execution.status)} badge-lg`}>
              {execution.status}
            </span>
          </div>
        </div>

        <div className="details-grid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Execution Information</h3>
            </div>
            <div className="card-body">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Execution ID:</span>
                  <span className="info-value code">{execution.id}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Workflow:</span>
                  <span className="info-value">{execution.workflowName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Version:</span>
                  <span className="info-value">v{execution.workflowVersion}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Started At:</span>
                  <span className="info-value">
                    {new Date(execution.startedAt).toLocaleString()}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Ended At:</span>
                  <span className="info-value">
                    {execution.endedAt ? new Date(execution.endedAt).toLocaleString() : 'Running...'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Duration:</span>
                  <span className="info-value">{formatDuration(execution.durationMs)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Triggered By:</span>
                  <span className="info-value">{execution.triggeredBy}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Retries:</span>
                  <span className="info-value">{execution.retries}</span>
                </div>
              </div>

              {execution.errorMessage && (
                <div className="error-message">
                  <XCircle size={18} />
                  <span>{execution.errorMessage}</span>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Input Data</h3>
            </div>
            <div className="card-body">
              <pre className="json-display">{JSON.stringify(inputData, null, 2)}</pre>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Execution Logs</h3>
          </div>
          <div className="card-body">
            {logs.length === 0 ? (
              <p className="empty-state">No execution logs available</p>
            ) : (
              <div className="logs-container">
                {logs.map((log, index) => (
                  <motion.div
                    key={index}
                    className="log-entry"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="log-header">
                      <div className="log-step">
                        <div className="step-number">{index + 1}</div>
                        <div>
                          <h4>{log.step_name}</h4>
                          <span className={`badge badge-${getStepTypeColor(log.step_type)}`}>
                            {log.step_type}
                          </span>
                        </div>
                      </div>
                      <span className={`badge badge-${log.status === 'COMPLETED' ? 'success' : 'error'}`}>
                        {log.status}
                      </span>
                    </div>

                    {log.evaluated_rules && log.evaluated_rules.length > 0 && (
                      <div className="log-rules">
                        <h5>Evaluated Rules:</h5>
                        {log.evaluated_rules.map((rule, ruleIndex) => (
                          <div key={ruleIndex} className="rule-eval">
                            <span className={`rule-result ${rule.result ? 'success' : 'failed'}`}>
                              {rule.result ? '✓' : '✗'}
                            </span>
                            <code>{rule.condition}</code>
                            {rule.error && (
                              <span className="rule-error">Error: {rule.error}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="log-meta">
                      <span>
                        <Clock size={14} />
                        {new Date(log.started_at).toLocaleTimeString()}
                      </span>
                      {log.selected_next_step && (
                        <span className="next-step">
                          Next: <strong>{log.selected_next_step}</strong>
                        </span>
                      )}
                    </div>

                    {log.error_message && (
                      <div className="log-error">
                        <XCircle size={16} />
                        <span>{log.error_message}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
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

const getStepTypeColor = (type) => {
  const colors = {
    TASK: 'primary',
    APPROVAL: 'warning',
    NOTIFICATION: 'info',
  };
  return colors[type] || 'primary';
};

export default ExecutionDetails;
