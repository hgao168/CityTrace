import { BrandMark } from "./brand-mark";

const navItems = [
  { id: "journey", icon: "⌁", label: "Today's Trip" },
  { id: "discover", icon: "◇", label: "Explore" },
  { id: "saved", icon: "♡", label: "Saved Places" },
];

type SidebarProps = {
  activeView: string;
  onSelectView: (view: string, label: string) => void;
};

export function Sidebar({ activeView, onSelectView }: SidebarProps) {
  return (
    <aside className="sidebar">
      <a className="brand" href="#" aria-label="CityTrace home">
        <BrandMark />
        <span>CityTrace</span>
      </a>

      <nav className="primary-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <button
            className={`nav-item ${activeView === item.id ? "active" : ""}`}
            key={item.id}
            onClick={() => onSelectView(item.id, item.label)}
          >
            <span className="nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-card">
        <p className="eyebrow">Today&apos;s Weather</p>
        <div className="weather-row">
          <span className="weather-icon">☼</span>
          <div>
            <strong>18°C</strong>
            <span>Partly cloudy · Great for walking</span>
          </div>
        </div>
      </div>

      <div className="profile">
        <span className="avatar">Y</span>
        <div>
          <strong>Traveler</strong>
          <span>History · Architecture · Coffee</span>
        </div>
        <button aria-label="Open profile menu">•••</button>
      </div>
    </aside>
  );
}
