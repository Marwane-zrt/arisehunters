import { supabase } from './supabase';
import { getLocalDateString } from '../utils/dateUtils';
import { Habit, HabitFormData } from '../types/habit';
import { Goal, GoalFormData, Milestone } from '../types/goal';
import { Skill, SkillFormData } from '../types/skill';
import { Category, CategoryFormData } from '../types/category';
import { Rule, RuleFormData, RuleViolation, RuleViolationFormData, RuleDailyCheck } from '../types/rule';
import { UserStats } from '../types/userStats';

// Categories
export const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return data.map(item => ({
    id: item.id,
    name: item.name,
    color: item.color,
    points: item.points,
    createdAt: new Date(item.created_at)
  }));
};

export const createCategory = async (categoryData: CategoryFormData): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: categoryData.name,
      color: categoryData.color,
      user_id: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    color: data.color,
    points: data.points,
    createdAt: new Date(data.created_at)
  };
};

export const updateCategoryPoints = async (categoryId: string, pointsChange: number): Promise<void> => {
  const { data: category, error: fetchError } = await supabase
    .from('categories')
    .select('points')
    .eq('id', categoryId)
    .single();

  if (fetchError) {
    console.error('Error fetching category points:', fetchError);
    throw fetchError;
  }

  const newPoints = Math.max(0, category.points + pointsChange);

  const { error } = await supabase
    .from('categories')
    .update({ points: newPoints })
    .eq('id', categoryId);

  if (error) {
    console.error('Error updating category points:', error);
    throw error;
  }
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId);

  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Habits
export const fetchHabits = async (): Promise<Habit[]> => {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching habits:', error);
    throw error;
  }

  return data.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    color: item.color,
    completedDates: item.completed_dates || [],
    streak: item.streak,
    bestStreak: item.best_streak,
    createdAt: new Date(item.created_at)
  }));
};

export const createHabit = async (habitData: HabitFormData): Promise<Habit> => {
  const { data, error } = await supabase
    .from('habits')
    .insert({
      name: habitData.name,
      category: habitData.category,
      color: habitData.color,
      user_id: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating habit:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    color: data.color,
    completedDates: data.completed_dates || [],
    streak: data.streak,
    bestStreak: data.best_streak,
    createdAt: new Date(data.created_at)
  };
};

export const updateHabit = async (habitId: string, updates: Partial<Habit>): Promise<void> => {
  const updateData: any = {};

  if (updates.completedDates !== undefined) updateData.completed_dates = updates.completedDates;
  if (updates.streak !== undefined) updateData.streak = updates.streak;
  if (updates.bestStreak !== undefined) updateData.best_streak = updates.bestStreak;

  const { error } = await supabase
    .from('habits')
    .update(updateData)
    .eq('id', habitId);

  if (error) {
    console.error('Error updating habit:', error);
    throw error;
  }
};

export const deleteHabit = async (habitId: string): Promise<void> => {
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', habitId);

  if (error) {
    console.error('Error deleting habit:', error);
    throw error;
  }
};

// Goals
export const fetchGoals = async (): Promise<Goal[]> => {
  const { data: goalsData, error: goalsError } = await supabase
    .from('goals')
    .select('*')
    .order('created_at', { ascending: true });

  if (goalsError) {
    console.error('Error fetching goals:', goalsError);
    throw goalsError;
  }

  const { data: milestonesData, error: milestonesError } = await supabase
    .from('milestones')
    .select('*')
    .order('created_at', { ascending: true });

  if (milestonesError) {
    console.error('Error fetching milestones:', milestonesError);
    throw milestonesError;
  }

  return goalsData.map(goal => ({
    id: goal.id,
    title: goal.title,
    category: goal.category,
    color: goal.color,
    targetDate: new Date(goal.target_date),
    priority: goal.priority as 'low' | 'medium' | 'high',
    isCompleted: goal.is_completed,
    completedDate: goal.completed_date ? new Date(goal.completed_date) : undefined,
    progress: goal.progress,
    createdAt: new Date(goal.created_at),
    milestones: milestonesData
      .filter(milestone => milestone.goal_id === goal.id)
      .map(milestone => ({
        id: milestone.id,
        title: milestone.title,
        targetDate: new Date(milestone.target_date),
        isCompleted: milestone.is_completed,
        completedDate: milestone.completed_date ? new Date(milestone.completed_date) : undefined
      }))
  }));
};

export const createGoal = async (goalData: GoalFormData): Promise<Goal> => {
  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .insert({
      title: goalData.title,
      category: goalData.category,
      color: goalData.color,
      target_date: getLocalDateString(goalData.targetDate),
      priority: goalData.priority,
      user_id: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (goalError) {
    console.error('Error creating goal:', goalError);
    throw goalError;
  }

  // Create milestones
  const milestones: Milestone[] = [];
  if (goalData.milestones.length > 0) {
    const { data: milestonesData, error: milestonesError } = await supabase
      .from('milestones')
      .insert(
        goalData.milestones.map(milestone => ({
          goal_id: goal.id,
          title: milestone.title,
          target_date: getLocalDateString(milestone.targetDate)
        }))
      )
      .select();

    if (milestonesError) {
      console.error('Error creating milestones:', milestonesError);
      throw milestonesError;
    }

    milestones.push(...milestonesData.map(milestone => ({
      id: milestone.id,
      title: milestone.title,
      targetDate: new Date(milestone.target_date),
      isCompleted: milestone.is_completed,
      completedDate: milestone.completed_date ? new Date(milestone.completed_date) : undefined
    })));
  }

  return {
    id: goal.id,
    title: goal.title,
    category: goal.category,
    color: goal.color,
    targetDate: new Date(goal.target_date),
    priority: goal.priority as 'low' | 'medium' | 'high',
    isCompleted: goal.is_completed,
    completedDate: goal.completed_date ? new Date(goal.completed_date) : undefined,
    progress: goal.progress,
    createdAt: new Date(goal.created_at),
    milestones
  };
};

export const updateGoal = async (goalId: string, updates: Partial<Goal>): Promise<void> => {
  const updateData: any = {};

  if (updates.isCompleted !== undefined) updateData.is_completed = updates.isCompleted;
  if (updates.completedDate !== undefined) updateData.completed_date = updates.completedDate?.toISOString();
  if (updates.progress !== undefined) updateData.progress = updates.progress;

  const { error } = await supabase
    .from('goals')
    .update(updateData)
    .eq('id', goalId);

  if (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

export const deleteGoal = async (goalId: string): Promise<void> => {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId);

  if (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};

// Milestones
export const createMilestone = async (goalId: string, milestoneData: Omit<Milestone, 'id' | 'isCompleted' | 'completedDate'>): Promise<Milestone> => {
  const { data, error } = await supabase
    .from('milestones')
    .insert({
      goal_id: goalId,
      title: milestoneData.title,
      target_date: getLocalDateString(milestoneData.targetDate)
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating milestone:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    targetDate: new Date(data.target_date),
    isCompleted: data.is_completed,
    completedDate: data.completed_date ? new Date(data.completed_date) : undefined
  };
};

export const updateMilestone = async (milestoneId: string, updates: Partial<Milestone>): Promise<void> => {
  const updateData: any = {};

  if (updates.isCompleted !== undefined) updateData.is_completed = updates.isCompleted;
  if (updates.completedDate !== undefined) updateData.completed_date = updates.completedDate?.toISOString();

  const { error } = await supabase
    .from('milestones')
    .update(updateData)
    .eq('id', milestoneId);

  if (error) {
    console.error('Error updating milestone:', error);
    throw error;
  }
};

export const deleteMilestone = async (milestoneId: string): Promise<void> => {
  const { error } = await supabase
    .from('milestones')
    .delete()
    .eq('id', milestoneId);

  if (error) {
    console.error('Error deleting milestone:', error);
    throw error;
  }
};

// Helper function to find category by name and get its ID
export const findCategoryIdByName = async (categoryName: string): Promise<string | null> => {
  if (!categoryName) return null;

  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('name', categoryName)
    .maybeSingle();

  if (error || !data) return null;
  return data.id;
};

// Skills
export const fetchSkills = async (): Promise<Skill[]> => {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching skills:', error);
    throw error;
  }

  return data.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    level: item.level as 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master',
    status: item.status as 'Learning' | 'Learned' | 'Mastered',
    description: item.description,
    startDate: new Date(item.start_date),
    completedDate: item.completed_date ? new Date(item.completed_date) : undefined,
    resources: item.resources || [],
    progress: item.progress,
    color: item.color,
    linkedGoalId: item.linked_goal_id,
    createdAt: new Date(item.created_at)
  }));
};

export const createSkill = async (skillData: SkillFormData): Promise<Skill> => {
  const userResponse = await supabase.auth.getUser();
  const userId = userResponse.data.user?.id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const payload: any = {
    name: skillData.name,
    category: skillData.category || '',
    level: skillData.level,
    status: skillData.status,
    description: skillData.description || '',
    start_date: getLocalDateString(skillData.startDate),
    resources: skillData.resources || [],
    color: skillData.color,
    progress: skillData.status === 'Mastered' ? 100 : skillData.status === 'Learned' ? 100 : 0,
    user_id: userId
  };

  if (skillData.status !== 'Learning') {
    payload.completed_date = new Date().toISOString();
  }

  if (skillData.linkedGoalId) {
    payload.linked_goal_id = skillData.linkedGoalId;
  }

  const { data, error } = await supabase
    .from('skills')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error creating skill:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    level: data.level as 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master',
    status: data.status as 'Learning' | 'Learned' | 'Mastered',
    description: data.description,
    startDate: new Date(data.start_date),
    completedDate: data.completed_date ? new Date(data.completed_date) : undefined,
    resources: data.resources || [],
    progress: data.progress,
    color: data.color,
    linkedGoalId: data.linked_goal_id,
    createdAt: new Date(data.created_at)
  };
};

export const updateSkill = async (skillId: string, updates: Partial<Skill>): Promise<void> => {
  const updateData: any = {};

  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.progress !== undefined) updateData.progress = updates.progress;
  if (updates.completedDate !== undefined) updateData.completed_date = updates.completedDate?.toISOString();
  if (updates.resources !== undefined) updateData.resources = updates.resources;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.linkedGoalId !== undefined && updates.linkedGoalId !== '') {
    updateData.linked_goal_id = updates.linkedGoalId;
  } else if (updates.linkedGoalId === '') {
    // Attempting to clear the goal, safely setting it to null
    updateData.linked_goal_id = null;
  }

  const { error } = await supabase
    .from('skills')
    .update(updateData)
    .eq('id', skillId);

  if (error) {
    console.error('Error updating skill:', error);
    throw error;
  }
};

export const deleteSkill = async (skillId: string): Promise<void> => {
  const { error } = await supabase
    .from('skills')
    .delete()
    .eq('id', skillId);

  if (error) {
    console.error('Error deleting skill:', error);
    throw error;
  }
};

// Rules
export const fetchRules = async (): Promise<Rule[]> => {
  const { data, error } = await supabase
    .from('rules')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching rules:', error);
    throw error;
  }

  return data.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    color: item.color,
    category: item.category,
    isActive: item.is_active,
    totalDaysChecked: item.total_days_checked,
    daysRespected: item.days_respected,
    daysViolated: item.days_violated,
    currentStreak: item.current_streak,
    bestStreak: item.best_streak,
    createdAt: new Date(item.created_at)
  }));
};

export const createRule = async (ruleData: RuleFormData): Promise<Rule> => {
  const { data, error } = await supabase
    .from('rules')
    .insert({
      title: ruleData.title,
      description: ruleData.description,
      color: ruleData.color,
      category: ruleData.category,
      user_id: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating rule:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    color: data.color,
    category: data.category,
    isActive: data.is_active,
    totalDaysChecked: data.total_days_checked,
    daysRespected: data.days_respected,
    daysViolated: data.days_violated,
    currentStreak: data.current_streak,
    bestStreak: data.best_streak,
    createdAt: new Date(data.created_at)
  };
};

export const updateRule = async (ruleId: string, updates: Partial<Rule>): Promise<void> => {
  const updateData: any = {};

  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
  if (updates.totalDaysChecked !== undefined) updateData.total_days_checked = updates.totalDaysChecked;
  if (updates.daysRespected !== undefined) updateData.days_respected = updates.daysRespected;
  if (updates.daysViolated !== undefined) updateData.days_violated = updates.daysViolated;
  if (updates.currentStreak !== undefined) updateData.current_streak = updates.currentStreak;
  if (updates.bestStreak !== undefined) updateData.best_streak = updates.bestStreak;

  const { error } = await supabase
    .from('rules')
    .update(updateData)
    .eq('id', ruleId);

  if (error) {
    console.error('Error updating rule:', error);
    throw error;
  }
};

export const deleteRule = async (ruleId: string): Promise<void> => {
  const { error } = await supabase
    .from('rules')
    .delete()
    .eq('id', ruleId);

  if (error) {
    console.error('Error deleting rule:', error);
    throw error;
  }
};

// Rule Violations
export const fetchRuleViolations = async (ruleId?: string): Promise<RuleViolation[]> => {
  let query = supabase
    .from('rule_violations')
    .select('*')
    .order('violation_date', { ascending: false });

  if (ruleId) {
    query = query.eq('rule_id', ruleId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching rule violations:', error);
    throw error;
  }

  return data.map(item => ({
    id: item.id,
    ruleId: item.rule_id,
    violationDate: new Date(item.violation_date),
    reason: item.reason,
    preventionPlan: item.prevention_plan,
    createdAt: new Date(item.created_at)
  }));
};

export const createRuleViolation = async (ruleId: string, violationData: RuleViolationFormData): Promise<RuleViolation> => {
  const { data, error } = await supabase
    .from('rule_violations')
    .insert({
      rule_id: ruleId,
      violation_date: getLocalDateString(),
      reason: violationData.reason,
      prevention_plan: violationData.preventionPlan
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating rule violation:', error);
    throw error;
  }

  return {
    id: data.id,
    ruleId: data.rule_id,
    violationDate: new Date(data.violation_date),
    reason: data.reason,
    preventionPlan: data.prevention_plan,
    createdAt: new Date(data.created_at)
  };
};

export const deleteRuleViolation = async (violationId: string): Promise<void> => {
  const { error } = await supabase
    .from('rule_violations')
    .delete()
    .eq('id', violationId);

  if (error) {
    console.error('Error deleting rule violation:', error);
    throw error;
  }
};

// Rule Daily Checks
export const fetchRuleDailyChecks = async (ruleId?: string): Promise<RuleDailyCheck[]> => {
  let query = supabase
    .from('rule_daily_checks')
    .select('*')
    .order('check_date', { ascending: false });

  if (ruleId) {
    query = query.eq('rule_id', ruleId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching rule daily checks:', error);
    throw error;
  }

  return data.map(item => ({
    id: item.id,
    ruleId: item.rule_id,
    checkDate: new Date(item.check_date),
    respected: item.respected,
    createdAt: new Date(item.created_at)
  }));
};

export const createRuleDailyCheck = async (ruleId: string, respected: boolean): Promise<RuleDailyCheck> => {
  const today = getLocalDateString();

  // Use upsert to handle duplicate dates
  const { data, error } = await supabase
    .from('rule_daily_checks')
    .upsert({
      rule_id: ruleId,
      check_date: today,
      respected: respected
    }, {
      onConflict: 'rule_id,check_date'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating rule daily check:', error);
    throw error;
  }

  return {
    id: data.id,
    ruleId: data.rule_id,
    checkDate: new Date(data.check_date),
    respected: data.respected,
    createdAt: new Date(data.created_at)
  };
};

// Account Management
export const deleteAccount = async (): Promise<void> => {
  const { error } = await supabase.rpc('delete_user');

  if (error) {
    console.error('Error deleting account:', error);
    throw new Error('Failed to delete account. Please ensure the system is configured correctly.');
  }

  await supabase.auth.signOut();
};

// User Stats (Stamina)
export const fetchUserStats = async (): Promise<UserStats | null> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user.user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user stats:', error);
    return null; // Fail gracefully
  }

  if (!data) return null;

  return {
    userId: data.user_id,
    lastStaminaDate: data.last_stamina_date,
    staminaSpent: data.stamina_spent
  };
};

export const updateUserStamina = async (date: string, spent: number): Promise<void> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return;

  const { error } = await supabase
    .from('user_stats')
    .upsert({
      user_id: user.user.id,
      last_stamina_date: date,
      stamina_spent: spent,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    console.error('Error updating user stamina:', error);
    throw error;
  }
};