import { useState } from "react";
import "../../styles/Section.css";

export const ConstraintsSection = () => {
  const [activeTab, setActiveTab] = useState("availability");

  return (
    <div className="section">
      <h2>Constraints</h2>
      <p className="section-description">
        Define faculty availability and fixed class schedules.
      </p>

      <div className="tabs">
        <button className={`tab ${activeTab === "availability" ? "active" : ""}`} onClick={() => setActiveTab("availability")}>Faculty Availability</button>
        <button className={`tab ${activeTab === "fixed" ? "active" : ""}`} onClick={() => setActiveTab("fixed")}>Fixed Classes</button>
      </div>

      <div className="tab-content">
        {activeTab === "availability" && (
          <div className="entity-section">
            <h3>Faculty Availability</h3>
            <button className="btn btn-primary">+ Add Availability Constraint</button>
            <table className="entity-table">
              <thead>
                <tr>
                  <th>Faculty</th>
                  <th>Day</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody style={{ textAlign: "center", color: "#999" }}>
                <tr>
                  <td colSpan={4}>No constraints defined yet</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "fixed" && (
          <div className="entity-section">
            <h3>Fixed Classes</h3>
            <button className="btn btn-primary">+ Add Fixed Class</button>
            <p style={{ color: "#999" }}>No fixed classes defined yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
