import "../styles/Sidebar.css";

interface SidebarProps {
  currentSection: "master" | "setup" | "constraints" | "timetables" | "workflows";
  onSelectSection: (section: "master" | "setup" | "constraints" | "timetables" | "workflows") => void;
}

export const Sidebar = ({ currentSection, onSelectSection }: SidebarProps) => {
  const sections = [
    { id: "master", label: "Master Data", icon: "📋" },
    { id: "setup", label: "Setup Entities", icon: "⚙️" },
    { id: "constraints", label: "Constraints", icon: "🔒" },
    { id: "timetables", label: "Timetables", icon: "📅" },
    { id: "workflows", label: "Workflows", icon: "✅" }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Menu</h2>
      </div>
      <nav className="sidebar-nav">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`nav-item ${currentSection === section.id ? "active" : ""}`}
            onClick={() => onSelectSection(section.id as any)}
          >
            <span className="nav-icon">{section.icon}</span>
            <span className="nav-label">{section.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};
