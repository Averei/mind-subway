import { useState, useEffect } from 'react';
import OutletMap from './OutletMap';
import ChatBot from './ChatBot';
import type { Outlet } from '../types/outlet';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Dashboard(): React.ReactElement {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        const response = await fetch(`${API_URL}/api/outlets`);
        const data = await response.json();
        setOutlets(data);
      } catch (error) {
        console.error('Error fetching outlets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOutlets();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="drawer lg:drawer-open h-screen">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      
      <div className="drawer-content flex flex-col h-full">
        {/* Navbar */}
        <div className="w-full navbar bg-base-300">
          <div className="flex-none lg:hidden">
            <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </label>
          </div>
          <div className="flex-1 px-2 mx-2 text-xl font-bold">Subway Outlets in KL</div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 relative">
          <div className="h-full rounded-lg overflow-hidden border border-base-300">
            <OutletMap outlets={outlets} />
          </div>
          {/* Chatbot */}
          <ChatBot outlets={outlets} />
        </div>
      </div>

      {/* Sidebar */}
      <div className="drawer-side h-screen">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label> 
        <div className="p-4 w-80 h-full bg-base-200 text-base-content flex flex-col">
          {/* Stats */}
          <div className="stats stats-vertical shadow w-full">
            <div className="stat">
              <div className="stat-title">Total Outlets</div>
              <div className="stat-value">{outlets.length}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Coverage Area</div>
              <div className="stat-value">{outlets.length * 5}km²</div>
            </div>
          </div>

          {/* Outlet List */}
          <div className="flex-1 mt-4 flex flex-col overflow-hidden">
            <h3 className="font-bold mb-2">Outlet List</h3>
            <div className="flex-1 overflow-y-auto">
              {outlets.map((outlet: Outlet) => (
                <div key={outlet.id} className="card card-compact bg-base-100 shadow-sm mb-2">
                  <div className="card-body">
                    <h4 className="card-title text-sm">{outlet.name}</h4>
                    <p className="text-xs">{outlet.address}</p>
                    <p className="text-xs opacity-70">{outlet.operating_hours}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}