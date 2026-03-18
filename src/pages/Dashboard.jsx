import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Workflow, PlayCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { workflowService, executionService } from '../services/api';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    pendingExecutions: 0,
  });
  const [recentWorkflows, setRecentWorkflows] = useState([]);
  const [recentExecutions, setRecentExecutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [workflowsRes, executionsRes] = await Promise.all([
        workflowService.getAll(0, 5),
        executionService.getAll(0, 5),
      ]);

      setRecentWorkflows(workflowsRes.data.content || []);
      setRecentExecutions(executionsRes.data.content || []);

      const workflows = workflowsRes.data.content || [];
      const executions = executionsRes.data.content || [];

      setStats({
        totalWorkflows: workflowsRes.data.totalElements || 0,
        activeWorkflows: workflows.filter(w => w.isActive).length,
        totalExecutions: executionsRes.data.totalElements || 0,
        successfulExecutions: executions.filter(e => e.status === 'COMPLETED').length,
        failedExecutions: executions.filter(e => e.status === 'FAILED').length,
        pendingExecutions: executions.filter(e => e.status === 'IN_PROGRESS' || e.status === 'PENDING').length,
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Workflows',
      value: stats.totalWorkflows,
      icon: Workflow,
      color: 'primary',
      link: '/workflows',
    },
    {
      title: 'Active Workflows',
      value: stats.activeWorkflows,
      icon: CheckCircle,
      color: 'success',
      link: '/workflows',
    },
    {
      title: 'Total Executions',
      value: stats.totalExecutions,
      icon: PlayCircle,
      color: 'info',
      link: '/executions',
    },
    {
      title: 'Failed Executions',
      value: stats.failedExecutions,
      icon: XCircle,
      color: 'error',
      link: '/executions',
    },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p className="dashboard-subtitle">Welcome to Halleyx Workflow Engine</p>
          </div>
          <Link to="/workflows/create" className="btn btn-primary btn-lg">
            <Workflow size={20} />
            Create Workflow
          </Link>
        </div>

        <div className="stats-grid">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={stat.link} className="stat-card" data-color={stat.color}>
                  <div className="stat-icon">
                    <Icon size={28} />
                  </div>
                  <div className="stat-content">
                    <p className="stat-title">{stat.title}</p>
                    <p className="stat-value">{stat.value}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="dashboard-grid">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="dashboard-section"
          >
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Recent Workflows</h3>
                <Link to="/workflows" className="btn btn-sm btn-secondary">
                  View All
                </Link>
              </div>
              <div className="workflow-list">
                {recentWorkflows.length === 0 ? (
                  <p className="empty-state">No workflows created yet</p>
                ) : (
                  recentWorkflows.map((workflow) => (
                    <Link
                      key={workflow.id}
                      to={`/workflows/${workflow.id}/edit`}
                      className="workflow-item"
                    >
                      <div className="workflow-info">
                        <h4>{workflow.name}</h4>
                        <p>{workflow.description || 'No description'}</p>
                      </div>
                      <div className="workflow-meta">
                        <span className="badge badge-primary">
                          {workflow.stepCount || 0} Steps
                        </span>
                        <span className={`badge ${workflow.isActive ? 'badge-success' : 'badge-error'}`}>
                          {workflow.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="dashboard-section"
          >
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Recent Executions</h3>
                <Link to="/executions" className="btn btn-sm btn-secondary">
                  View All
                </Link>
              </div>
              <div className="execution-list">
                {recentExecutions.length === 0 ? (
                  <p className="empty-state">No executions yet</p>
                ) : (
                  recentExecutions.map((execution) => (
                    <Link
                      key={execution.id}
                      to={`/executions/${execution.id}`}
                      className="execution-item"
                    >
                      <div className="execution-info">
                        <h4>{execution.workflowName}</h4>
                        <p className="execution-time">
                          <Clock size={14} />
                          {new Date(execution.startedAt).toLocaleString()}
                        </p>
                      </div>
                      <span className={`badge badge-${getStatusColor(execution.status)}`}>
                        {execution.status}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </motion.div>
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

export default Dashboard;
