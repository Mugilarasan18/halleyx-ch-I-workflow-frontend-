import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
    const [wfName, setWfName] = useState('');
    const [wfDesc, setWfDesc] = useState('');
    const [ruleExpr, setRuleExpr] = useState('#amount > 10000');
    const [step1, setStep1] = useState('ADMIN_VERIFY');
    const [step2, setStep2] = useState('CEO_FINAL_APPROVE');
    const [createMsg, setCreateMsg] = useState('');

    const [pendingRequests, setPendingRequests] = useState([]);
    const [approvalMsg, setApprovalMsg] = useState('');

    useEffect(() => {
        fetchPending();
        const interval = setInterval(fetchPending, 10000); 
        return () => clearInterval(interval);
    }, []);

    const fetchPending = async () => {
        try {
            const res = await api.get('/executions/pending?role=ADMIN');
            setPendingRequests(res.data);
        } catch (err) {
            console.error("Error fetching admin pending list:", err);
        }
    };

    const getFormattedLabel = (key, workflowName) => {
        const wf = workflowName?.toLowerCase() || "";
        const k = key.toLowerCase();

        if (k === 'reason') return "Reason";
        
        if (wf.includes('leave') || wf.includes('sick') || k === 'leavedays') {
            if (k === 'amount' || k === 'leavedays' || k === 'inputvalue') return "Duration (Days)";
        }
        
        if (wf.includes('expense') || wf.includes('travel') || wf.includes('claim')) {
            if (k === 'amount' || k === 'inputvalue') return "Total Amount (₹)";
        }

        return key.charAt(0).toUpperCase() + key.slice(1);
    };

    const handleCreateWorkflow = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: wfName,
                description: wfDesc,
                version: 1,
                isActive: true,
                rules: [{ condition: ruleExpr }],
                steps: [
                    { stepName: step1, stepOrder: 1 },
                    { stepName: step2, stepOrder: 2 }
                ]
            };
            await api.post('/workflows', payload);
            setCreateMsg(`Success! Workflow "${wfName}" published.`);
            setWfName(''); setWfDesc('');
        } catch (error) {
            setCreateMsg('Failed to create workflow.');
        }
    };

    const handleAction = async (id, isApproved) => {
        try {
            const comments = isApproved ? "Approved by Admin" : "Rejected by Admin";
            await api.post(`/executions/${id}/approve?role=ADMIN&isApproved=${isApproved}&comments=${comments}`);
            setApprovalMsg("Request processed and moved to next level!");
            fetchPending(); 
        } catch (error) {
            setApprovalMsg('Action failed.');
        }
    };

    return (
        <div>
            <Navbar title="Admin Command Center" />
            <div className="container">
                
                <div className="card" style={{ borderTop: '5px solid #3498db', marginBottom: '30px' }}>
                    <h3>🛠️ Create New Workflow</h3>
                    {createMsg && <p style={{backgroundColor: '#d4edda', padding: '10px', color: '#155724', borderRadius: '5px'}}>{createMsg}</p>}
                    <form onSubmit={handleCreateWorkflow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                        <div>
                            <div className="form-group"><label>Workflow Name</label><input type="text" value={wfName} onChange={(e)=>setWfName(e.target.value)} required placeholder="e.g. Sick Leave" /></div>
                            <div className="form-group"><label>Rule Condition</label><input type="text" value={ruleExpr} onChange={(e)=>setRuleExpr(e.target.value)} required /></div>
                        </div>
                        <div>
                            <div className="form-group"><label>Step 1 (Admin)</label><input type="text" value={step1} onChange={(e)=>setStep1(e.target.value)} required /></div>
                            <div className="form-group"><label>Step 2 (CEO)</label><input type="text" value={step2} onChange={(e)=>setStep2(e.target.value)} required /></div>
                        </div>
                        <button type="submit" className="btn btn-success" style={{gridColumn: 'span 2'}}>Publish Workflow</button>
                    </form>
                </div>

                <hr style={{margin: '40px 0'}} />

                <div className="card" style={{ borderTop: '5px solid #f1c40f' }}>
                    <h3> User Submissions (Waiting for Approval)</h3>
                    {approvalMsg && <p style={{color: 'blue', fontWeight: 'bold', marginBottom: '15px'}}>{approvalMsg}</p>}
                    
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead style={{ backgroundColor: '#2c3e50', color: 'white' }}>
                            <tr>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Requester</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Submission Details</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingRequests.length === 0 ? (
                                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>No pending requests from users.</td></tr>
                            ) : (
                                pendingRequests.map(req => (
                                    <tr key={req.id} style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{fontWeight: 'bold', fontSize: '16px'}}>{req.triggeredBy}</div>
                                            <div style={{fontSize: '11px', color: '#7f8c8d'}}>Submitted: {new Date(req.startedAt).toLocaleDateString()}</div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ backgroundColor: '#fcfcfc', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                                                <div style={{ 
                                                    color: '#2980b9', 
                                                    fontWeight: 'bold', 
                                                    borderBottom: '1px solid #eee', 
                                                    paddingBottom: '8px', 
                                                    marginBottom: '10px',
                                                    textTransform: 'uppercase',
                                                    fontSize: '13px',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}>
                                                     {req.workflowName || "SYSTEM WORKFLOW"}
                                                </div>

                                                {req.data ? (
                                                    Object.entries(req.data).map(([key, value]) => (
                                                        <div key={key} style={{ marginBottom: '6px', fontSize: '14px', display: 'flex' }}>
                                                            <span style={{ fontWeight: '600', color: '#555', minWidth: '130px' }}>
                                                                {getFormattedLabel(key, req.workflowName)}: 
                                                            </span>
                                                            <span style={{ color: '#2c3e50', fontWeight: '500' }}>{value.toString()}</span>
                                                        </div>
                                                    ))
                                                ) : <span style={{color: '#999'}}>No data available</span>}
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
                                                <button className="btn btn-success" onClick={() => handleAction(req.id, true)}>Approve</button>
                                                <button className="btn btn-danger" onClick={() => handleAction(req.id, false)}>Reject</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;