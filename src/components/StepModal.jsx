import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { stepService } from '../services/api';
import toast from 'react-hot-toast';

const StepModal = ({ workflowId, step, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    name: '',
    stepType: 'TASK',
    order: 0,
    metadata: '{}',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (step) {
      setFormData({
        name: step.name,
        stepType: step.stepType,
        order: step.order,
        metadata: step.metadata || '{}',
      });
    }
  }, [step]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter a step name');
      return;
    }

    try {
      setSaving(true);
      if (step) {
        await stepService.update(step.id, formData);
        toast.success('Step updated successfully');
      } else {
        await stepService.create(workflowId, formData);
        toast.success('Step created successfully');
      }
      onSaved();
    } catch (error) {
      console.error('Error saving step:', error);
      toast.error('Failed to save step');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{step ? 'Edit Step' : 'Add Step'}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Step Name *</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter step name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Step Type *</label>
            <select
              className="form-control"
              value={formData.stepType}
              onChange={(e) => setFormData({ ...formData, stepType: e.target.value })}
            >
              <option value="TASK">Task</option>
              <option value="APPROVAL">Approval</option>
              <option value="NOTIFICATION">Notification</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Order</label>
            <input
              type="number"
              className="form-control"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              min="0"
            />
            <small className="form-help">
              The sequence order of this step in the workflow
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Metadata (JSON)</label>
            <textarea
              className="form-control"
              value={formData.metadata}
              onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
              placeholder='{"assignee_email": "user@example.com"}'
              rows="4"
            />
            <small className="form-help">
              Additional configuration for this step
            </small>
          </div>

          <div className="flex gap-2 justify-between mt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : step ? 'Update Step' : 'Create Step'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StepModal;
