import React, { useState } from 'react';
import { Database, Upload, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import { loadHabits } from '../utils/storage';
import { loadCategories as loadCategoriesFromStorage } from '../utils/categoryStorage';
import { loadGoals as loadGoalsFromStorage } from '../utils/goalStorage';
import { Skill } from '../types/skill';
import * as db from '../lib/database';

interface DataMigrationProps {
  onMigrationComplete: () => void;
}

export const DataMigration: React.FC<DataMigrationProps> = ({ onMigrationComplete }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<{
    hasLocalData: boolean;
    categories: number;
    habits: number;
    goals: number;
    skills: number;
  } | null>(null);
  const [migrationResult, setMigrationResult] = useState<string | null>(null);

  // Load skills from localStorage
  const loadSkillsFromStorage = (): Skill[] => {
    try {
      const stored = localStorage.getItem('arise-skills');
      if (!stored) return [];
      
      const skills = JSON.parse(stored);
      return skills.map((skill: any) => ({
        ...skill,
        startDate: new Date(skill.startDate),
        completedDate: skill.completedDate ? new Date(skill.completedDate) : undefined,
        createdAt: new Date(skill.createdAt)
      }));
    } catch (error) {
      console.error('Failed to load skills from localStorage:', error);
      return [];
    }
  };

  const checkLocalData = () => {
    setIsChecking(true);
    
    try {
      const localHabits = loadHabits();
      const localCategories = loadCategoriesFromStorage();
      const localGoals = loadGoalsFromStorage();
      const localSkills = loadSkillsFromStorage();
      
      const hasData = localHabits.length > 0 || localCategories.length > 0 || localGoals.length > 0 || localSkills.length > 0;
      
      setMigrationStatus({
        hasLocalData: hasData,
        categories: localCategories.length,
        habits: localHabits.length,
        goals: localGoals.length,
        skills: localSkills.length
      });
    } catch (error) {
      console.error('Error checking local data:', error);
      setMigrationResult('Error checking local data');
    } finally {
      setIsChecking(false);
    }
  };

  const migrateData = async () => {
    if (!migrationStatus?.hasLocalData) return;
    
    setIsMigrating(true);
    setMigrationResult(null);
    
    try {
      const localHabits = loadHabits();
      const localCategories = loadCategoriesFromStorage();
      const localGoals = loadGoalsFromStorage();
      const localSkills = loadSkillsFromStorage();
      
      let migratedCount = 0;
      
      // Migrate categories first
      for (const category of localCategories) {
        await db.createCategory({
          name: category.name,
          color: category.color
        });
        
        // Update points if any
        if (category.points > 0) {
          const categoryId = await db.findCategoryIdByName(category.name);
          if (categoryId) {
            await db.updateCategoryPoints(categoryId, category.points);
          }
        }
        migratedCount++;
      }
      
      // Migrate habits
      for (const habit of localHabits) {
        await db.createHabit({
          name: habit.name,
          category: habit.category,
          color: habit.color
        });
        
        // Update habit with completion data
        const createdHabit = await db.fetchHabits();
        const newHabit = createdHabit.find(h => h.name === habit.name);
        if (newHabit) {
          await db.updateHabit(newHabit.id, {
            completedDates: habit.completedDates,
            streak: habit.streak,
            bestStreak: habit.bestStreak
          });
        }
        migratedCount++;
      }
      
      // Migrate goals
      for (const goal of localGoals) {
        await db.createGoal({
          title: goal.title,
          category: goal.category,
          color: goal.color,
          targetDate: goal.targetDate,
          priority: goal.priority,
          milestones: goal.milestones.map(m => ({
            title: m.title,
            targetDate: m.targetDate
          }))
        });
        migratedCount++;
      }
      
      // Migrate skills
      for (const skill of localSkills) {
        await db.createSkill({
          name: skill.name,
          category: skill.category,
          level: skill.level,
          status: skill.status,
          description: skill.description,
          startDate: skill.startDate,
          resources: skill.resources,
          color: skill.color
        });
        
        // Update skill with additional data
        const createdSkills = await db.fetchSkills();
        const newSkill = createdSkills.find(s => s.name === skill.name && s.category === skill.category);
        if (newSkill) {
          await db.updateSkill(newSkill.id, {
            progress: skill.progress,
            totalLearningTime: skill.totalLearningTime,
            isTimerActive: skill.isTimerActive,
            lastTimerStart: skill.lastTimerStart,
            completedDate: skill.completedDate
          });
        }
        migratedCount++;
      }
      
      setMigrationResult(`Successfully migrated ${migratedCount} items to Supabase!`);
      
      // Clear local storage after successful migration
      localStorage.removeItem('arise-habits');
      localStorage.removeItem('arise-categories');
      localStorage.removeItem('arise-goals');
      localStorage.removeItem('arise-skills');
      
      setTimeout(() => {
        onMigrationComplete();
      }, 2000);
      
    } catch (error) {
      console.error('Migration error:', error);
      setMigrationResult('Migration failed. Please try again.');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Database className="text-blue-400" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Data Migration</h2>
          <p className="text-gray-400">
            Migrate your local data to Supabase for cross-device sync
          </p>
        </div>

        {!migrationStatus && (
          <div className="space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <AlertTriangle size={18} />
                <span className="font-semibold">Check Local Data</span>
              </div>
              <p className="text-sm text-gray-300">
                We'll check if you have any existing data stored locally that needs to be migrated.
              </p>
            </div>
            
            <button
              onClick={checkLocalData}
              disabled={isChecking}
              className="w-full bg-blue-500 hover:bg-blue-400 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isChecking ? 'Checking...' : 'Check Local Data'}
            </button>
          </div>
        )}

        {migrationStatus && !migrationResult && (
          <div className="space-y-4">
            {migrationStatus.hasLocalData ? (
              <>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <CheckCircle size={18} />
                    <span className="font-semibold">Local Data Found</span>
                  </div>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>Categories: {migrationStatus.categories}</p>
                    <p>Habits: {migrationStatus.habits}</p>
                    <p>Goals: {migrationStatus.goals}</p>
                    <p>Skills: {migrationStatus.skills}</p>
                  </div>
                </div>
                
                <button
                  onClick={migrateData}
                  disabled={isMigrating}
                  className="w-full bg-green-500 hover:bg-green-400 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isMigrating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Migrating...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Migrate to Supabase
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                <p className="text-gray-300 mb-4">No local data found to migrate.</p>
                <button
                  onClick={onMigrationComplete}
                  className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        )}

        {migrationResult && (
          <div className="text-center">
            <div className={`p-4 rounded-lg mb-4 ${
              migrationResult.includes('Successfully') 
                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
              <p>{migrationResult}</p>
            </div>
            
            {migrationResult.includes('Successfully') && (
              <p className="text-sm text-gray-400">
                Redirecting to your synced data...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};