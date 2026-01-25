import { useState } from 'react';
import { AuthWrapper } from './components/AuthWrapper';
import { UserMenu } from './components/UserMenu';
import FriendsModal from './components/FriendsModal';
import Header from './components/Header';
import { Navigation } from './components/Navigation';
import { HabitsView } from './components/HabitsView';
import { GoalsView } from './components/GoalsView';
import { AnalyticsView } from './components/AnalyticsView';
import { SkillsView } from './components/SkillsView';
import { SettingsView } from './components/SettingsView';
import { RulesView } from './components/RulesView';
import { LeaderboardView } from './components/LeaderboardView';
import { useSupabaseData } from './hooks/useSupabaseData';
import { getLocalDateString } from './utils/dateUtils';
import { Users } from 'lucide-react';

type ViewType = 'habits' | 'goals' | 'skills' | 'rules' | 'analytics' | 'leaderboard' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('habits');
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [dismissedPenaltyMessage, setDismissedPenaltyMessage] = useState(false);
  const [dismissedAutoRespectMessage, setDismissedAutoRespectMessage] = useState(false);

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl font-bold mb-4">Error Loading Data</div>
          <p className="text-gray-400">{error}</p>
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

  return (
    <AuthWrapper>
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
            onViewChange={setCurrentView}
          />

          <main className="pb-8">
            {renderCurrentView()}
          </main>

          {/* Friends Modal */}
          <FriendsModal
            isOpen={showFriendsModal}
            onClose={() => setShowFriendsModal(false)}
          />
        </div>
      </div>
    </AuthWrapper>
  );
}

export default App;