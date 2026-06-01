import { useState } from 'react';
import { AuthWrapper } from './components/AuthWrapper';
import { UserMenu } from './components/UserMenu';
import FriendsModal from './components/FriendsModal';
import Header from './components/Header';
import { Navigation } from './components/Navigation';
import { Suspense, lazy } from 'react';
import { useSupabaseData } from './hooks/useSupabaseData';
import { getLocalDateString } from './utils/dateUtils';
import { Users, Loader2 } from 'lucide-react';
import { VoiceflowWidget } from './components/VoiceflowWidget';
import { LimitModal, LimitType } from './components/LimitModal';
import { getRankFromPoints } from './utils/rankingSystem';

// Lazy load views for better performance
const HabitsView = lazy(() => import('./components/HabitsView').then(m => ({ default: m.HabitsView })));
const GoalsView = lazy(() => import('./components/GoalsView').then(m => ({ default: m.GoalsView })));
const AnalyticsView = lazy(() => import('./components/AnalyticsView').then(m => ({ default: m.AnalyticsView })));
const SkillsView = lazy(() => import('./components/SkillsView').then(m => ({ default: m.SkillsView })));
const SettingsView = lazy(() => import('./components/SettingsView').then(m => ({ default: m.SettingsView })));
const RulesView = lazy(() => import('./components/RulesView').then(m => ({ default: m.RulesView })));
const LeaderboardView = lazy(() => import('./components/LeaderboardView').then(m => ({ default: m.LeaderboardView })));

type ViewType = 'habits' | 'goals' | 'skills' | 'rules' | 'analytics' | 'leaderboard' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('habits');
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [dismissedPenaltyMessage, setDismissedPenaltyMessage] = useState(false);
  const [dismissedAutoRespectMessage, setDismissedAutoRespectMessage] = useState(false);
  const [limitModalConfig, setLimitModalConfig] = useState<{isOpen: boolean, type: LimitType}>({ isOpen: false, type: 'RANK_GATE' });

  const {
    habits,
    goals,
    skills,
    categories,
    rules,
    ruleViolations,
    routines,
    isLoading,
    error,
    penaltyMessage,
    autoRespectMessage,
    addCategory,
    deleteCategory,
    addHabit,
    toggleHabitComplete,
    deleteHabit,
    addGoal,
    toggleGoalComplete,
    toggleMilestone,
    addMilestone,
    deleteGoal,
    deleteMilestone,
    addSkill,
    updateSkill,
    deleteSkill,
    addRule,
    toggleRuleCheck,
    toggleRuleActive,
    deleteRule,
    getRuleViolations,
    deleteRuleViolation,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    addQuestToRoutine,
    removeQuestFromRoutine
  } = useSupabaseData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-400 border-r-purple-400 mx-auto"></div>
          </div>
          <div className="space-y-2">
            <p className="text-blue-300 text-lg font-medium">Initializing Hunter System...</p>
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full bg-black/40 backdrop-blur-md border border-red-500/30 p-8 rounded-2xl shadow-2xl">
          <div className="text-red-400 text-2xl font-bold mb-4">System Error</div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-gray-300 text-sm font-mono break-all">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg uppercase tracking-wider text-sm"
          >
            Reset System
          </button>
        </div>
      </div>
    );
  }
  const completedToday = habits.filter(habit =>
    habit.completedDates.includes(getLocalDateString())
  ).length;
  const totalStreak = habits.reduce((sum, habit) => sum + habit.streak, 0);
  const totalPoints = categories.reduce((sum, category) => sum + category.points, 0);

  const handleDismissPenaltyMessage = () => {
    setDismissedPenaltyMessage(true);
  };

  const handleDismissAutoRespectMessage = () => {
    setDismissedAutoRespectMessage(true);
  };

  const handleGuildClick = () => {
    const currentRank = getRankFromPoints(totalPoints).rank;
    if (currentRank === 'E' || currentRank === 'D') {
      setLimitModalConfig({ isOpen: true, type: 'RANK_GATE' });
    } else {
      window.open('https://whop.com/arise-zrt', '_blank');
    }
  };

  const handleViewChange = (view: any) => {
    if (view === 'leaderboard') {
      const currentRank = getRankFromPoints(totalPoints).rank;
      if (currentRank === 'E' || currentRank === 'D') {
        setLimitModalConfig({ isOpen: true, type: 'LEADERBOARD' });
        return;
      }
    }
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'habits':
        return (
          <HabitsView
            habits={habits}
            categories={categories}
            routines={routines}
            onAddHabit={addHabit}
            onToggleComplete={toggleHabitComplete}
            onDeleteHabit={deleteHabit}
            onAddRoutine={addRoutine}
            onUpdateRoutine={updateRoutine}
            onDeleteRoutine={deleteRoutine}
            onAddQuestToRoutine={addQuestToRoutine}
            onRemoveQuestFromRoutine={removeQuestFromRoutine}
            totalPoints={totalPoints}
          />
        );
      case 'goals':
        return (
          <GoalsView
            goals={goals}
            categories={categories}
            onAddGoal={addGoal}
            onToggleGoalComplete={toggleGoalComplete}
            onToggleMilestone={toggleMilestone}
            onDeleteGoal={deleteGoal}
            onAddMilestone={addMilestone}
            onDeleteMilestone={deleteMilestone}
          />
        );
      case 'skills':
        return (
          <SkillsView
            skills={skills}
            categories={categories}
            goals={goals}
            onAddSkill={addSkill}
            onUpdateSkill={updateSkill}
            onDeleteSkill={deleteSkill}
          />
        );
      case 'rules':
        return (
          <RulesView
            rules={rules}
            categories={categories}
            ruleViolations={ruleViolations}
            onAddRule={addRule}
            onToggleRuleCheck={toggleRuleCheck}
            onDeleteRule={deleteRule}
            onDeleteViolation={deleteRuleViolation}
            onToggleRuleActive={toggleRuleActive}
            getRuleViolations={getRuleViolations}
          />
        );
      case 'analytics':
        return (
          <AnalyticsView
            habits={habits}
            goals={goals}
            categories={categories}
            ruleViolations={ruleViolations}
          />
        );
      case 'leaderboard':
        return (
          <LeaderboardView />
        );
      case 'settings':
        return (
          <SettingsView
            categories={categories}
            onAddCategory={addCategory}
            onDeleteCategory={deleteCategory}
          />
        );
      default:
        return null;
    }
  };

  const PageLoader = () => (
    <div className="flex justify-center items-center py-20">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <AuthWrapper>
      {/* Voiceflow Chatbot - only active after login/signup */}
      <VoiceflowWidget />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar */}
          <div className="flex justify-between items-center pt-4 pb-2">
            {/* Friends Icon */}
            <button
              onClick={() => setShowFriendsModal(true)}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-all"></div>
              <div className="relative flex items-center gap-2 bg-black/60 backdrop-blur-sm border border-blue-500/30 rounded-xl px-4 py-3 text-white hover:border-blue-400/50 transition-all">
                <Users size={20} className="text-blue-400" />
                <span className="hidden sm:inline font-medium tracking-wide">Friends</span>
              </div>
            </button>

            {/* User Menu */}
            <UserMenu />
          </div>

          <Header
            totalHabits={habits.length}
            completedToday={completedToday}
            totalStreak={totalStreak}
            totalPoints={totalPoints}
            penaltyMessage={dismissedPenaltyMessage ? undefined : penaltyMessage}
            autoRespectMessage={dismissedAutoRespectMessage ? undefined : autoRespectMessage}
            onDismissPenaltyMessage={handleDismissPenaltyMessage}
            onDismissAutoRespectMessage={handleDismissAutoRespectMessage}
          />

          <Navigation
            currentView={currentView}
            onViewChange={handleViewChange}
            onGuildClick={handleGuildClick}
          />

          <main className="pb-8">
            <Suspense fallback={<PageLoader />}>
              {renderCurrentView()}
            </Suspense>
          </main>

          {/* Friends Modal */}
          <FriendsModal
            isOpen={showFriendsModal}
            onClose={() => setShowFriendsModal(false)}
          />

          {/* Limit Modal */}
          <LimitModal
            isOpen={limitModalConfig.isOpen}
            onClose={() => setLimitModalConfig({ ...limitModalConfig, isOpen: false })}
            type={limitModalConfig.type}
          />
        </div>
      </div>
    </AuthWrapper>
  );
}

export default App;