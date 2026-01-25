import { supabase } from '../lib/supabase';
import { getLocalDateString } from './dateUtils';

export interface RuleAutoRespectCheck {
  lastCheckDate: string;
  rulesProcessed: number;
}

const AUTO_RESPECT_STORAGE_KEY = 'arise-rule-auto-respect-check';

export const getLastAutoRespectCheck = (): RuleAutoRespectCheck | null => {
  try {
    const stored = localStorage.getItem(AUTO_RESPECT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load auto-respect check data:', error);
    return null;
  }
};

export const saveAutoRespectCheck = (data: RuleAutoRespectCheck): void => {
  try {
    localStorage.setItem(AUTO_RESPECT_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save auto-respect check data:', error);
  }
};

export const checkAndUpdateRuleRespect = async (): Promise<number> => {
  const today = getLocalDateString();
  const lastCheck = getLastAutoRespectCheck();

  if (lastCheck && lastCheck.lastCheckDate === today) {
    return 0;
  }

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayString = getLocalDateString(yesterdayDate);

  if (!lastCheck) {
    saveAutoRespectCheck({
      lastCheckDate: today,
      rulesProcessed: 0
    });
    return 0;
  }

  try {
    const { data: rules, error: rulesError } = await supabase
      .from('rules')
      .select('*')
      .eq('is_active', true);

    if (rulesError) {
      return 0;
    }

    if (!rules || rules.length === 0) {
      saveAutoRespectCheck({
        lastCheckDate: today,
        rulesProcessed: 0
      });
      return 0;
    }

    let rulesProcessed = 0;

    for (const rule of rules) {
      const { data: existingCheck, error: checkError } = await supabase
        .from('rule_daily_checks')
        .select('*')
        .eq('rule_id', rule.id)
        .eq('check_date', yesterdayString)
        .maybeSingle();

      if (checkError) {
        continue;
      }

      if (existingCheck) {
        continue;
      }

      const { data: violation, error: violationError } = await supabase
        .from('rule_violations')
        .select('*')
        .eq('rule_id', rule.id)
        .eq('violation_date', yesterdayString)
        .maybeSingle();

      if (violationError) {
        continue;
      }

      if (!violation) {
        try {
          const { error: insertError } = await supabase
            .from('rule_daily_checks')
            .insert({
              rule_id: rule.id,
              check_date: yesterdayString,
              respected: true
            });

          if (insertError) {
            continue;
          }

          const newTotalDays = rule.total_days_checked + 1;
          const newRespected = rule.days_respected + 1;
          const newStreak = rule.current_streak + 1;
          const newBestStreak = Math.max(rule.best_streak, newStreak);

          const { error: updateError } = await supabase
            .from('rules')
            .update({
              total_days_checked: newTotalDays,
              days_respected: newRespected,
              current_streak: newStreak,
              best_streak: newBestStreak
            })
            .eq('id', rule.id);

          if (updateError) {
            continue;
          }

          rulesProcessed++;

        } catch (error) {
        }
      }
    }

    saveAutoRespectCheck({
      lastCheckDate: today,
      rulesProcessed
    });

    return rulesProcessed;

  } catch (error) {
    return 0;
  }
};

export const getAutoRespectMessage = (rulesProcessed: number): string => {
  if (rulesProcessed === 0) {
    return '';
  }

  if (rulesProcessed === 1) {
    return 'Automatically marked 1 rule as respected for yesterday.';
  }

  return `Automatically marked ${rulesProcessed} rules as respected for yesterday.`;
};