import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Save } from 'lucide-react';
import { ruleService } from '../services/api';
import toast from 'react-hot-toast';

const RuleModal = ({ step, steps, onClose, onSaved }) => {
  const [rules, setRules] = useState([]);
  const [editingRule, setEditingRule] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    condition: '',
    nextStepId: '',
    priority: 0,
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRules();
  }, [step.id]);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await ruleService.getByStepId(step.id);
      setRules(response.data || []);
    } catch (error) {
      console.error('Error fetching rules:', error);
      toast.error('Failed to load rules');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = () => {
    setEditingRule(null);
    setFormData({
      condition: '',
      nextStepId: '',
      priority: rules.length,
      description: '',
    });
    setShowForm(true);
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setFormData({
      condition: rule.condition,
      nextStepId: rule.nextStepId || '',
      priority: rule.priority,
      description: rule.description || '',
    });
    setShowForm(true);
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();

    if (!formData.condition.trim()) {
      toast.error('Please enter a condition');
      return;
    }

    try {
      setSaving(true);
      if (editingRule) {
        await ruleService.update(editingRule.id, formData);
        toast.success('Rule updated successfully');
      } else {
        await ruleService.create(step.id, formData);
        toast.success('Rule created successfully');
      }
      fetchRules();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving rule:', error);
      toast.error('Failed to save rule');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      try {
        await ruleService.delete(ruleId);
        toast.success('Rule deleted successfully');
        fetchRules();
      } catch (error) {
        console.error('Error deleting rule:', error);
        toast.error('Failed to delete rule');
      }
    }
  };

  const handleDone = () => {
    onSaved();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Manage Rules: {step.name}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {!showForm ? (
          <>
            <div className="rules-container">
              {loading ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                </div>
              ) : rules.length === 0 ? (
                <div className="empty-state">
                  <p>No rules defined for this step</p>
                  <button onClick={handleAddRule} className="btn btn-primary mt-2">
                    <Plus size={20} />
                    Add First Rule
                  </button>
                </div>
              ) : (
                <div className="rules-list">
                  <div className="rules-header">
                    <span className="rule-col">Priority</span>
                    <span className="rule-col rule-col-wide">Condition</span>
                    <span className="rule-col">Next Step</span>
                    <span className="rule-col">Actions</span>
                  </div>
                  {rules
                    .sort((a, b) => a.priority - b.priority)
                    .map((rule) => (
                      <div key={rule.id} className="rule-row">
                        <span className="rule-col">
                          <span className="priority-badge">{rule.priority}</span>
                        </span>
                        <span className="rule-col rule-col-wide">
                          <code className="condition-code">{rule.condition}</code>
                          {rule.description && (
                            <small className="rule-description">{rule.description}</small>
                          )}
                        </span>
                        <span className="rule-col">
                          {rule.nextStepId ? (
                            <span className="badge badge-primary">
                              {steps.find(s => s.id === rule.nextStepId)?.name || 'Unknown'}
                            </span>
                          ) : (
                            <span className="badge badge-error">END</span>
                          )}
                        </span>
                        <span className="rule-col">
                          <div className="action-buttons">
                            <button
                              onClick={() => handleEditRule(rule)}
                              className="btn-icon"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteRule(rule.id)}
                              className="btn-icon btn-icon-danger"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={handleAddRule} className="btn btn-secondary">
                <Plus size={18} />
                Add Rule
              </button>
              <button onClick={handleDone} className="btn btn-primary">
                Done
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSaveRule}>
            <div className="form-group">
              <label className="form-label">Condition *</label>
              <input
                type="text"
                className="form-control"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                placeholder='amount > 100 && country == "US"'
                required
              />
              <small className="form-help">
                Use operators: ==, !=, {'<'}, {'>'}, {'<='}, {'>='}, &&, ||, contains(), startsWith(), endsWith()
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Next Step</label>
              <select
                className="form-control"
                value={formData.nextStepId}
                onChange={(e) => setFormData({ ...formData, nextStepId: e.target.value })}
              >
                <option value="">-- End Workflow --</option>
                {steps
                  .filter(s => s.id !== step.id)
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.stepType})
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <input
                type="number"
                className="form-control"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                min="0"
              />
              <small className="form-help">
                Lower priority numbers are evaluated first
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                type="text"
                className="form-control"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>

            <div className="flex gap-2 justify-between mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={18} />
                {saving ? 'Saving...' : editingRule ? 'Update Rule' : 'Create Rule'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RuleModal;
