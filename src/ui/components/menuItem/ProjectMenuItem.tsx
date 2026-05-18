import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Info, Users2, Building2, Code2, Clock } from 'lucide-react';

export type ProjectTab = 'info' | 'equipo' | 'cliente' | 'desarrollo' | 'horas';

interface TabItem {
  id: ProjectTab;
  icon: React.ReactNode;
  label: string;
  gradient: string;
  iconColor: string;
}

const tabs: TabItem[] = [
  {
    id: 'info',
    icon: <Info className="h-5 w-5" />,
    label: 'Información',
    gradient: 'radial-gradient(circle, rgba(0,255,133,0.18) 0%, rgba(0,255,133,0.06) 50%, rgba(0,255,133,0) 100%)',
    iconColor: 'text-[#00ff85]',
  },
  {
    id: 'equipo',
    icon: <Users2 className="h-5 w-5" />,
    label: 'Equipo',
    gradient: 'radial-gradient(circle, rgba(28,249,252,0.18) 0%, rgba(28,249,252,0.06) 50%, rgba(28,249,252,0) 100%)',
    iconColor: 'text-[#1cf9fc]',
  },
  {
    id: 'cliente',
    icon: <Building2 className="h-5 w-5" />,
    label: 'Cliente',
    gradient: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.06) 50%, rgba(99,102,241,0) 100%)',
    iconColor: 'text-indigo-500',
  },
  {
    id: 'desarrollo',
    icon: <Code2 className="h-5 w-5" />,
    label: 'Desarrollo',
    gradient: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.06) 50%, rgba(249,115,22,0) 100%)',
    iconColor: 'text-orange-500',
  },
  {
    id: 'horas',
    icon: <Clock className="h-5 w-5" />,
    label: 'Horas',
    gradient: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.06) 50%, rgba(185,28,28,0) 100%)',
    iconColor: 'text-red-500',
  },
];

const itemVariants: Variants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
};

const backVariants: Variants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
};

const glowVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 2,
    transition: {
      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
      scale: { duration: 0.5, type: 'spring', stiffness: 300, damping: 25 },
    },
  },
};

const sharedTransition = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 20,
  duration: 0.5,
};

interface ProjectMenuBarProps {
  activeTab: ProjectTab;
  onTabChange: (tab: ProjectTab) => void;
}

function ProjectMenuBar({ activeTab, onTabChange }: ProjectMenuBarProps): React.JSX.Element {
  return (
    <nav className="p-2 rounded-2xl bg-white border border-gray-200 shadow-sm relative overflow-hidden">
      <ul className="flex items-center gap-1 relative z-10 w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <li key={tab.id} className="relative flex-1">
              <motion.div
                className="block rounded-xl overflow-visible group relative cursor-pointer w-full"
                style={{ perspective: '600px' }}
                whileHover="hover"
                initial="initial"
                onClick={() => onTabChange(tab.id)}
              >
                <motion.div
                  className="absolute inset-0 z-0 pointer-events-none rounded-xl"
                  variants={glowVariants}
                  style={{ background: tab.gradient, opacity: 0 }}
                />

                {isActive && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full z-20"
                    style={{ backgroundColor: 'var(--primary)' }}
                  />
                )}

                <motion.div
                  className={`flex items-center justify-center gap-2 px-4 py-2 relative z-10 rounded-xl transition-colors w-full ${isActive
                      ? 'text-gray-900 font-semibold'
                      : 'text-gray-500 font-medium'
                    }`}
                  style={isActive ? { backgroundColor: 'rgba(0,255,133,0.08)' } : {}}
                  variants={itemVariants}
                  transition={sharedTransition}
                  layoutId={undefined}
                >
                  <span className={`transition-colors duration-300 ${isActive ? tab.iconColor : 'group-hover:' + tab.iconColor}`}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </motion.div>

                <motion.div
                  className={`flex items-center justify-center gap-2 px-4 py-2 absolute inset-0 z-10 rounded-xl transition-colors w-full ${isActive ? 'text-gray-900 font-semibold' : 'text-gray-500 font-medium'
                    }`}
                  style={isActive ? { backgroundColor: 'rgba(0,255,133,0.08)' } : {}}
                  variants={backVariants}
                  transition={sharedTransition}
                >
                  <span className={tab.iconColor}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </motion.div>
              </motion.div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default ProjectMenuBar;
