import React, { useEffect, useState } from "react";
import "./BackUp.css"; // Make sure you style this accordingly

const Backup = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock function to simulate fetching from backend
  useEffect(() => {
    setLoading(true);
    // Replace with actual API call
    setTimeout(() => {
      setBackups([
        { id: 1, name: "Backup_2025_06_01", date: "01/06/2025", size: "150MB" },
        { id: 2, name: "Backup_2025_05_25", date: "25/05/2025", size: "140MB" },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const handleCreateBackup = () => {
    alert("Creating backup... (connect to Flask API here)");
  };

  const handleRestore = (id) => {
    const backup = backups.find(b => b.id === id);
    if (window.confirm(`Are you sure you want to restore "${backup.name}"? This will overwrite the current server state.`)) {
      alert(`Restoring ${backup.name}...`);
    }
  };

  const handleDelete = (id) => {
    const backup = backups.find(b => b.id === id);
    if (window.confirm(`Delete backup "${backup.name}"? This cannot be undone.`)) {
      setBackups(backups.filter(b => b.id !== id));
    }
  };

  return (
    <div className="backup-container">
      <h2 className="backup-header">Server Backups</h2>

      <div className="backup-actions">
        <button className="backup-button create" onClick={handleCreateBackup}>
          Create Backup
        </button>
      </div>

      {loading ? (
        <p>Loading backups...</p>
      ) : backups.length === 0 ? (
        <p>No backups found.</p>
      ) : (
        <div className="backup-list">
          {backups.map((backup) => (
            <div className="backup-card" key={backup.id}>
              <div className="backup-info">
                <h3>{backup.name}</h3>
                <p>Date: {backup.date}</p>
                <p>Size: {backup.size}</p>
              </div>
              <div className="backup-buttons">
                <button className="restore-btn" onClick={() => handleRestore(backup.id)}>Restore</button>
                <button className="delete-btn" onClick={() => handleDelete(backup.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Backup;
