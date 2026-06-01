import React from 'react';
import { X, AlertTriangle, ShieldAlert, Zap, Target, Lock, Battery } from 'lucide-react';

export type LimitType = 'HABITS' | 'GOALS' | 'RULES' | 'RANK_GATE' | 'LEADERBOARD' | 'STAMINA';

interface LimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: LimitType;
  limitValue?: number;
}

export const LimitModal: React.FC<LimitModalProps> = ({ isOpen, onClose, type, limitValue }) => {
  if (!isOpen) return null;

  const getContent = () => {
    switch (type) {
      case 'HABITS':
        return {
          title: 'SYSTEM ALERT: CAPACITY REACHED',
          message: `Your current Rank lacks the stamina to track more than ${limitValue || 7} active quests simultaneously. To break your limits and unlock unlimited tracking, ascend to a higher rank.`,
          icon: <AlertTriangle className="text-orange-400 w-12 h-12" />,
          color: 'from-orange-500 to-red-600',
          borderColor: 'border-orange-500/50',
          bgGlow: 'bg-orange-500/20'
        };
      case 'GOALS':
        return {
          title: 'GOAL LIMIT REACHED',
          message: 'E-Rank Hunters are restricted to 2 active long-term goals. To take on more Raids, you must reach C-Rank and join the Hunter Guild.',
          icon: <Target className="text-pink-500 w-12 h-12" />,
          color: 'from-pink-500 to-purple-600',
          borderColor: 'border-pink-500/50',
          bgGlow: 'bg-pink-500/20'
        };
      case 'RULES':
        return {
          title: 'SYSTEM ALERT: CAPACITY REACHED',
          message: 'A weak vessel cannot handle the burden of more than 3 strict rules. Build your discipline and ascend your rank to enforce more penalties.',
          icon: <AlertTriangle className="text-orange-400 w-12 h-12" />,
          color: 'from-orange-500 to-red-600',
          borderColor: 'border-orange-500/50',
          bgGlow: 'bg-orange-500/20'
        };
      case 'RANK_GATE':
        return {
          title: 'ACCESS DENIED',
          message: 'The Hunter Guild is only open to C-Rank hunters and above. There is no place for the weak. Level up your stats and return.',
          icon: <ShieldAlert className="text-red-500 w-12 h-12" />,
          color: 'from-red-600 to-black',
          borderColor: 'border-red-600/50',
          bgGlow: 'bg-red-600/20'
        };
      case 'LEADERBOARD':
        return {
          title: 'SYSTEM LOCKED',
          message: 'The Global Leaderboard is locked for E-Rank and D-Rank Hunters. To see how you rank against the strongest, you must ascend to C-Rank.',
          icon: <Lock className="text-yellow-500 w-12 h-12" />,
          color: 'from-yellow-500 to-orange-600',
          borderColor: 'border-yellow-500/50',
          bgGlow: 'bg-yellow-500/20'
        };
      case 'STAMINA':
        return {
          title: 'STAMINA EXHAUSTED',
          message: 'Your Hunter stamina is depleted for today. You cannot earn more points from Daily Quests until tomorrow. Rest and recover.',
          icon: <Battery className="text-blue-400 w-12 h-12" />,
          color: 'from-blue-500 to-cyan-500',
          borderColor: 'border-blue-500/50',
          bgGlow: 'bg-blue-500/20'
        };
    }
  };

  const content = getContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className={`relative bg-gray-900 border-2 ${content.borderColor} rounded-2xl w-full max-w-md overflow-hidden shadow-2xl`}>
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${content.color}`} />
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className={`p-3 rounded-xl ${content.bgGlow}`}>
              {content.icon}
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X size={24} />
            </button>
          </div>

          <h2 className="text-2xl font-bold text-white mb-4 tracking-wide font-mono">
            {content.title}
          </h2>
          
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            {content.message}
          </p>

          <div className="flex flex-col gap-3">
            {(type !== 'RANK_GATE' && type !== 'STAMINA') ? (
              <a 
                href="https://whop.com/arise-zrt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="relative group w-full"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${content.color} rounded-xl blur opacity-75 group-hover:opacity-100 transition-all`} />
                <div className={`relative flex items-center justify-center gap-2 bg-gradient-to-r ${content.color} text-white font-bold py-3 px-4 rounded-xl uppercase tracking-wider`}>
                  <Zap size={20} />
                  Break Limits ($4/mo)
                </div>
              </a>
            ) : (
              <button 
                onClick={onClose}
                className={`relative flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-bold py-3 px-4 rounded-xl uppercase tracking-wider transition-all`}
              >
                Return to the Grind
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
