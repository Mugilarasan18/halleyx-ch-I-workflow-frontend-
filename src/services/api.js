import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const workflowService = {
  getAll: (page = 0, size = 10, search = '') => {
    const params = { page, size };
    if (search) params.search = search;
    return api.get('/workflows', { params });
  },
  getById: (id) => api.get(`/workflows/${id}`),
  create: (data) => api.post('/workflows', data),
  update: (id, data) => api.put(`/workflows/${id}`, data),
  delete: (id) => api.delete(`/workflows/${id}`),
};

export const stepService = {
  getByWorkflowId: (workflowId) => api.get(`/workflows/${workflowId}/steps`),
  getById: (stepId) => api.get(`/workflows/_/steps/${stepId}`),
  create: (workflowId, data) => api.post(`/workflows/${workflowId}/steps`, data),
  update: (stepId, data) => api.put(`/workflows/_/steps/${stepId}`, data),
  delete: (stepId) => api.delete(`/workflows/_/steps/${stepId}`),
};

export const ruleService = {
  getByStepId: (stepId) => api.get(`/steps/${stepId}/rules`),
  create: (stepId, data) => api.post(`/steps/${stepId}/rules`, data),
  update: (ruleId, data) => api.put(`/steps/_/rules/${ruleId}`, data),
  delete: (ruleId) => api.delete(`/steps/_/rules/${ruleId}`),
};

export const executionService = {
  getAll: (page = 0, size = 10) => api.get('/workflows/executions', { params: { page, size } }),
  getById: (id) => api.get(`/workflows/executions/${id}`),
  getByWorkflowId: (workflowId, page = 0, size = 10) => 
    api.get(`/workflows/${workflowId}/executions`, { params: { page, size } }),
  execute: (workflowId, data) => api.post(`/workflows/${workflowId}/execute`, data),
  cancel: (id) => api.post(`/workflows/executions/${id}/cancel`),
  retry: (id) => api.post(`/workflows/executions/${id}/retry`),
};

export default api;
