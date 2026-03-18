import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';

const UserDashboard = () => {
    const [workflows, setWorkflows] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [selectedWf, setSelectedWf] = useState(null);
    
    const [reason, setReason] = useState('');
    const [inputValue, setInputValue] = useState(''); 
    const [message, setMessage] = useState('');

    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');

    const fetchData = async () => {
        try {
            const wfRes = await api.get('/workflows');
            setWorkflows(wfRes.data);
            const exRes = await api.get(`/executions?user=${username}`);
            setMyRequests(exRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); 
        return () => clearInterval(interval);
    }, []);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const ruleKey = selectedWf.rules?.[0]?.condition?.includes('leaveDays') ? 'leaveDays' : 'amount';
            const payload = {
                inputData: { 
                    [ruleKey]: Number(inputValue),
                    reason: reason,
                    description: selectedWf.description
                },
                triggeredBy: username
            };
            
            await api.post(`/executions/start/${selectedWf.id}`, payload);
            setMessage(`Success! ${selectedWf.name} request submitted. Waiting for Admin review.`);
            setInputValue('');
            setReason('');
            setSelectedWf(null);
            fetchData();
        } catch (error) {
            setMessage("Submission failed!");
        }
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'COMPLETED': return { color: 'white', backgroundColor: '#2ecc71', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold' };
            case 'REJECTED': return { color: 'white', backgroundColor: '#e74c3c', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold' };
            case 'PENDING_ADMIN': return { color: 'black', backgroundColor: '#f1c40f', padding: '5px 10px', borderRadius: '4px' };
            case 'PENDING_CEO': return { color: 'white', backgroundColor: '#e67e22', padding: '5px 10px', borderRadius: '4px' };
            default: return { color: 'white', backgroundColor: '#3498db', padding: '5px 10px', borderRadius: '4px' };
        }
    };

    const getStatusText = (status) => {
        if (status === 'COMPLETED') return 'APPROVED ';
        if (status === 'REJECTED') return 'REJECTED ';
        if (status === 'PENDING_ADMIN') return 'Waiting for Admin Approval ';
        if (status === 'PENDING_CEO') return 'Waiting for CEO Approval ';
        return status;
    };

    return (
        <div>
            <Navbar title="User Portal" />
            <div className="container">
                
                {!selectedWf ? (
                    <div className="card">
                        <h3>Available Workflows</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '15px' }}>
                            {workflows.map(wf => (
                                <div key={wf.id} className="card" style={{ border: '1px solid #ddd', cursor: 'pointer' }} onClick={() => setSelectedWf(wf)}>
                                    <h4 style={{color: '#2c3e50'}}>{wf.name}</h4>
                                    <p style={{ fontSize: '13px', color: '#666' }}>{wf.description}</p>
                                    <button className="btn btn-success" style={{ width: '100%', marginTop: '10px' }}>Apply Now</button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="card" style={{ borderTop: '5px solid #2ecc71' }}>
                        <h3>Workflow Application Form</h3>
                        <form onSubmit={handleFormSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <div className="form-group"><label>User ID:</label><input type="text" value={userId} disabled style={{backgroundColor: '#eee'}} /></div>
                                    <div className="form-group"><label>Username:</label><input type="text" value={username} disabled style={{backgroundColor: '#eee'}} /></div>
                                    <div className="form-group"><label>Workflow:</label><input type="text" value={selectedWf.name} disabled style={{backgroundColor: '#eee'}} /></div>
                                </div>
                                <div>
                                    <div className="form-group"><label>Rule Condition:</label><input type="text" value={selectedWf.rules?.[0]?.condition || 'N/A'} disabled style={{backgroundColor: '#fffbe6'}} /></div>
                                    <div className="form-group"><label>Value (Amount / Days):</label><input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} required /></div>
                                    <div className="form-group">
                                        <label>Reason / Description:</label>
                                        <textarea value={reason} onChange={(e) => setReason(e.target.value)} required style={{width: '100%', padding: '10px', borderRadius: '5px'}} />
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="submit" className="btn btn-success">Submit Request</button>
                                <button type="button" className="btn" onClick={() => setSelectedWf(null)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {message && <p style={{ color: 'blue', fontWeight: 'bold', margin: '20px 0' }}>{message}</p>}

                <div className="card" style={{marginTop: '40px'}}>
                    <h3>My Submission History</h3>
                    <table style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#2c3e50', color: 'white', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>Workflow</th>
                                <th style={{ padding: '12px' }}>Status</th>
                                <th style={{ padding: '12px' }}>Logs / Remarks</th>
                                <th style={{ padding: '12px' }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myRequests.map(req => (
                                <tr key={req.id} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{req.workflowName}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={getStatusStyle(req.status)}>{getStatusText(req.status)}</span>
                                    </td>
                                    <td style={{ padding: '12px', fontSize: '14px' }}>
                                        {req.logs && req.logs.length > 0 ? req.logs[req.logs.length - 1] : "Request Submitted"}
                                    </td>
                                    <td style={{ padding: '12px', fontSize: '13px' }}>{new Date(req.startedAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;