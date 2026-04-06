import { useEffect, useState } from "react";
import {
  addClassroom,
  addDepartment,
  deleteClassroom,
  deleteDepartment,
  subscribeClassrooms,
  subscribeDepartments,
  updateClassroom,
  updateDepartment
} from "../../services/masterDataRealtime.js";
import { Classroom, Department } from "../../types.js";
import "../../styles/Section.css";

export const MasterDataSection = () => {
  const [activeTab, setActiveTab] = useState("departments");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [departmentName, setDepartmentName] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);

  const [buildingName, setBuildingName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [facilities, setFacilities] = useState("");
  const [editingClassroomId, setEditingClassroomId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeDepartments = subscribeDepartments((data) => {
      setDepartments(data);
      setLoading(false);
    });

    const unsubscribeClassrooms = subscribeClassrooms((data) => {
      setClassrooms(data);
      setLoading(false);
    });

    return () => {
      unsubscribeDepartments();
      unsubscribeClassrooms();
    };
  }, []);

  const resetDepartmentForm = () => {
    setDepartmentName("");
    setDepartmentCode("");
    setEditingDepartmentId(null);
  };

  const resetClassroomForm = () => {
    setBuildingName("");
    setRoomNumber("");
    setCapacity("");
    setFacilities("");
    setEditingClassroomId(null);
  };

  const handleSaveDepartment = async () => {
    setError(null);
    if (!departmentName.trim() || !departmentCode.trim()) {
      setError("Department name and code are required.");
      return;
    }

    try {
      if (editingDepartmentId) {
        await updateDepartment(editingDepartmentId, {
          name: departmentName.trim(),
          code: departmentCode.trim().toUpperCase()
        });
      } else {
        await addDepartment({
          name: departmentName.trim(),
          code: departmentCode.trim().toUpperCase()
        });
      }
      resetDepartmentForm();
    } catch {
      setError("Could not save department.");
    }
  };

  const handleSaveClassroom = async () => {
    setError(null);
    const parsedCapacity = Number(capacity);
    if (!buildingName.trim() || !roomNumber.trim() || Number.isNaN(parsedCapacity) || parsedCapacity <= 0) {
      setError("Building, room, and a valid capacity are required.");
      return;
    }

    try {
      if (editingClassroomId) {
        await updateClassroom(editingClassroomId, {
          buildingName: buildingName.trim(),
          roomNumber: roomNumber.trim(),
          capacity: parsedCapacity,
          facilities: facilities.trim() || undefined
        });
      } else {
        await addClassroom({
          buildingName: buildingName.trim(),
          roomNumber: roomNumber.trim(),
          capacity: parsedCapacity,
          facilities: facilities.trim() || undefined
        });
      }
      resetClassroomForm();
    } catch {
      setError("Could not save classroom.");
    }
  };

  const handleEditDepartment = (department: Department) => {
    setDepartmentName(department.name);
    setDepartmentCode(department.code);
    setEditingDepartmentId(department.id);
  };

  const handleEditClassroom = (classroom: Classroom) => {
    setBuildingName(classroom.buildingName);
    setRoomNumber(classroom.roomNumber);
    setCapacity(String(classroom.capacity));
    setFacilities(classroom.facilities || "");
    setEditingClassroomId(classroom.id);
  };

  const handleDeleteDepartment = async (id: string) => {
    setError(null);
    try {
      await deleteDepartment(id);
      if (editingDepartmentId === id) {
        resetDepartmentForm();
      }
    } catch {
      setError("Could not delete department.");
    }
  };

  const handleDeleteClassroom = async (id: string) => {
    setError(null);
    try {
      await deleteClassroom(id);
      if (editingClassroomId === id) {
        resetClassroomForm();
      }
    } catch {
      setError("Could not delete classroom.");
    }
  };

  return (
    <div className="section">
      <h2>Master Data Management</h2>
      <p className="section-description">
        Manage core entities like departments and classrooms.
      </p>

      {error && <p className="inline-error">{error}</p>}
      {loading && <p className="inline-info">Loading data from Firebase...</p>}

      <div className="tabs">
        <button
          className={`tab ${activeTab === "departments" ? "active" : ""}`}
          onClick={() => setActiveTab("departments")}
        >
          Departments
        </button>
        <button
          className={`tab ${activeTab === "classrooms" ? "active" : ""}`}
          onClick={() => setActiveTab("classrooms")}
        >
          Classrooms
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "departments" && (
          <div className="entity-section">
            <h3>Departments</h3>
            <div className="inline-form-grid">
              <input
                placeholder="Department name"
                value={departmentName}
                onChange={(event) => setDepartmentName(event.target.value)}
              />
              <input
                placeholder="Code"
                value={departmentCode}
                onChange={(event) => setDepartmentCode(event.target.value)}
              />
              <button className="btn btn-primary" onClick={handleSaveDepartment}>
                {editingDepartmentId ? "Update Department" : "+ Add Department"}
              </button>
              {editingDepartmentId && (
                <button className="btn btn-secondary" onClick={resetDepartmentForm}>
                  Cancel
                </button>
              )}
            </div>
            <table className="entity-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="empty-cell">No departments yet</td>
                  </tr>
                ) : (
                  departments.map((department) => (
                    <tr key={department.id}>
                      <td>{department.name}</td>
                      <td>{department.code}</td>
                      <td>
                        <button className="btn-sm" onClick={() => handleEditDepartment(department)}>
                          Edit
                        </button>
                        <button className="btn-sm btn-danger" onClick={() => handleDeleteDepartment(department.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "classrooms" && (
          <div className="entity-section">
            <h3>Classrooms</h3>
            <div className="inline-form-grid inline-form-grid-4">
              <input
                placeholder="Building"
                value={buildingName}
                onChange={(event) => setBuildingName(event.target.value)}
              />
              <input
                placeholder="Room"
                value={roomNumber}
                onChange={(event) => setRoomNumber(event.target.value)}
              />
              <input
                placeholder="Capacity"
                type="number"
                min={1}
                value={capacity}
                onChange={(event) => setCapacity(event.target.value)}
              />
              <input
                placeholder="Facilities (optional)"
                value={facilities}
                onChange={(event) => setFacilities(event.target.value)}
              />
              <button className="btn btn-primary" onClick={handleSaveClassroom}>
                {editingClassroomId ? "Update Classroom" : "+ Add Classroom"}
              </button>
              {editingClassroomId && (
                <button className="btn btn-secondary" onClick={resetClassroomForm}>
                  Cancel
                </button>
              )}
            </div>
            <table className="entity-table">
              <thead>
                <tr>
                  <th>Building</th>
                  <th>Room</th>
                  <th>Capacity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classrooms.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-cell">No classrooms yet</td>
                  </tr>
                ) : (
                  classrooms.map((classroom) => (
                    <tr key={classroom.id}>
                      <td>{classroom.buildingName}</td>
                      <td>{classroom.roomNumber}</td>
                      <td>{classroom.capacity}</td>
                      <td>
                        <button className="btn-sm" onClick={() => handleEditClassroom(classroom)}>
                          Edit
                        </button>
                        <button className="btn-sm btn-danger" onClick={() => handleDeleteClassroom(classroom.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
