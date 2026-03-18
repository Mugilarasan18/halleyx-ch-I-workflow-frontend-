import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';

const CeoDashboard = () => {
    const [pending, setPending] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const pRes = await api.get('/executions/pending?role=CEO');
            setPending(pRes.data);

            const hRes = await api.get('/executions/all-history');
            setHistory(hRes.data);
        } catch (err) { 
            console.error("Error fetching CEO data:", err); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchData(); 
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, []);

    const handleAction = async (id, isApproved) => {
        try {
            await api.post(`/executions/${id}/approve?role=CEO&isApproved=${isApproved}&comments=CEO Final Decision`);
            alert(isApproved ? "Workflow Approved Successfully!" : "Workflow Rejected.");
            fetchData(); 
        } catch (err) { 
            alert("Action failed. Please check backend."); 
        }
    };

    return (
        <div>
            <Navbar title="CEO Dashboard | Strategy & Analytics" />
            <div className="container" style={{ padding: '20px' }}>
                
                {loading && <p style={{ color: '#3498db', textAlign: 'right' }}>Updating data...</p>}

                <div className="card" style={{ borderTop: '5px solid #e67e22', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: '#d35400' }}> Pending CEO Approvals</h3>
                    
                    <div style={{ marginTop: '15px' }}>
                        {pending.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                                No high-level requests pending.
                            </p>
                        ) : (
                            pending.map(p => (
                                <div key={p.id} className="card" style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    backgroundColor: '#fffcf9',
                                    border: '1px solid #ffe0b2',
                                    marginBottom: '10px'
                                }}>
                                    <div>
                                        <strong>{p.triggeredBy}</strong> (User) requested{' '}
                                        <strong>{p.workflowName || p.workflow?.name || 'N/A'}</strong>
                                        <br />
                                        <small style={{ color: '#7f8c8d' }}>
                                            Details: {JSON.stringify(p.data)}
                                        </small>
                                    </div>
                                    <div>
                                        <button 
                                            className="btn btn-success" 
                                            onClick={() => handleAction(p.id, true)}
                                        >
                                            Final Approve
                                        </button>
                                        <button 
                                            className="btn btn-danger" 
                                            onClick={() => handleAction(p.id, false)} 
                                            style={{ marginLeft: '5px' }}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="card" style={{ marginTop: '30px', borderTop: '5px solid #2c3e50', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: '#2c3e50' }}> Full System Analytics & History</h3>
                    
                    <div style={{ overflowX: 'auto', marginTop: '15px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#2c3e50', color: 'white', textAlign: 'left' }}>
                                    <th style={{ padding: '12px' }}>User Name</th>
                                    <th style={{ padding: '12px' }}>Workflow Name</th>
                                    <th style={{ padding: '12px' }}>Rule Applied</th>
                                    <th style={{ padding: '12px' }}>Latest Logs</th>
                                    <th style={{ padding: '12px' }}>Final Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                            No history found.
                                        </td>
                                    </tr>
                                ) : (
                                    history.map(h => (
                                        <tr key={h.id} style={{ borderBottom: '1px solid #ddd' }}>
                                            <td style={{ padding: '12px' }}>{h.triggeredBy}</td>

                                            <td style={{ padding: '12px' }}>
                                                <strong>{h.workflowName || h.workflow?.name || 'N/A'}</strong>
                                            </td>

                                            <td style={{ padding: '12px' }}>
                                                <code style={{ background: '#f4f4f4', padding: '2px 4px' }}>
                                                    {h.ruleCondition || 'N/A'}
                                                </code>
                                            </td>

                                            <td style={{ padding: '12px', fontSize: '11px', maxWidth: '200px' }}>
                                                {h.logs?.length ? h.logs[h.logs.length - 1] : 'No logs'}
                                            </td>

                                            <td style={{ padding: '12px' }}>
                                                <span style={{ 
                                                    padding: '5px 10px', 
                                                    borderRadius: '4px', 
                                                    color: 'white', 
                                                    fontSize: '11px',
                                                    fontWeight: 'bold',
                                                    background: h.status === 'COMPLETED'
                                                        ? '#2ecc71'
                                                        : h.status === 'REJECTED'
                                                        ? '#e74c3c'
                                                        : '#3498db'
                                                }}>
                                                    {h.status === 'COMPLETED' ? 'APPROVED' : h.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CeoDashboard;