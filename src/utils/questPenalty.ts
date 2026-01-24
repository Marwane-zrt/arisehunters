import { supabase } from '../lib/supabase';

export const applyQuestPenalties = async (): Promise<{ success: boolean; message: string; penaltiesApplied: number }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, message: 'No authenticated user', penaltiesApplied: 0 };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    // Check if penalties were already applied for yesterday
    const { data: existingLog } = await supabase
      .from('daily_penalty_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('check_date', yesterdayString)
      .maybeSingle();

    if (existingLog) {
      return { 
        success: true, 
        message: `Penalties already applied for ${yesterdayString}: ${existingLog.message}`, 
        penaltiesApplied: existingLog.penalties_applied || 0 
      };
    }

    // Get all user's habits
    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id);

    if (habitsError) {
      throw habitsError;
    }

    if (!habits || habits.length === 0) {
      await supabase
        .from('daily_penalty_logs')
        .insert({
          user_id: user.id,
          check_date: yesterdayString,
          penalties_applied: 0,
          message: 'No quests to check'
        });

      return { success: true, message: 'No quests found', penaltiesApplied: 0 };
    }

    // Find habits that were NOT completed yesterday
    const uncompletedHabits = habits.filter(habit => {
      const completedDates = habit.completed_dates || [];
      return !completedDates.includes(yesterdayString);
    });

    const totalPenaltiesToApply = uncompletedHabits.length;

    if (totalPenaltiesToApply === 0) {
      await supabase
        .from('daily_penalty_logs')
        .insert({
          user_id: user.id,
          check_date: yesterdayString,
          penalties_applied: 0,
          message: 'All quests completed - no penalties applied'
        });

      return { success: true, message: 'All quests completed', penaltiesApplied: 0 };
    }

    // Get user's categories sorted by points (highest first)
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('points', { ascending: false });

    if (categoriesError) {
      throw categoriesError;
    }

    // Ensure General category exists
    let generalCategory = categories?.find(cat => cat.name === 'General');
    if (!generalCategory) {
      const { data: newGeneral, error: createError } = await supabase
        .from('categories')
        .insert({
          name: 'General',
          color: '#6B7280',
          user_id: user.id,
          points: 0
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }
      generalCategory = newGeneral;
      categories?.push(generalCategory);
    }

    let remainingPenalties = totalPenaltiesToApply;
    let penaltiesApplied = 0;
    const penaltyDetails: string[] = [];

    // Group uncompleted habits by category
    const habitsByCategory = new Map<string, typeof uncompletedHabits>();
    uncompletedHabits.forEach(habit => {
      const categoryName = habit.category || 'General';
      if (!habitsByCategory.has(categoryName)) {
        habitsByCategory.set(categoryName, []);
      }
      habitsByCategory.get(categoryName)!.push(habit);
    });

    // Apply penalties to each category based on their uncompleted habits
    for (const [categoryName, categoryHabits] of habitsByCategory.entries()) {
      if (remainingPenalties <= 0) break;

      const category = categories?.find(cat => cat.name === categoryName);
      if (!category) continue;

      // Apply penalties equal to the number of uncompleted habits in this category
      // but not more than the category's current points
      const penaltiesToApplyToCategory = Math.min(remainingPenalties, categoryHabits.length, category.points);
      
      if (penaltiesToApplyToCategory > 0) {
        const newPoints = category.points - penaltiesToApplyToCategory;

        const { error: updateError } = await supabase
          .from('categories')
          .update({ points: newPoints })
          .eq('id', category.id);

        if (updateError) {
          console.error(`Error updating category ${categoryName}:`, updateError);
          continue;
        }

        penaltiesApplied += penaltiesToApplyToCategory;
        remainingPenalties -= penaltiesToApplyToCategory;
        penaltyDetails.push(`${categoryName}: -${penaltiesToApplyToCategory} points (${categoryHabits.length} uncompleted quests)`);
      }
    }

    // If there are still remaining penalties and categories have no points,
    // try to apply them to the General category as a fallback
    if (remainingPenalties > 0 && generalCategory) {
      const penaltiesToApplyToGeneral = Math.min(remainingPenalties, generalCategory.points);
      
      if (penaltiesToApplyToGeneral > 0) {
        const newGeneralPoints = generalCategory.points - penaltiesToApplyToGeneral;

        const { error: updateGeneralError } = await supabase
          .from('categories')
          .update({ points: newGeneralPoints })
          .eq('id', generalCategory.id);

        if (!updateGeneralError) {
          penaltiesApplied += penaltiesToApplyToGeneral;
          remainingPenalties -= penaltiesToApplyToGeneral;
          penaltyDetails.push(`General: -${penaltiesToApplyToGeneral} points (fallback)`);
        }
      }
    }

    const message = penaltiesApplied > 0 
      ? `Applied ${penaltiesApplied}/${totalPenaltiesToApply} penalties. ${penaltyDetails.join(', ')}`
      : `${totalPenaltiesToApply} penalties needed but no points available`;

    // Log the penalty application
    await supabase
      .from('daily_penalty_logs')
      .insert({
        user_id: user.id,
        check_date: yesterdayString,
        penalties_applied: penaltiesApplied,
        message: message
      });

    return { 
      success: true, 
      message: message, 
      penaltiesApplied: penaltiesApplied 
    };

  } catch (error: any) {
    console.error('Penalty system error:', error);
    return { 
      success: false, 
      message: `Error: ${error.message}`, 
      penaltiesApplied: 0 
    };
  }
};

export const getLatestPenaltyMessage = async (): Promise<string> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return '';
    }

    const { data, error } = await supabase
      .from('daily_penalty_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('check_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return '';
    }

    const logDate = new Date(data.check_date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Show message if it's from yesterday or today
    if (logDate.toDateString() === yesterday.toDateString() || 
        logDate.toDateString() === today.toDateString()) {
      return data.message || '';
    }
    
    return '';
  } catch (error) {
    console.error('Error getting penalty message:', error);
    return '';
  }
};

export const checkAndApplyPenaltiesOnAppOpen = async (): Promise<string> => {
  try {
    // Always apply penalties automatically when the app opens
    const result = await applyQuestPenalties();
    
    if (result.success && result.penaltiesApplied > 0) {
      return `⚠️ Daily quest penalties applied: ${result.message}`;
    } else if (result.success && result.message.includes('All quests completed')) {
      return `✅ All quests completed yesterday - no penalties applied!`;
    } else if (result.success && result.message.includes('No quests')) {
      return `ℹ️ No quests found to check for penalties.`;
    } else if (result.success && result.message.includes('already applied')) {
      // Don't show message if penalties were already applied today
      return '';
    }
    
    return '';
  } catch (error) {
    console.error('Error in penalty check:', error);
    return '⚠️ Failed to check quest penalties. Please try refreshing the app.';
  }
};