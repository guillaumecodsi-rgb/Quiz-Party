import { useGameStore } from './store/gameStore';
import HomeScreen from './components/HomeScreen';
import ThemeSelectionScreen from './components/ThemeSelectionScreen';
import GameMasterView from './components/GameMasterView';
import GameOverScreen from './components/GameOverScreen';
import SettingsScreen from './components/SettingsScreen';
import ThemeManagerScreen from './components/ThemeManagerScreen';
import StatsScreen from './components/StatsScreen';

function App() {
  const { phase } = useGameStore();

  return (
    <div className="min-h-screen text-slate-100">
      {phase === 'home' && <HomeScreen />}
      {phase === 'theme-selection' && <ThemeSelectionScreen />}
      {phase === 'playing' && <GameMasterView />}
      {phase === 'game-over' && <GameOverScreen />}
      {phase === 'settings' && <SettingsScreen />}
      {phase === 'theme-manager' && <ThemeManagerScreen />}
      {phase === 'stats' && <StatsScreen />}
    </div>
  );
}

export default App;
