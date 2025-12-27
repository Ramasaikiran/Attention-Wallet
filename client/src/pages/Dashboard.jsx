import React, { useEffect } from 'react';
import { useTokens } from '../context/TokenContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { balance, stats, refreshStats } = useTokens();

    useEffect(() => {
        refreshStats();
    }, []);

    // Find the "Attention Thief"
    const appUsage = {};
    stats.history.filter(t => t.type === 'spend').forEach(t => {
        appUsage[t.category] = (appUsage[t.category] || 0) + t.amount;
    });

    // Convert to array and sort
    const sortedApps = Object.entries(appUsage).sort((a, b) => b[1] - a[1]);
    const thief = sortedApps.length > 0 ? sortedApps[0] : null;

    return (
        <div className="dashboard">
            <header className="hero-section">
                <div className="balance-card animate-pop">
                    <h2>Current Balance</h2>
                    <div className="balance-amount">{balance} <span className="currency">Tokens</span></div>
                    <div className="balance-actions">
                        <Link to="/earn" className="btn btn-primary">Earn More</Link>
                        <Link to="/spend" className="btn btn-secondary">Spend Now</Link>
                    </div>
                </div>
            </header>

            <div className="stats-grid">
                <div className="card stat-card">
                    <h3>Earned Today</h3>
                    <p className="stat-value positive">+{stats.earnedToday}</p>
                </div>
                <div className="card stat-card">
                    <h3>Spent Today</h3>
                    <p className="stat-value negative">-{stats.spentToday}</p>
                </div>
                {thief && (
                    <div className="card stat-card thief-card">
                        <h3>Attention Thief</h3>
                        <p className="thief-name">🚫 {thief[0]}</p>
                        <p className="thief-amount">Took {thief[1]} tokens</p>
                    </div>
                )}
            </div>

            <section className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                    {stats.history.length === 0 ? <p>No activity yet.</p> : (
                        stats.history.map((tx) => (
                            <div key={tx._id} className={`activity-item ${tx.type}`}>
                                <div className="activity-info">
                                    <span className="activity-cat">{tx.category}</span>
                                    <span className="activity-desc">{tx.description}</span>
                                </div>
                                <span className="activity-amount">
                                    {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
