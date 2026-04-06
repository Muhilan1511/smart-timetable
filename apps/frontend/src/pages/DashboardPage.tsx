import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/index.js";
import { logoutAsync } from "../store/authSlice.js";
import { Sidebar } from "../components/Sidebar.js";
import { MasterDataSection } from "../components/sections/MasterDataSection.js";
import { SetupSection } from "../components/sections/SetupSection.js";
import { ConstraintsSection } from "../components/sections/ConstraintsSection.js";
import { TimetableSection } from "../components/sections/TimetableSection.js";
import { WorkflowSection } from "../components/sections/WorkflowSection.js";
import "../styles/Dashboard.css";

export const DashboardPage = () => {
  const [currentSection, setCurrentSection] = useState<"master" | "setup" | "constraints" | "timetables" | "workflows">("master");
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = async () => {
    await dispatch(logoutAsync());
    navigate("/login");
  };

  const renderSection = () => {
    switch (currentSection) {
      case "master":
        return <MasterDataSection />;
      case "setup":
        return <SetupSection />;
      case "constraints":
        return <ConstraintsSection />;
      case "timetables":
        return <TimetableSection />;
      case "workflows":
        return <WorkflowSection />;
      default:
        return <MasterDataSection />;
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Smart Timetable Scheduler</h1>
        <div className="header-right">
          <span className="user-info">
            {user?.displayName || user?.email} ({user?.role})
          </span>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <Sidebar currentSection={currentSection} onSelectSection={setCurrentSection} />
        <main className="main-content">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};
