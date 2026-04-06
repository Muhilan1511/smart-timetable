import { useState } from "react";
import "../../styles/Section.css";

export const TimetableSection = () => {
  const [showOptimizeForm, setShowOptimizeForm] = useState(false);

  return (
    <div className="section">
      <h2>Timetable Generation</h2>
      <p className="section-description">
        Generate optimized timetables and manage schedule versions.
      </p>

      {!showOptimizeForm ? (
        <>
          <button className="btn btn-primary btn-lg" onClick={() => setShowOptimizeForm(true)}>
            + Generate New Timetable
          </button>

          <div style={{ marginTop: "30px" }}>
            <h3>Recent Timetables</h3>
            <table className="entity-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Shift</th>
                  <th>Status</th>
                  <th>Quality Score</th>
                  <th>Conflicts</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody style={{ textAlign: "center", color: "#999" }}>
                <tr>
                  <td colSpan={6}>No timetables generated yet</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="form-card">
          <h3>Generate New Timetable</h3>
          <form>
            <div className="form-group">
              <label>Department *</label>
              <select required>
                <option value="">Select Department</option>
                <option value="cs">Computer Science</option>
              </select>
            </div>

            <div className="form-group">
              <label>Shift *</label>
              <select required>
                <option value="">Select Shift</option>
                <option value="morning">Morning</option>
              </select>
            </div>

            <div className="form-group">
              <label>Academic Year *</label>
              <input type="text" placeholder="2024-2025" required />
            </div>

            <div className="form-group">
              <label>Semester *</label>
              <select required>
                <option value="">Select Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowOptimizeForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Generate Timetable
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
