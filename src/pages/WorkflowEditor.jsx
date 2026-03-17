import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Plus, Edit, Trash2, ArrowLeft, GitBranch } from 'lucide-react';
import { workflowService, stepService, ruleService } from '../services/api';
import toast from 'react-hot-toast';
import StepModal from '../components/StepModal';
import RuleModal from '../components/RuleModal';
import './WorkflowEditor.css';

const WorkflowEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [workflow, setWorkflow] = useState({
    name: '',
    description: '',
    inputSchema: '{}',
    startStepId: '',
    isActive: true,
  });

  const [steps, setSteps] = useState([]);
  const [selectedStep, setSelectedStep] = useState(null);
  const [showStepModal, setShowStepModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchWorkflow();
    }
  }, [id]);

  const fetchWorkflow = async () => {
    try {
      setLoading(true);
      const response = await workflowService.getById(id);
      setWorkflow(response.data);
      setSteps(response.data.steps || []);
    } catch (error) {
      console.error('Error fetching workflow:', error);
      toast.error('Failed to load workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkflow = async () => {
    if (!workflow.name.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }

    try {
      setSaving(true);
      const data = {
        ...workflow,
        createdBy: 'admin',
        updatedBy: 'admin',
      };

      if (isEditMode) {
        await workflowService.update(id, data);
        toast.success('Workflow updated successfully');
      } else {
        const response = await workflowService.create(data);
        toast.success('Workflow created successfully');
        navigate(`/workflows/${response.data.id}/edit`);
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  const handleAddStep = () => {
    setSelectedStep(null);
    setShowStepModal(true);
  };

  const handleEditStep = (step) => {
    setSelectedStep(step);
    setShowStepModal(true);
  };

  const handleDeleteStep = async (stepId, stepName) => {
    if (window.confirm(`Are you sure you want to delete "${stepName}"?`)) {
      try {
        await stepService.delete(stepId);
        toast.success('Step deleted successfully');
        fetchWorkflow();
      } catch (error) {
        console.error('Error deleting step:', error);
        toast.error('Failed to delete step');
      }
    }
  };

  const handleManageRules = (step) => {
    setSelectedStep(step);
    setShowRuleModal(true);
  };

  const handleStepSaved = () => {
    setShowStepModal(false);
    fetchWorkflow();
  };

  const handleRulesSaved = () => {
    setShowRuleModal(false);
    fetchWorkflow();
  };

  const handleSetStartStep = async (stepId) => {
    try {
      await workflowService.update(id, { ...workflow, startStepId: stepId });
      setWorkflow({ ...workflow, startStepId: stepId });
      toast.success('Start step updated');
    } catch (error) {
      console.error('Error updating start step:', error);
      toast.error('Failed to update start step');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="workflow-editor">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="page-header">
          <div className="header-left">
            <button onClick={() => navigate('/workflows')} className="btn btn-secondary">
              <ArrowLeft size={20} />
              Back
            </button>
            <div>
              <h1>{isEditMode ? 'Edit Workflow' : 'Create Workflow'}</h1>
              <p className="page-subtitle">
                {isEditMode ? 'Modify your workflow configuration' : 'Define a new workflow'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSaveWorkflow}
            className="btn btn-primary"
            disabled={saving}
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Workflow'}
          </button>
        </div>

        <div className="editor-grid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Workflow Information</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Workflow Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={workflow.name}
                  onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
                  placeholder="Enter workflow name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  value={workflow.description || ''}
                  onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
                  placeholder="Describe your workflow"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Input Schema (JSON)</label>
                <textarea
                  className="form-control"
                  value={workflow.inputSchema || '{}'}
                  onChange={(e) => setWorkflow({ ...workflow, inputSchema: e.target.value })}
                  placeholder='{"amount": {"type": "number", "required": true}}'
                  rows="6"
                />
                <small className="form-help">
                  Define the expected input fields and their types
                </small>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={workflow.isActive}
                    onChange={(e) => setWorkflow({ ...workflow, isActive: e.target.checked })}
                  />
                  <span>Active Workflow</span>
                </label>
              </div>
            </div>
          </div>

          {isEditMode && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Workflow Steps</h3>
                <button onClick={handleAddStep} className="btn btn-primary btn-sm">
                  <Plus size={18} />
                  Add Step
                </button>
              </div>
              <div className="card-body">
                {steps.length === 0 ? (
                  <div className="empty-state">
                    <p>No steps defined yet</p>
                    <button onClick={handleAddStep} className="btn btn-primary mt-2">
                      <Plus size={20} />
                      Add First Step
                    </button>
                  </div>
                ) : (
                  <div className="steps-list">
                    {steps
                      .sort((a, b) => a.order - b.order)
                      .map((step, index) => (
                        <motion.div
                          key={step.id}
                          className="step-card"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <div className="step-header">
                            <div className="step-info">
                              <div className="step-number">{step.order + 1}</div>
                              <div>
                                <h4>{step.name}</h4>
                                <span className={`badge badge-${getStepTypeColor(step.stepType)}`}>
                                  {step.stepType}
                                </span>
                              </div>
                            </div>
                            {workflow.startStepId === step.id && (
                              <span className="badge badge-success">START</span>
                            )}
                          </div>
                          <div className="step-actions">
                            <button
                              onClick={() => handleSetStartStep(step.id)}
                              className="btn btn-sm btn-secondary"
                              disabled={workflow.startStepId === step.id}
                            >
                              Set as Start
                            </button>
                            <button
                              onClick={() => handleManageRules(step)}
                              className="btn btn-sm btn-secondary"
                            >
                              <GitBranch size={16} />
                              Rules ({step.rules?.length || 0})
                            </button>
                            <button
                              onClick={() => handleEditStep(step)}
                              className="btn-icon"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteStep(step.id, step.name)}
                              className="btn-icon btn-icon-danger"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {showStepModal && (
        <StepModal
          workflowId={id}
          step={selectedStep}
          onClose={() => setShowStepModal(false)}
          onSaved={handleStepSaved}
        />
      )}

      {showRuleModal && selectedStep && (
        <RuleModal
          step={selectedStep}
          steps={steps}
          onClose={() => setShowRuleModal(false)}
          onSaved={handleRulesSaved}
        />
      )}
    </div>
  );
};

const getStepTypeColor = (type) => {
  const colors = {
    TASK: 'primary',
    APPROVAL: 'warning',
    NOTIFICATION: 'info',
  };
  return colors[type] || 'primary';
};

export default WorkflowEditor;
