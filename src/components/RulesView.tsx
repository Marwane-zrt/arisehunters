import React, { useState } from 'react';
import { Plus, Shield, TrendingUp, AlertTriangle, Calendar, History as HistoryIcon, Trash2 } from 'lucide-react';
import { Rule, RuleFormData, RuleViolation } from '../types/rule';
import { Category } from '../types/category';
import { RuleCard } from './RuleCard';
import { AddRuleModal } from './AddRuleModal';
import { getTodayString } from '../utils/storage';

interface RulesViewProps {
  rules: Rule[];
  categories: Category[];
  ruleViolations: RuleViolation[];
  onAddRule: (rule: RuleFormData) => void;
  onToggleRuleCheck: (ruleId: string, respected: boolean, violationData?: { reason: string; preventionPlan: string }) => void;
  onDeleteRule: (ruleId: string) => void;
  onDeleteViolation: (violationId: string) => void;
  onToggleRuleActive: (ruleId: string) => void;
  getRuleViolations: (ruleId: string) => RuleViolation[];
}

export const RulesView: React.FC<RulesViewProps> = ({
  rules,
  categories,
  ruleViolations,
  onAddRule,
  onToggleRuleCheck,
  onDeleteRule,
  onDeleteViolation,
  onToggleRuleActive,
  getRuleViolations
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const activeRules = rules.filter(rule => rule.isActive);
  const totalRespectedToday = activeRules.filter(rule => {
    // Check if rule was respected today (this would need to be tracked in daily checks)
    return true; // Placeholder - would check actual daily check data
  }).length;

  const averageRespectRate = rules.length > 0
    ? Math.round(rules.reduce((sum, rule) => {
      const rate = rule.totalDaysChecked > 0 ? (rule.daysRespected / rule.totalDaysChecked) * 100 : 0;
      return sum + rate;
    }, 0) / rules.length)
    : 0;

  const totalViolations = rules.reduce((sum, rule) => sum + rule.daysViolated, 0);
  const bestStreak = Math.max(...rules.map(rule => rule.bestStreak), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 rounded-xl blur-lg opacity-50"></div>
            <div className="relative p-2 sm:p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl">
              <Shield className="text-white" size={24} />
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">Personal Rules</h2>
            <p className="text-red-300 font-medium text-sm sm:text-base">Honor your commitments and build discipline</p>
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="relative group w-full sm:w-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-all"></div>
            <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white px-4 sm:px-6 py-3 rounded-xl font-bold transition-all shadow-lg border border-red-400/30 uppercase tracking-wider">
              <Plus size={18} />
              <span className="text-sm sm:text-base">New Rule</span>
            </div>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-red-400">{activeRules.length}</div>
          <div className="text-xs sm:text-sm text-gray-400">Active Rules</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-green-400">{averageRespectRate}%</div>
          <div className="text-xs sm:text-sm text-gray-400">Respect Rate</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-orange-400">{bestStreak}</div>
          <div className="text-xs sm:text-sm text-gray-400">Best Streak</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-yellow-400">{totalViolations}</div>
          <div className="text-xs sm:text-sm text-gray-400">Total Violations</div>
        </div>
      </div>

      {/* Rules Grid */}
      {rules.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl"></div>
            <div className="relative bg-black/60 border-2 border-red-500/30 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto">
              <Shield className="text-red-400" size={28} />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 tracking-wide">Establish Your Code</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed text-sm sm:text-base">
            Create personal rules that define your character and guide your daily actions.
            Build discipline through accountability and self-reflection.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-all"></div>
            <div className="relative bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold transition-all uppercase tracking-wider text-sm sm:text-base">
              Create First Rule
            </div>
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 px-2 sm:px-0">
          {rules
            .sort((a, b) => {
              // Sort by active status first, then by current streak
              if (a.isActive && !b.isActive) return -1;
              if (!a.isActive && b.isActive) return 1;
              return b.currentStreak - a.currentStreak;
            })
            .map(rule => (
              <RuleCard
                key={rule.id}
                rule={rule}
                violations={getRuleViolations(rule.id)}
                onToggleCheck={onToggleRuleCheck}
                onDeleteRule={onDeleteRule}
                onDeleteViolation={onDeleteViolation}
                onToggleActive={onToggleRuleActive}
              />
            ))}
        </div>
      )}

      {/* Violation History Log */}
      {ruleViolations.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <HistoryIcon className="text-red-400" size={20} />
            </div>
            <h3 className="text-xl font-bold text-white tracking-wide">Recent Violations History</h3>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/40 text-gray-400 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">Date</th>
                    <th className="px-6 py-4 font-bold">Rule</th>
                    <th className="px-6 py-4 font-bold">Reason</th>
                    <th className="px-6 py-4 font-bold">Prevention Plan</th>
                    <th className="px-6 py-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {[...ruleViolations]
                    .sort((a, b) => new Date(b.violationDate).getTime() - new Date(a.violationDate).getTime())
                    .slice(0, 10)
                    .map(violation => {
                      const rule = rules.find(r => r.id === violation.ruleId);
                      return (
                        <tr key={violation.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {new Date(violation.violationDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-white flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: rule?.color || '#ef4444' }}
                            />
                            {rule?.title || 'Unknown Rule'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                            {violation.reason}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate italic">
                            {violation.preventionPlan}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => onDeleteViolation(violation.id)}
                              className="p-2 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete log entry"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Rule Modal */}
      <AddRuleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddRule={onAddRule}
        categories={categories}
      />
    </div>
  );
};