import React from 'react';
import { X, AlertTriangle, ShieldAlert, Zap } from 'lucide-react';

export type LimitType = 'HABITS' | 'GOALS' | 'RULES' | 'RANK_GATE';

interface LimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: LimitType;
}

export const LimitModal: React.FC<LimitModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const getContent = () => {
    switch (type) {
      case 'HABITS':
        return {
          title: 'SYSTEM ALERT: CAPACITY REACHED',
          message: 'E-Rank Hunters lack the stamina to track more than 7 active quests simultaneously. To break your limits and unlock unlimited tracking, ascend to a higher rank.',
          icon: <AlertTriangle className="text-orange-400 w-12 h-12" />,
          color: 'from-orange-500 to-red-600',
          borderColor: 'border-orange-500/50',
          bgGlow: 'bg-orange-500/20'
        };
      case 'GOALS':
        return {
          title: 'SYSTEM ALERT: CAPACITY REACHED',
          message: 'Your current rank restricts you to 3 active long-term goals. To conquer more objectives, you must unlock your hidden potential.',
          icon: <AlertTriangle className="text-orange-400 w-12 h-12" />,
          color: 'from-orange-500 to-red-600',
          borderColor: 'border-orange-500/50',
          bgGlow: 'bg-orange-500/20'
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
            {type !== 'RANK_GATE' ? (
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
