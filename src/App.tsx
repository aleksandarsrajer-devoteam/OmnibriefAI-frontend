import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { SplitScreenView } from './views/SplitScreenView';
import './App.css';

const AppContent: React.FC = () => {
  const { currentView } = useApp();

  switch (currentView) {
    case 'auth':
      return <AuthView />;
    case 'dashboard':
      return <DashboardView />;
    case 'split-screen-viewer':
      return <SplitScreenView />;
    default:
      return <AuthView />;
  }
};
//Test
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
//Testing
export default App;
