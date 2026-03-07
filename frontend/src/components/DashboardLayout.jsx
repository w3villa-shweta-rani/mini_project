import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0f0f1a' }}>
      {/* Sidebar */}
      <div className="hidden md:flex flex-col flex-shrink-0">
        <Sidebar collapsed={collapsed} />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-20 left-0 z-10 p-1 text-gray-400 hover:text-white"
          style={{ marginLeft: collapsed ? '52px' : '244px', transition: 'margin 0.3s' }}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
