import React, { useRef, useState, useEffect } from 'react';
import { Target, BarChart3, Settings, CheckSquare, Brain, Shield, Trophy, ChevronLeft, ChevronRight, Crown } from 'lucide-react';

type ViewType = 'habits' | 'goals' | 'skills' | 'rules' | 'analytics' | 'leaderboard' | 'settings' | 'guild';

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onGuildClick?: () => void;
}

const navigationItems = [
  { id: 'habits' as ViewType, label: 'Daily Quests', icon: CheckSquare },
  { id: 'goals' as ViewType, label: 'Raids', icon: Target },
  { id: 'skills' as ViewType, label: 'Skills', icon: Brain },
  { id: 'rules' as ViewType, label: 'Rules', icon: Shield },
  { id: 'analytics' as ViewType, label: 'Stats', icon: BarChart3 },
  { id: 'leaderboard' as ViewType, label: 'Leaderboard', icon: Trophy },
  { id: 'settings' as ViewType, label: 'Settings', icon: Settings },
  { id: 'guild' as ViewType, label: 'Hunter Guild', icon: Crown },
];

export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange, onGuildClick }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [showScrollButtons, setShowScrollButtons] = useState(false);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('https://res.cloudinary.com/dc369sr43/video/upload/v1756502265/System_-_Message_Changing_Sound_Effect___Solo_leveling_s43chv.mp4');
    audioRef.current.volume = 0.3; // Set volume to 30%
    audioRef.current.preload = 'auto';
  }, []);

  const playNavigationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset to start
      audioRef.current.play().catch(error => {
        // Silently handle autoplay restrictions
        console.log('Audio play prevented by browser policy');
      });
    }
  };

  const handleViewChange = (view: ViewType) => {
    if (view === 'guild' && onGuildClick) {
      onGuildClick();
      return;
    }
    if (view !== currentView) {
      playNavigationSound();
      onViewChange(view);
    }
  };

  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // Only enable scroll buttons on mobile screens
    if (window.innerWidth >= 768) {
      setShowScrollButtons(false);
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    setShowScrollButtons(scrollWidth > clientWidth);
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, []);

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    container.scrollBy({
      left: -200,
      behavior: 'smooth'
    });
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    container.scrollBy({
      left: 200,
      behavior: 'smooth'
    });
  };

  const scrollToActiveItem = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const activeIndex = navigationItems.findIndex(item => item.id === currentView);
    if (activeIndex === -1) return;

    const itemWidth = 120; // Approximate width of each nav item
    const containerWidth = container.clientWidth;
    const scrollPosition = (activeIndex * itemWidth) - (containerWidth / 2) + (itemWidth / 2);

    container.scrollTo({
      left: Math.max(0, scrollPosition),
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    scrollToActiveItem();
  }, [currentView]);

  return (
    <nav className="mb-8">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl blur-xl"></div>
        <div className="relative bg-black/60 backdrop-blur-sm border border-blue-500/30 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Scroll Left Button */}
          {showScrollButtons && canScrollLeft && (
            <button
              onClick={scrollLeft}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/80 backdrop-blur-sm border border-blue-500/30 rounded-full p-2 text-blue-400 hover:text-white hover:bg-blue-500/20 transition-all md:hidden"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {/* Scroll Right Button */}
          {showScrollButtons && canScrollRight && (
            <button
              onClick={scrollRight}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/80 backdrop-blur-sm border border-blue-500/30 rounded-full p-2 text-blue-400 hover:text-white hover:bg-blue-500/20 transition-all md:hidden"
            >
              <ChevronRight size={16} />
            </button>
          )}

          {/* Navigation Items Container */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto md:overflow-x-visible scrollbar-hide p-2 gap-1 md:justify-center"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
            onScroll={checkScrollability}
          >
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleViewChange(item.id)}
                  className={`flex-shrink-0 md:flex-1 flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-xl font-medium transition-all duration-300 relative group min-w-[100px] md:min-w-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50 border border-transparent'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl blur-sm"></div>
                  )}
                  <div className="relative flex flex-col items-center gap-1">
                    <Icon size={20} className={isActive ? 'animate-pulse' : ''} />
                    <span className="text-xs font-medium tracking-wide text-center leading-tight">
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Custom scrollbar hide styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </nav>
  );
};