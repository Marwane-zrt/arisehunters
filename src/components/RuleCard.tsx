import React, { useState } from 'react';
import { Check, X, AlertTriangle, Trash2, Eye, EyeOff, Calendar, TrendingUp, Flame } from 'lucide-react';
import { Rule, RuleViolation } from '../types/rule';
import { ViolationModal } from './ViolationModal';

interface RuleCardProps {
  rule: Rule;
  violations: RuleViolation[];
  onToggleCheck: (ruleId: string, respected: boolean, violationData?: { reason: string; preventionPlan: string }) => void;
  onDeleteRule: (ruleId: string) => void;
  onDeleteViolation: (violationId: string) => void;
  onToggleActive: (ruleId: string) => void;
}

export const RuleCard: React.FC<RuleCardProps> = ({
  rule,
  violations,
  onToggleCheck,
  onDeleteRule,
  onDeleteViolation,
  onToggleActive
}) => {
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const respectRate = rule.totalDaysChecked > 0 ? Math.round((rule.daysRespected / rule.totalDaysChecked) * 100) : 0;
  // Sort violations by date descending
  const sortedViolations = [...violations].sort((a, b) =>
    new Date(b.violationDate).getTime() - new Date(a.violationDate).getTime()
  );
  const recentViolations = sortedViolations.slice(0, 5);

  const handleRespected = () => {
    onToggleCheck(rule.id, true);
  };

  const handleViolated = () => {
    setShowViolationModal(true);
  };

  const handleViolationSubmit = (violationData: { reason: string; preventionPlan: string }) => {
    onToggleCheck(rule.id, false, violationData);
    setShowViolationModal(false);
  };

  return (
    <>
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-xl blur-sm group-hover:blur-md transition-all"></div>
        <div className={`relative bg-black/70 backdrop-blur-sm border rounded-xl p-6 shadow-2xl transition-all duration-300 group ${rule.isActive
          ? 'border-red-500/30 hover:border-red-400/50 hover:shadow-red-500/10'
          : 'border-gray-600/30 hover:border-gray-500/50 opacity-75'
          }`}>

          {/* Header */}
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="relative">
                <div
                  className="w-4 h-4 rounded-full border-2 border-white/20"
                  style={{ backgroundColor: rule.color, boxShadow: `0 0 10px ${rule.color}60` }}
                />
                {!rule.isActive && (
                  <div className="absolute inset-0 bg-gray-500 rounded-full opacity-50"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-sm sm:text-lg tracking-wide truncate ${rule.isActive ? 'text-white' : 'text-gray-400'}`}>
                  {rule.title}
                </h3>
                {rule.category && (
                  <p className={`text-xs sm:text-sm uppercase tracking-wider font-medium ${rule.isActive ? 'text-red-300' : 'text-gray-500'
                    }`}>
                    {rule.category}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onToggleActive(rule.id)}
                className={`transition-colors ${rule.isActive ? 'text-green-400 hover:text-green-300' : 'text-gray-500 hover:text-gray-400'
                  }`}
                title={rule.isActive ? "Deactivate Rule" : "Activate Rule"}
              >
                {rule.isActive ? <Eye size={14} className="sm:w-4 sm:h-4" /> : <EyeOff size={14} className="sm:w-4 sm:h-4" />}
              </button>
              <button
                onClick={() => onDeleteRule(rule.id)}
                className="text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete Rule"
              >
                <Trash2 size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Description */}
          {rule.description && (
            <p className={`text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 ${rule.isActive ? 'text-gray-300' : 'text-gray-500'}`}>
              {rule.description}
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-black/40 rounded-lg p-2 sm:p-3 border border-orange-500/20">
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <Flame className="text-orange-400" size={12} />
                <span className="text-xs text-gray-400 uppercase tracking-wider">STREAK</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-orange-400">{rule.currentStreak}</div>
            </div>

            <div className="bg-black/40 rounded-lg p-2 sm:p-3 border border-green-500/20">
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <TrendingUp className="text-green-400" size={12} />
                <span className="text-xs text-gray-400 uppercase tracking-wider">RATE</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-green-400">{respectRate}%</div>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3 sm:mb-4 px-1">
            <div className="flex items-center gap-1">
              <Calendar size={10} className="sm:w-3 sm:h-3" />
              <span>📅 Checked: {rule.totalDaysChecked} days</span>
            </div>
            <div className="text-right">
              <span className="hidden sm:inline">Best: {rule.bestStreak} days</span>
              <span className="sm:hidden">Best: {rule.bestStreak}</span>
            </div>
          </div>

          {/* Recent Violations */}
          {recentViolations.length > 0 && (
            <div className="mb-3 sm:mb-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-yellow-400 hover:text-yellow-300 transition-colors mb-2"
              >
                <AlertTriangle size={12} className="sm:w-[14px] sm:h-[14px]" />
                Recent Violations ({violations.length})
              </button>

              {showHistory && (
                <div className="space-y-2 max-h-40 overflow-y-auto mb-4 custom-scrollbar">
                  {recentViolations.map(violation => (
                    <div key={violation.id} className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 sm:p-3 relative group/violation">
                      <button
                        onClick={() => onDeleteViolation(violation.id)}
                        className="absolute top-1 right-1 p-1 text-gray-500 hover:text-red-400 opacity-0 group-hover/violation:opacity-100 transition-opacity"
                        title="Delete violation log"
                      >
                        <Trash2 size={12} />
                      </button>
                      <div className="text-[10px] text-red-400 font-medium mb-1">
                        {new Date(violation.violationDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-300 mb-1">
                        <strong>Why:</strong> {violation.reason}
                      </div>
                      <div className="text-xs text-gray-400 italic">
                        {violation.preventionPlan}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {rule.isActive && (
            <div className="flex gap-2 text-sm sm:text-base px-1">
              <button
                onClick={handleRespected}
                className="flex-1 flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white py-3 rounded-lg font-bold transition-all duration-300 uppercase tracking-wider shadow-lg shadow-green-500/10"
              >
                <Check size={14} className="sm:w-4 sm:h-4" />
                <span>Respected</span>
              </button>
              <button
                onClick={handleViolated}
                className="flex-1 flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-500 hover:to-pink-600 text-white py-3 rounded-lg font-bold transition-all duration-300 uppercase tracking-wider shadow-lg shadow-red-500/10"
              >
                <X size={14} className="sm:w-4 sm:h-4" />
                <span>Violated</span>
              </button>
            </div>
          )}

          {!rule.isActive && (
            <div className="text-center py-2 sm:py-3 text-gray-500 text-xs sm:text-sm px-1">
              Rule is inactive
            </div>
          )}
        </div>
      </div>

      {/* Violation Modal */}
      <ViolationModal
        isOpen={showViolationModal}
        onClose={() => setShowViolationModal(false)}
        onSubmit={handleViolationSubmit}
        ruleTitle={rule.title}
      />
    </>
  );
};