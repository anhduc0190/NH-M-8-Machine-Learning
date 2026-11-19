import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProjectModal from './components/ProjectModal';
import Dashboard from './pages/Dashboard';
import Prediction from './pages/Prediction';
import BatchPrediction from './pages/BatchPrediction';
import ModelComparison from './pages/ModelComparison';
import DataExplorer from './pages/DataExplorer';
import ErrorAnalysis from './pages/ErrorAnalysis';

export default function App() {
  const [activeTab, setActiveTab] = useState('predict');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'predict':
        return <Prediction />;
      case 'batch':
        return <BatchPrediction />;
      case 'models':
        return <ModelComparison />;
      case 'explorer':
        return <DataExplorer />;
      case 'errors':
        return <ErrorAnalysis />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F5F7FB] font-sans text-[#172033] antialiased">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenProjectInfo={() => setIsModalOpen(true)}
        />
      </div>

      {/* Mobile / Tablet Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-[260px] bg-[#111827] h-full shadow-2xl flex flex-col">
            <div className="p-3 flex justify-end">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setMobileSidebarOpen(false);
              }}
              onOpenProjectInfo={() => {
                setIsModalOpen(true);
                setMobileSidebarOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header Bar with Hamburger */}
        <div className="lg:hidden h-14 bg-[#111827] text-white px-4 flex items-center justify-between border-b border-[#1F2937]">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 text-slate-300 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-sm tracking-tight">HOTEL ANALYTICS</span>
          <div className="w-6" />
        </div>

        {/* Global Desktop Header */}
        <Header
          activeTab={activeTab}
          onOpenProjectInfo={() => setIsModalOpen(true)}
        />

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-7 lg:p-8 w-full">
          {renderActivePage()}
        </main>
      </div>

      {/* Project & Team Info Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
