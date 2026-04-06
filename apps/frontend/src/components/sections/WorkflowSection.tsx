import { useState } from "react";
import "../../styles/Section.css";

export const WorkflowSection = () => {
  const [selectedTimetable, setSelectedTimetable] = useState<string | null>(null);

  return (
    <div className="section">
      <h2>Approval Workflows</h2>
      <p className="section-description">
        Review and approve timetables through the workflow state machine.
      </p>

      {!selectedTimetable ? (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <h3>Pending Reviews</h3>
            <table className="entity-table">
              <thead>
                <tr>
                  <th>Timetable ID</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Current Reviewer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody style={{ textAlign: "center", color: "#999" }}>
                <tr>
                  <td colSpan={5}>No pending reviews</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3>Completed Workflows</h3>
            <p style={{ color: "#999" }}>No completed workflows yet</p>
          </div>
        </div>
      ) : (
        <div className="form-card">
          <h3>Workflow Review: {selectedTimetable}</h3>
          <button className="btn btn-secondary" onClick={() => setSelectedTimetable(null)}>
            ← Back
          </button>

          <div style={{ marginTop: "20px" }}>
            <h4>Workflow History</h4>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-marker">📋</div>
                <div className="timeline-content">
                  <p><strong>Submitted for Review</strong></p>
                  <p className="timeline-date">2024-01-15 10:30 AM</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <h4>Review Form</h4>
            <textarea
              placeholder="Add your comments..."
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ddd",
                minHeight: "100px",
                fontFamily: "sans-serif"
              }}
            />
            <div style={{ marginTop: "10px" }}>
              <button className="btn btn-primary">Approve</button>
              <button className="btn btn-danger" style={{ marginLeft: "10px" }}>Reject</button>
              <button className="btn btn-secondary" style={{ marginLeft: "10px" }}>Return to Draft</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
