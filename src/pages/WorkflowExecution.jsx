import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Loader } from 'lucide-react';
import { workflowService, executionService } from '../services/api';
import toast from 'react-hot-toast';
import './WorkflowExecution.css';

const WorkflowExecution = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [inputData, setInputData] = useState({});
  const [inputSchema, setInputSchema] = useState({});
  const [executing, setExecuting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkflow();
  }, [id]);

  const fetchWorkflow = async () => {
    try {
      setLoading(true);
      const response = await workflowService.getById(id);
      setWorkflow(response.data);
      
      // Parse input schema
      try {
        const schema = JSON.parse(response.data.inputSchema || '{}');
        setInputSchema(schema);
        
        // Initialize input data with default values
        const initialData = {};
        Object.keys(schema).forEach(key => {
          initialData[key] = schema[key].type === 'number' ? 0 : '';
        });
        setInputData(initialData);
      } catch (error) {
        console.error('Error parsing input schema:', error);
        setInputSchema({});
      }
    } catch (error) {
      console.error('Error fetching workflow:', error);
      toast.error('Failed to load workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async (e) => {
    e.preventDefault();

    // Validate required fields
    const missingFields = Object.entries(inputSchema)
      .filter(([key, config]) => config.required && !inputData[key])
      .map(([key]) => key);

    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      setExecuting(true);
      const response = await executionService.execute(id, {
        data: inputData,
        triggeredBy: 'admin',
      });

      toast.success('Workflow execution started');
      navigate(`/executions/${response.data.id}`);
    } catch (error) {
      console.error('Error executing workflow:', error);
      toast.error('Failed to execute workflow');
    } finally {
      setExecuting(false);
    }
  };

  const handleInputChange = (field, value, type) => {
    let processedValue = value;
    
    if (type === 'number') {
      processedValue = value === '' ? '' : parseFloat(value) || 0;
    }
    
    setInputData({
      ...inputData,
      [field]: processedValue,
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="empty-state">
        <p>Workflow not found</p>
      </div>
    );
  }

  return (
    <div className="workflow-execution">
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
              <h1>Execute Workflow</h1>
              <p className="page-subtitle">{workflow.name}</p>
            </div>
          </div>
        </div>

        <div className="execution-container">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Workflow Information</h3>
            </div>
            <div className="card-body">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{workflow.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Description:</span>
                  <span className="info-value">{workflow.description || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Version:</span>
                  <span className="info-value">v{workflow.version}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Steps:</span>
                  <span className="info-value">{workflow.stepCount || 0}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className={`badge ${workflow.isActive ? 'badge-success' : 'badge-error'}`}>
                    {workflow.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Input Parameters</h3>
            </div>
            <div className="card-body">
              {Object.keys(inputSchema).length === 0 ? (
                <p className="empty-state">No input parameters defined</p>
              ) : (
                <form onSubmit={handleExecute}>
                  <div className="input-grid">
                    {Object.entries(inputSchema).map(([field, config]) => (
                      <div key={field} className="form-group">
                        <label className="form-label">
                          {field}
                          {config.required && <span className="required">*</span>}
                        </label>
                        
                        {config.allowed_values ? (
                          <select
                            className="form-control"
                            value={inputData[field] || ''}
                            onChange={(e) => handleInputChange(field, e.target.value, config.type)}
                            required={config.required}
                          >
                            <option value="">Select {field}</option>
                            {config.allowed_values.map(val => (
                              <option key={val} value={val}>{val}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={config.type === 'number' ? 'number' : 'text'}
                            className="form-control"
                            value={inputData[field] || ''}
                            onChange={(e) => handleInputChange(field, e.target.value, config.type)}
                            placeholder={`Enter ${field}`}
                            required={config.required}
                            step={config.type === 'number' ? 'any' : undefined}
                          />
                        )}
                        
                        <small className="form-help">
                          Type: {config.type} {config.required ? '(Required)' : '(Optional)'}
                        </small>
                      </div>
                    ))}
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={executing || !workflow.isActive}
                    >
                      {executing ? (
                        <>
                          <Loader size={20} className="spinner-icon" />
                          Executing...
                        </>
                      ) : (
                        <>
                          <Play size={20} />
                          Start Execution
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WorkflowExecution;
