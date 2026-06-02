import { useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { Habit, HabitFormData } from '../types/habit';
import { Goal, GoalFormData, Milestone } from '../types/goal';
import { Skill, SkillFormData } from '../types/skill';
import { Category, CategoryFormData } from '../types/category';
import { Rule, RuleFormData, RuleViolation } from '../types/rule';
import { Routine, RoutineFormData } from '../types/routine';
import * as db from '../lib/database';
import * as routinesApi from '../lib/routines';
import { calculateStreak } from '../utils/habitUtils';
import { calculateGoalProgress } from '../utils/dateUtils';
import { getLocalDateString } from '../utils/dateUtils';
import { checkAndApplyPenaltiesOnAppOpen, getLatestPenaltyMessage } from '../utils/questPenalty';
import { checkAndUpdateRuleRespect, getAutoRespectMessage } from '../utils/ruleAutoRespect';

const STALE_TIME = 5 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  lastFetched: number;
}

interface DataCache {
  habits: CacheEntry<Habit[]> | null;
  goals: CacheEntry<Goal[]> | null;
  skills: CacheEntry<Skill[]> | null;
  categories: CacheEntry<Category[]> | null;
  rules: CacheEntry<Rule[]> | null;
  ruleViolations: CacheEntry<RuleViolation[]> | null;
  routines: CacheEntry<Routine[]> | null;
}

export const useSupabaseData = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [ruleViolations, setRuleViolations] = useState<RuleViolation[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [staminaSpent, setStaminaSpent] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [penaltyMessage, setPenaltyMessage] = useState<string>('');
  const [autoRespectMessage, setAutoRespectMessage] = useState<string>('');

  const cacheRef = useRef<DataCache>({
    habits: null,
    goals: null,
    skills: null,
    categories: null,
    rules: null,
    ruleViolations: null,
    routines: null
  });

  const shouldFetch = (cacheEntry: CacheEntry<any> | null): boolean => {
    if (!cacheEntry) return true;
    const now = Date.now();
    return (now - cacheEntry.lastFetched) > STALE_TIME;
  };

  const updateCache = <T>(key: keyof DataCache, data: T): void => {
    cacheRef.current[key] = {
      data,
      lastFetched: Date.now()
    } as any;
  };

  const invalidateCache = (key: keyof DataCache): void => {
    cacheRef.current[key] = null;
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    } else {
      // Clear data when user logs out
      setHabits([]);
      setGoals([]);
      setSkills([]);
      setCategories([]);
      setRules([]);
      setRuleViolations([]);
      setRoutines([]);
      cacheRef.current = {
        habits: null,
        goals: null,
        skills: null,
        categories: null,
        rules: null,
        ruleViolations: null,
        routines: null
      };
      setIsLoading(false);
    }
  }, [user?.id]);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let categoriesData: Category[];
      if (shouldFetch(cacheRef.current.categories)) {
        categoriesData = await db.fetchCategories();
        updateCache('categories', categoriesData);
      } else {
        categoriesData = cacheRef.current.categories!.data;
      }
      setCategories(categoriesData);

      let habitsData: Habit[];
      if (shouldFetch(cacheRef.current.habits)) {
        habitsData = await db.fetchHabits();
        updateCache('habits', habitsData);
      } else {
        habitsData = cacheRef.current.habits!.data;
      }
      setHabits(habitsData);

      let goalsData: Goal[];
      if (shouldFetch(cacheRef.current.goals)) {
        goalsData = await db.fetchGoals();
        updateCache('goals', goalsData);
      } else {
        goalsData = cacheRef.current.goals!.data;
      }
      setGoals(goalsData);

      try {
        let skillsData: Skill[];
        if (shouldFetch(cacheRef.current.skills)) {
          skillsData = await db.fetchSkills();
          updateCache('skills', skillsData);
        } else {
          skillsData = cacheRef.current.skills!.data;
        }
        setSkills(skillsData);
      } catch (skillsError) {
        setSkills([]);
      }

      try {
        let rulesData: Rule[];
        let violationsData: RuleViolation[];

        if (shouldFetch(cacheRef.current.rules)) {
          rulesData = await db.fetchRules();
          updateCache('rules', rulesData);
        } else {
          rulesData = cacheRef.current.rules!.data;
        }

        if (shouldFetch(cacheRef.current.ruleViolations)) {
          violationsData = await db.fetchRuleViolations();
          updateCache('ruleViolations', violationsData);
        } else {
          violationsData = cacheRef.current.ruleViolations!.data;
        }

        setRules(rulesData);
        setRuleViolations(violationsData);
      } catch (rulesError) {
        setRules([]);
        setRuleViolations([]);
      }

      try {
        let routinesData: Routine[];
        if (shouldFetch(cacheRef.current.routines)) {
          routinesData = await routinesApi.fetchRoutines();
          updateCache('routines', routinesData);
        } else {
          routinesData = cacheRef.current.routines!.data;
        }
        setRoutines(routinesData);
      } catch (routinesError) {
        console.error('Error loading routines:', routinesError);
        setRoutines([]);
      }

      try {
        const stats = await db.fetchUserStats();
        const today = getLocalDateString();
        if (stats && stats.lastStaminaDate === today) {
          setStaminaSpent(stats.staminaSpent);
        } else {
          setStaminaSpent(0);
        }
      } catch (statsError) {
        console.error('Error loading user stats:', statsError);
        setStaminaSpent(0);
      }

      // Automatically apply penalties when loading data - this runs on every app open/login
      const penaltyResult = await checkAndApplyPenaltiesOnAppOpen();
      const penaltyMsg = await getLatestPenaltyMessage();
      setPenaltyMessage(penaltyResult || penaltyMsg);

      // Also refresh categories after penalties are applied to show updated points
      if (penaltyResult && penaltyResult.includes('Applied')) {
        // Invalidate and reload categories to show updated points
        invalidateCache('categories');
        const updatedCategories = await db.fetchCategories();
        setCategories(updatedCategories);
        updateCache('categories', updatedCategories);
      }

      if (shouldFetch(cacheRef.current.rules)) {
        const rulesProcessed = await checkAndUpdateRuleRespect();
        const autoMessage = getAutoRespectMessage(rulesProcessed);
        setAutoRespectMessage(autoMessage);
      }

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    cacheRef.current = {
      habits: null,
      goals: null,
      skills: null,
      categories: null,
      rules: null,
      ruleViolations: null,
      routines: null
    };
    await loadAllData();
  };

  const addCategory = async (categoryData: CategoryFormData) => {
    try {
      const newCategory = await db.createCategory(categoryData);
      setCategories(prev => [...prev, newCategory]);
      const updatedCategories = [...categories, newCategory];
      updateCache('categories', updatedCategories);
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Failed to add category');
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const categoryToDelete = categories.find(cat => cat.id === categoryId);
      if (!categoryToDelete) {
        throw new Error('Category not found');
      }

      if (categoryToDelete.name === 'General') {
        setError('The General category cannot be deleted as it serves as the default category for uncategorized items.');
        return;
      }

      const pointsToPreserve = categoryToDelete.points;

      if (pointsToPreserve > 0 && categoryToDelete.name !== 'General') {
        let generalCategory = categories.find(cat => cat.name === 'General');

        if (!generalCategory) {
          const newGeneralCategory = await db.createCategory({
            name: 'General',
            color: '#6B7280'
          });
          generalCategory = newGeneralCategory;
          setCategories(prev => [...prev, newGeneralCategory]);
        }

        await db.updateCategoryPoints(generalCategory.id, pointsToPreserve);

        setCategories(prev => prev.map(cat =>
          cat.id === generalCategory!.id
            ? { ...cat, points: cat.points + pointsToPreserve }
            : cat
        ));
      }

      await db.deleteCategory(categoryId);

      // Update active habits in database to 'General'
      const habitsToUpdate = habits.filter(h => h.category === categoryToDelete.name);
      for (const habit of habitsToUpdate) {
        await db.updateHabit(habit.id, { category: 'General' } as any);
      }

      // Update goals in database to 'General'
      const goalsToUpdate = goals.filter(g => g.category === categoryToDelete.name);
      for (const goal of goalsToUpdate) {
        await db.updateGoal(goal.id, { category: 'General' } as any);
      }

      setHabits(prev => prev.map(habit =>
        habit.category === categoryToDelete.name
          ? { ...habit, category: 'General' }
          : habit
      ));
      setGoals(prev => prev.map(goal =>
        goal.category === categoryToDelete.name
          ? { ...goal, category: 'General' }
          : goal
      ));
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    } catch (err) {
      invalidateCache('categories');
      invalidateCache('habits');
      invalidateCache('goals');
      console.error('Error deleting category:', err);
      setError('Failed to delete category');
    }
  };

  const addHabit = async (habitData: HabitFormData) => {
    try {
      const newHabit = await db.createHabit(habitData);
      setHabits(prev => [...prev, newHabit]);
      const updatedHabits = [...habits, newHabit];
      updateCache('habits', updatedHabits);
    } catch (err) {
      console.error('Error adding habit:', err);
      setError('Failed to add habit');
    }
  };

  const toggleHabitComplete = async (habitId: string) => {
    const today = getLocalDateString();
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    try {
      const isCompleted = habit.completedDates.includes(today);
      let updatedDates: string[];

      if (isCompleted) {
        updatedDates = habit.completedDates.filter(date => date !== today);
      } else {
        updatedDates = [...habit.completedDates, today];
      }

      const newStreak = calculateStreak(updatedDates);
      const newBestStreak = Math.max(habit.bestStreak, newStreak);

      const updatedHabit = {
        ...habit,
        completedDates: updatedDates,
        streak: newStreak,
        bestStreak: newBestStreak
      };

      await db.updateHabit(habitId, {
        completedDates: updatedDates,
        streak: newStreak,
        bestStreak: newBestStreak
      });

      const updatedHabits = habits.map(h => h.id === habitId ? updatedHabit : h);
      setHabits(updatedHabits);
      updateCache('habits', updatedHabits);

      const categoryName = habit.category || 'General';
      let categoryId = await db.findCategoryIdByName(categoryName);

      if (!categoryId) {
        const newCategory = await db.createCategory({
          name: categoryName,
          color: categoryName === 'General' ? '#6B7280' : '#3B82F6'
        });
        categoryId = newCategory.id;

        setCategories(prev => [...prev, newCategory]);
        invalidateCache('categories');
      }

      if (categoryId) {
        const pointsChange = isCompleted ? -1 : 1;

        if (pointsChange === -1) {
          const targetCategory = categories.find(cat => cat.name === categoryName);

          if (targetCategory && targetCategory.points === 0) {
            const generalCategory = categories.find(cat => cat.name === 'General');

            if (generalCategory && generalCategory.points > 0) {
              const generalCategoryId = await db.findCategoryIdByName('General');
              if (generalCategoryId) {
                await db.updateCategoryPoints(generalCategoryId, pointsChange);

                setCategories(prev => {
                  const updated = prev.map(cat =>
                    cat.name === 'General'
                      ? { ...cat, points: Math.max(0, cat.points + pointsChange) }
                      : cat
                  );
                  updateCache('categories', updated);
                  return updated;
                });
              }
            }
          } else {
            await db.updateCategoryPoints(categoryId, pointsChange);

            setCategories(prev => {
              const updated = prev.map(cat =>
                cat.name === categoryName
                  ? { ...cat, points: Math.max(0, cat.points + pointsChange) }
                  : cat
              );
              updateCache('categories', updated);
              return updated;
            });
          }
        } else {
          await db.updateCategoryPoints(categoryId, pointsChange);

          setCategories(prev => {
            const updated = prev.map(cat =>
              cat.name === categoryName
                ? { ...cat, points: Math.max(0, cat.points + pointsChange) }
                : cat
            );
            updateCache('categories', updated);
            return updated;
          });
        }
      }
    } catch (err) {
      console.error('Error toggling habit:', err);
      setError('Failed to update habit');
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      await db.deleteHabit(habitId);
      const updatedHabits = habits.filter(h => h.id !== habitId);
      setHabits(updatedHabits);
      updateCache('habits', updatedHabits);
    } catch (err) {
      console.error('Error deleting habit:', err);
      setError('Failed to delete habit');
    }
  };

  const addGoal = async (goalData: GoalFormData) => {
    try {
      const newGoal = await db.createGoal(goalData);
      const updatedGoals = [...goals, newGoal];
      setGoals(updatedGoals);
      updateCache('goals', updatedGoals);
    } catch (err) {
      console.error('Error adding goal:', err);
      setError('Failed to add goal');
    }
  };

  const toggleGoalComplete = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    try {
      const newCompleted = !goal.isCompleted;
      const updatedGoal = {
        ...goal,
        isCompleted: newCompleted,
        completedDate: newCompleted ? new Date() : undefined,
        progress: newCompleted ? 100 : calculateGoalProgress(goal)
      };

      await db.updateGoal(goalId, {
        isCompleted: newCompleted,
        completedDate: newCompleted ? new Date() : undefined,
        progress: updatedGoal.progress
      });

      const updatedGoals = goals.map(g => g.id === goalId ? updatedGoal : g);
      setGoals(updatedGoals);
      updateCache('goals', updatedGoals);
    } catch (err) {
      console.error('Error toggling goal:', err);
      setError('Failed to update goal');
    }
  };

  const toggleMilestone = async (goalId: string, milestoneId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    try {
      const milestone = goal.milestones.find(m => m.id === milestoneId);
      if (!milestone) return;

      const newCompleted = !milestone.isCompleted;

      await db.updateMilestone(milestoneId, {
        isCompleted: newCompleted,
        completedDate: newCompleted ? new Date() : undefined
      });

      const updatedMilestones = goal.milestones.map(m =>
        m.id === milestoneId
          ? { ...m, isCompleted: newCompleted, completedDate: newCompleted ? new Date() : undefined }
          : m
      );

      const updatedGoal = {
        ...goal,
        milestones: updatedMilestones,
        progress: calculateGoalProgress({ ...goal, milestones: updatedMilestones })
      };

      await db.updateGoal(goalId, { progress: updatedGoal.progress });

      const updatedGoals = goals.map(g => g.id === goalId ? updatedGoal : g);
      setGoals(updatedGoals);
      updateCache('goals', updatedGoals);
    } catch (err) {
      console.error('Error toggling milestone:', err);
      setError('Failed to update milestone');
    }
  };

  const addMilestone = async (goalId: string, milestoneData: Omit<Milestone, 'id' | 'isCompleted' | 'completedDate'>) => {
    try {
      const newMilestone = await db.createMilestone(goalId, milestoneData);

      const updatedGoals = goals.map(goal => {
        if (goal.id === goalId) {
          const updatedMilestones = [...goal.milestones, newMilestone];
          const updatedGoal = {
            ...goal,
            milestones: updatedMilestones,
            progress: calculateGoalProgress({ ...goal, milestones: updatedMilestones })
          };

          db.updateGoal(goalId, { progress: updatedGoal.progress });

          return updatedGoal;
        }
        return goal;
      });
      setGoals(updatedGoals);
      updateCache('goals', updatedGoals);
    } catch (err) {
      console.error('Error adding milestone:', err);
      setError('Failed to add milestone');
    }
  };

  const deleteMilestone = async (goalId: string, milestoneId: string) => {
    try {
      await db.deleteMilestone(milestoneId);

      const updatedGoals = goals.map(goal => {
        if (goal.id === goalId) {
          const updatedMilestones = goal.milestones.filter(m => m.id !== milestoneId);
          const updatedGoal = {
            ...goal,
            milestones: updatedMilestones,
            progress: calculateGoalProgress({ ...goal, milestones: updatedMilestones })
          };

          db.updateGoal(goalId, { progress: updatedGoal.progress });

          return updatedGoal;
        }
        return goal;
      });
      setGoals(updatedGoals);
      updateCache('goals', updatedGoals);
    } catch (err) {
      console.error('Error deleting milestone:', err);
      setError('Failed to delete milestone');
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      await db.deleteGoal(goalId);
      const updatedGoals = goals.filter(goal => goal.id !== goalId);
      setGoals(updatedGoals);
      updateCache('goals', updatedGoals);
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError('Failed to delete goal');
    }
  };

  const addSkill = async (skillData: SkillFormData) => {
    try {
      const newSkill = await db.createSkill(skillData);
      const updatedSkills = [...skills, newSkill];
      setSkills(updatedSkills);
      updateCache('skills', updatedSkills);
    } catch (err: any) {
      console.error('Error adding skill:', err);
      const errorMsg = err.message || err.error_description || (typeof err === 'string' ? err : JSON.stringify(err));
      setError(`Failed to add skill: ${errorMsg}`);
    }
  };

  const updateSkill = async (skillId: string, updates: Partial<Skill>) => {
    try {
      await db.updateSkill(skillId, updates);
      const updatedSkills = skills.map(skill =>
        skill.id === skillId ? { ...skill, ...updates } : skill
      );
      setSkills(updatedSkills);
      updateCache('skills', updatedSkills);
    } catch (err) {
      console.error('Error updating skill:', err);
      setError('Failed to update skill');
    }
  };

  const deleteSkill = async (skillId: string) => {
    try {
      await db.deleteSkill(skillId);
      const updatedSkills = skills.filter(skill => skill.id !== skillId);
      setSkills(updatedSkills);
      updateCache('skills', updatedSkills);
    } catch (err) {
      console.error('Error deleting skill:', err);
      setError('Failed to delete skill');
    }
  };

  const addRule = async (ruleData: RuleFormData) => {
    try {
      const newRule = await db.createRule(ruleData);
      const updatedRules = [...rules, newRule];
      setRules(updatedRules);
      updateCache('rules', updatedRules);
    } catch (err) {
      console.error('Error adding rule:', err);
      setError('Failed to add rule');
    }
  };

  const toggleRuleCheck = async (ruleId: string, respected: boolean, violationData?: { reason: string; preventionPlan: string }) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    try {
      await db.createRuleDailyCheck(ruleId, respected);

      if (!respected && violationData) {
        const newViolation = await db.createRuleViolation(ruleId, violationData);
        const updatedViolations = [newViolation, ...ruleViolations];
        setRuleViolations(updatedViolations);
        updateCache('ruleViolations', updatedViolations);
      }

      const newTotalDays = rule.totalDaysChecked + 1;
      const newRespected = respected ? rule.daysRespected + 1 : rule.daysRespected;
      const newViolated = !respected ? rule.daysViolated + 1 : rule.daysViolated;

      let newStreak = rule.currentStreak;
      if (respected) {
        newStreak += 1;
      } else {
        newStreak = 0;
      }

      const newBestStreak = Math.max(rule.bestStreak, newStreak);

      const updatedRule = {
        ...rule,
        totalDaysChecked: newTotalDays,
        daysRespected: newRespected,
        daysViolated: newViolated,
        currentStreak: newStreak,
        bestStreak: newBestStreak
      };

      await db.updateRule(ruleId, {
        totalDaysChecked: newTotalDays,
        daysRespected: newRespected,
        daysViolated: newViolated,
        currentStreak: newStreak,
        bestStreak: newBestStreak
      });

      const updatedRules = rules.map(r => r.id === ruleId ? updatedRule : r);
      setRules(updatedRules);
      updateCache('rules', updatedRules);
    } catch (err) {
      console.error('Error updating rule check:', err);
      setError('Failed to update rule');
    }
  };

  const toggleRuleActive = async (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    try {
      const newActive = !rule.isActive;
      await db.updateRule(ruleId, { isActive: newActive });

      const updatedRules = rules.map(r =>
        r.id === ruleId ? { ...r, isActive: newActive } : r
      );
      setRules(updatedRules);
      updateCache('rules', updatedRules);
    } catch (err) {
      console.error('Error toggling rule active:', err);
      setError('Failed to update rule');
    }
  };

  const deleteRule = async (ruleId: string) => {
    try {
      await db.deleteRule(ruleId);
      const updatedRules = rules.filter(rule => rule.id !== ruleId);
      const updatedViolations = ruleViolations.filter(violation => violation.ruleId !== ruleId);
      setRules(updatedRules);
      setRuleViolations(updatedViolations);
      updateCache('rules', updatedRules);
      updateCache('ruleViolations', updatedViolations);
    } catch (err) {
      console.error('Error deleting rule:', err);
      setError('Failed to delete rule');
    }
  };

  const getRuleViolations = (ruleId: string): RuleViolation[] => {
    return ruleViolations.filter(violation => violation.ruleId === ruleId);
  };

  const deleteRuleViolation = async (violationId: string) => {
    try {
      await db.deleteRuleViolation(violationId);
      const updatedViolations = ruleViolations.filter(v => v.id !== violationId);
      setRuleViolations(updatedViolations);
      updateCache('ruleViolations', updatedViolations);
    } catch (err) {
      console.error('Error deleting rule violation:', err);
      setError('Failed to delete rule violation');
    }
  };

  const addRoutine = async (routineData: RoutineFormData) => {
    try {
      const newRoutine = await routinesApi.createRoutine(routineData);
      const updatedRoutines = [...routines, newRoutine];
      setRoutines(updatedRoutines);
      updateCache('routines', updatedRoutines);
    } catch (err) {
      console.error('Error adding routine:', err);
      setError('Failed to add routine');
    }
  };

  const updateRoutine = async (routineId: string, updates: Partial<RoutineFormData>) => {
    try {
      await routinesApi.updateRoutine(routineId, updates);
      const updatedRoutines = routines.map(routine =>
        routine.id === routineId ? { ...routine, ...updates } : routine
      );
      setRoutines(updatedRoutines);
      updateCache('routines', updatedRoutines);
    } catch (err) {
      console.error('Error updating routine:', err);
      setError('Failed to update routine');
    }
  };

  const deleteRoutine = async (routineId: string) => {
    try {
      await routinesApi.deleteRoutine(routineId);
      const updatedRoutines = routines.filter(routine => routine.id !== routineId);
      setRoutines(updatedRoutines);
      updateCache('routines', updatedRoutines);
    } catch (err) {
      console.error('Error deleting routine:', err);
      setError('Failed to delete routine');
    }
  };

  const addQuestToRoutine = async (routineId: string, habitId: string) => {
    try {
      const routine = routines.find(r => r.id === routineId);
      if (!routine) return;

      const updatedHabitIds = [...routine.habitIds, habitId];

      await routinesApi.updateRoutine(routineId, { habitIds: updatedHabitIds });

      const updatedRoutines = routines.map(r =>
        r.id === routineId ? { ...r, habitIds: updatedHabitIds } : r
      );
      setRoutines(updatedRoutines);
      updateCache('routines', updatedRoutines);
    } catch (err) {
      console.error('Error adding quest to routine:', err);
      setError('Failed to add quest to routine');
    }
  };

  const removeQuestFromRoutine = async (routineId: string, habitId: string) => {
    try {
      const routine = routines.find(r => r.id === routineId);
      if (!routine) return;

      const updatedHabitIds = routine.habitIds.filter(id => id !== habitId);

      await routinesApi.updateRoutine(routineId, { habitIds: updatedHabitIds });

      const updatedRoutines = routines.map(r =>
        r.id === routineId ? { ...r, habitIds: updatedHabitIds } : r
      );
      setRoutines(updatedRoutines);
      updateCache('routines', updatedRoutines);
    } catch (err) {
      console.error('Error removing quest from routine:', err);
      setError('Failed to remove quest from routine');
    }
  };

  const consumeStamina = async () => {
    const today = getLocalDateString();
    const newStamina = staminaSpent + 1;
    setStaminaSpent(newStamina);
    try {
      await db.updateUserStamina(today, newStamina);
    } catch (err) {
      console.error('Error updating stamina in db:', err);
      // Revert if failed
      setStaminaSpent(staminaSpent);
    }
  };

  return {
    habits,
    goals,
    skills,
    categories,
    rules,
    ruleViolations,
    routines,
    staminaSpent,
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
    removeQuestFromRoutine,
    consumeStamina,
    refreshData
  };
};