import { useState } from 'react';
import { useGameStore } from './store/gameStore';
import { HUD } from './components/HUD';
import { KnowledgeHub } from './components/KnowledgeHub';

// Views
import { SetupView } from './components/views/SetupView';
import { LifestyleView } from './components/views/LifestyleView';
import { ActionView } from './components/views/ActionView';
import { EventView } from './components/views/EventView';
import { SummaryView } from './components/views/SummaryView';
import { EndView } from './components/views/EndView';

function App() {
  const { phase } = useGameStore();
  const [showKnowledgeHub, setShowKnowledgeHub] = useState(false);

  const renderPhase = () => {
    switch (phase) {
      case 'SETUP': return <SetupView />;
      case 'LIFESTYLE': return <LifestyleView />;
      case 'ACTION': return <ActionView />;
      case 'EVENT': return <EventView />;
      case 'SUMMARY': return <SummaryView />;
      case 'END': return <EndView />;
      default: return <div>Unknown Phase</div>;
    }
  };

  return (
    <div className="bg-background min-h-screen text-white font-sans selection:bg-primary/30 selection:text-white">
      <HUD />
      
      {/* Floating Knowledge Hub Toggle */}
      {phase !== 'SETUP' && (
        <button 
          onClick={() => setShowKnowledgeHub(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-surface border border-gray-600 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-800 transition-all z-40 group"
          title="Knowledge Hub"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">📚</span>
        </button>
      )}

      {showKnowledgeHub && (
        <KnowledgeHub onClose={() => setShowKnowledgeHub(false)} />
      )}

      <main>
        {renderPhase()}
      </main>
    </div>
  );
}

export default App;
