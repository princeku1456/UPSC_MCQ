import React from 'react';
import { LeaderboardEntry } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries }) => {
  const { currentUser } = useAuth();

  if (!entries || entries.length === 0) {
      return <div className="alert alert-light border text-center text-muted small">No other attempts yet. Be the first!</div>;
  }

  // Deduplicate and keep best
  const uniqueUsers: Record<string, LeaderboardEntry> = {};
  entries.forEach(entry => {
      const email = entry.userEmail || "Guest";
      if (!uniqueUsers[email] || entry.scorePercent > uniqueUsers[email].scorePercent) {
          uniqueUsers[email] = entry;
      }
  });

  const sorted = Object.values(uniqueUsers).sort((a, b) => b.scorePercent - a.scorePercent);

  return (
    <div className="card border-0 shadow-sm overflow-hidden mt-3">
        <div className="card-header bg-white border-bottom py-2">
             <div className="d-flex justify-content-between align-items-center">
                <h6 className="fw-bold text-primary m-0">🏆 Leaderboard</h6>
                <small className="text-muted">Top Students</small>
             </div>
        </div>
        <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle" style={{fontSize: '0.9rem'}}>
                <tbody className="bg-white">
                    {sorted.map((entry, index) => {
                        const email = entry.userEmail || "Guest";
                        const rawName = email.split("@")[0];
                        const displayName = rawName.length > 3 ? rawName.substring(0, 3) + "***" : rawName;
                        const isMe = currentUser && email === currentUser.email;

                        return (
                            <tr key={index} className={isMe ? "table-warning fw-bold" : ""}>
                                <td className="ps-3 text-secondary">#{index + 1}</td>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center me-2 shadow-sm" style={{width: '24px', height: '24px', fontSize: '10px'}}>
                                            {rawName.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-dark">{displayName}</span>
                                        {isMe && <span className="badge bg-warning text-dark dummy-tag ms-2" style={{fontSize: '0.6rem'}}>YOU</span>}
                                    </div>
                                </td>
                                <td className="text-end pe-3">
                                    <span className={`badge ${entry.scorePercent >= 80 ? "bg-success" : "bg-primary"}`}>
                                        {entry.scorePercent}%
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    </div>
  );
};
