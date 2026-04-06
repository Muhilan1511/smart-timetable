import { useState } from "react";
import "../../styles/Section.css";

export const SetupSection = () => {
  const [activeTab, setActiveTab] = useState("shifts");

  return (
    <div className="section">
      <h2>Setup Entities</h2>
      <p className="section-description">
        Configure shifts, programs, batches, subjects, and faculty.
      </p>

      <div className="tabs">
        <button className={`tab ${activeTab === "shifts" ? "active" : ""}`} onClick={() => setActiveTab("shifts")}>Shifts</button>
        <button className={`tab ${activeTab === "programs" ? "active" : ""}`} onClick={() => setActiveTab("programs")}>Programs</button>
        <button className={`tab ${activeTab === "batches" ? "active" : ""}`} onClick={() => setActiveTab("batches")}>Batches</button>
        <button className={`tab ${activeTab === "subjects" ? "active" : ""}`} onClick={() => setActiveTab("subjects")}>Subjects</button>
        <button className={`tab ${activeTab === "faculty" ? "active" : ""}`} onClick={() => setActiveTab("faculty")}>Faculty</button>
      </div>

      <div className="tab-content">
        {activeTab === "shifts" && (
          <div className="entity-section">
            <h3>Shifts</h3>
            <button className="btn btn-primary">+ Add Shift</button>
            <table className="entity-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody style={{ textAlign: "center", color: "#999" }}>
                <tr>
                  <td colSpan={4}>No shifts created yet</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "programs" && (
          <div className="entity-section">
            <h3>Programs</h3>
            <button className="btn btn-primary">+ Add Program</button>
            <p style={{ color: "#999" }}>No programs created yet</p>
          </div>
        )}

        {activeTab === "batches" && (
          <div className="entity-section">
            <h3>Batches</h3>
            <button className="btn btn-primary">+ Add Batch</button>
            <p style={{ color: "#999" }}>No batches created yet</p>
          </div>
        )}

        {activeTab === "subjects" && (
          <div className="entity-section">
            <h3>Subjects</h3>
            <button className="btn btn-primary">+ Add Subject</button>
            <p style={{ color: "#999" }}>No subjects created yet</p>
          </div>
        )}

        {activeTab === "faculty" && (
          <div className="entity-section">
            <h3>Faculty</h3>
            <button className="btn btn-primary">+ Add Faculty</button>
            <p style={{ color: "#999" }}>No faculty created yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
