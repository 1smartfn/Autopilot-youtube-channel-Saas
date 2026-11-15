import React, { createContext, useContext, useState, useEffect } from 'react';

export type CardWidth = 'quarter' | 'third' | 'half' | 'two-thirds' | 'full';
export type CardHeightPreset = 'auto' | 'compact' | 'normal' | 'tall';

export interface CardLayout {
  id: string;
  order: number;
  width: CardWidth;
  heightPreset?: CardHeightPreset;
  customHeight?: number; // Pixels when resized via drag
  isCollapsed?: boolean;
  isMaximized?: boolean;
}

export type MenuPosition = 'bottom' | 'second-line';
export type MenuSize = 'compact' | 'comfortable' | 'expanded';

export interface ComponentMeta {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface LayoutContextType {
  // Component temporary names & tags
  showComponentTags: boolean;
  toggleComponentTags: () => void;
  copiedTag: string | null;
  copyTag: (tag: string) => void;
  showDirectoryModal: boolean;
  setShowDirectoryModal: (show: boolean) => void;

  // Customization mode
  isCustomizing: boolean;
  toggleCustomizing: () => void;

  // Menu customization
  menuPosition: MenuPosition;
  setMenuPosition: (pos: MenuPosition) => void;
  menuSize: MenuSize;
  setMenuSize: (size: MenuSize) => void;
  menuHeight: number;
  setMenuHeight: (height: number) => void;
  menuOrder: string[];
  setMenuOrder: (order: string[]) => void;
  reorderMenuItems: (sourceId: string, targetId: string) => void;

  // Card layouts
  cardLayouts: Record<string, Record<string, CardLayout>>;
  updateCardLayout: (viewId: string, cardId: string, updates: Partial<CardLayout>) => void;
  reorderCards: (viewId: string, sourceId: string, targetId: string) => void;
  moveCardStep: (viewId: string, cardId: string, direction: 'up' | 'down') => void;
  resetLayout: (viewId?: string) => void;

  // Component Directory
  componentRegistry: ComponentMeta[];
  registerComponent: (comp: ComponentMeta) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

const STORAGE_KEY = 'tubepilot_custom_layouts_v3';
const TAGS_VISIBLE_KEY = 'tubepilot_show_tags_v3';
const CUSTOMIZING_KEY = 'tubepilot_customizing_v3';
const MENU_POSITION_KEY = 'tubepilot_menu_position_v3';
const MENU_SIZE_KEY = 'tubepilot_menu_size_v3';
const MENU_HEIGHT_KEY = 'tubepilot_menu_height_v3';
const MENU_ORDER_KEY = 'tubepilot_menu_order_v3';

export const INITIAL_MENU_ORDER = [
  'dashboard',
  'studio',
  'sheets',
  'calendar',
  'workers',
  's3',
  'billing'
];

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Temporary names default to true so user can immediately see all names
  const [showComponentTags, setShowComponentTags] = useState<boolean>(() => {
    const saved = localStorage.getItem(TAGS_VISIBLE_KEY);
    return saved !== null ? saved === 'true' : true;
  });

  const [isCustomizing, setIsCustomizing] = useState<boolean>(() => {
    const saved = localStorage.getItem(CUSTOMIZING_KEY);
    return saved === 'true';
  });

  const [menuPosition, setMenuPosition] = useState<MenuPosition>(() => {
    const saved = localStorage.getItem(MENU_POSITION_KEY);
    return (saved as MenuPosition) || 'bottom';
  });

  const [menuSize, setMenuSize] = useState<MenuSize>(() => {
    const saved = localStorage.getItem(MENU_SIZE_KEY);
    return (saved as MenuSize) || 'comfortable';
  });

  const [menuHeight, setMenuHeight] = useState<number>(() => {
    const saved = localStorage.getItem(MENU_HEIGHT_KEY);
    return saved ? parseInt(saved, 10) : 58;
  });

  const [menuOrder, setMenuOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(MENU_ORDER_KEY);
      return saved ? JSON.parse(saved) : INITIAL_MENU_ORDER;
    } catch {
      return INITIAL_MENU_ORDER;
    }
  });

  const [cardLayouts, setCardLayouts] = useState<Record<string, Record<string, CardLayout>>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [showDirectoryModal, setShowDirectoryModal] = useState<boolean>(false);
  const [componentRegistry, setComponentRegistry] = useState<ComponentMeta[]>([]);

  // LocalStorage sync
  useEffect(() => {
    localStorage.setItem(TAGS_VISIBLE_KEY, String(showComponentTags));
  }, [showComponentTags]);

  useEffect(() => {
    localStorage.setItem(CUSTOMIZING_KEY, String(isCustomizing));
  }, [isCustomizing]);

  useEffect(() => {
    localStorage.setItem(MENU_POSITION_KEY, menuPosition);
  }, [menuPosition]);

  useEffect(() => {
    localStorage.setItem(MENU_SIZE_KEY, menuSize);
  }, [menuSize]);

  useEffect(() => {
    localStorage.setItem(MENU_HEIGHT_KEY, String(menuHeight));
  }, [menuHeight]);

  useEffect(() => {
    localStorage.setItem(MENU_ORDER_KEY, JSON.stringify(menuOrder));
  }, [menuOrder]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cardLayouts));
  }, [cardLayouts]);

  const toggleComponentTags = () => setShowComponentTags((prev) => !prev);
  const toggleCustomizing = () => setIsCustomizing((prev) => !prev);

  const copyTag = (tag: string) => {
    navigator.clipboard?.writeText(tag).catch(() => {});
    setCopiedTag(tag);
    setTimeout(() => {
      setCopiedTag((curr) => (curr === tag ? null : curr));
    }, 2500);
  };

  const registerComponent = (comp: ComponentMeta) => {
    setComponentRegistry((prev) => {
      if (prev.some((c) => c.id === comp.id)) return prev;
      return [...prev, comp];
    });
  };

  const updateCardLayout = (viewId: string, cardId: string, updates: Partial<CardLayout>) => {
    setCardLayouts((prev) => {
      const viewMap = prev[viewId] || {};
      const current = viewMap[cardId] || { id: cardId, order: 0, width: 'full' };
      return {
        ...prev,
        [viewId]: {
          ...viewMap,
          [cardId]: { ...current, ...updates }
        }
      };
    });
  };

  const reorderCards = (viewId: string, sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    setCardLayouts((prev) => {
      const viewMap = { ...(prev[viewId] || {}) };
      const sourceCard = viewMap[sourceId] || { id: sourceId, order: 0, width: 'full' };
      const targetCard = viewMap[targetId] || { id: targetId, order: 1, width: 'full' };

      const tempOrder = sourceCard.order;
      sourceCard.order = targetCard.order;
      targetCard.order = tempOrder;

      return {
        ...prev,
        [viewId]: {
          ...viewMap,
          [sourceId]: sourceCard,
          [targetId]: targetCard
        }
      };
    });
  };

  const moveCardStep = (viewId: string, cardId: string, direction: 'up' | 'down') => {
    setCardLayouts((prev) => {
      const viewMap = { ...(prev[viewId] || {}) };
      const current = viewMap[cardId] || { id: cardId, order: 0, width: 'full' };
      const delta = direction === 'up' ? -1 : 1;
      return {
        ...prev,
        [viewId]: {
          ...viewMap,
          [cardId]: { ...current, order: (current.order || 0) + delta }
        }
      };
    });
  };

  const reorderMenuItems = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    setMenuOrder((prev) => {
      const copy = [...prev];
      const sourceIdx = copy.indexOf(sourceId);
      const targetIdx = copy.indexOf(targetId);
      if (sourceIdx === -1 || targetIdx === -1) return prev;
      const [removed] = copy.splice(sourceIdx, 1);
      copy.splice(targetIdx, 0, removed);
      return copy;
    });
  };

  const resetLayout = (viewId?: string) => {
    if (viewId) {
      setCardLayouts((prev) => {
        const copy = { ...prev };
        delete copy[viewId];
        return copy;
      });
    } else {
      setCardLayouts({});
      setMenuOrder(INITIAL_MENU_ORDER);
      setMenuPosition('bottom');
      setMenuSize('comfortable');
      setMenuHeight(58);
    }
  };

  return (
    <LayoutContext.Provider
      value={{
        showComponentTags,
        toggleComponentTags,
        copiedTag,
        copyTag,
        showDirectoryModal,
        setShowDirectoryModal,
        isCustomizing,
        toggleCustomizing,
        menuPosition,
        setMenuPosition,
        menuSize,
        setMenuSize,
        menuHeight,
        setMenuHeight,
        menuOrder,
        setMenuOrder,
        reorderMenuItems,
        cardLayouts,
        updateCardLayout,
        reorderCards,
        moveCardStep,
        resetLayout,
        componentRegistry,
        registerComponent
      }}
    >
      {children}

      {/* Floating Toast Notification on Copy */}
      {copiedTag && (
        <div className="fixed bottom-20 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-amber-500/60 bg-zinc-950/95 px-4 py-2.5 text-xs font-mono font-bold text-amber-300 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200 ring-2 ring-amber-500/30">
          <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
          <span>
            Copied name: <span className="text-white underline decoration-amber-400 decoration-2">[{copiedTag}]</span>
          </span>
          <span className="text-[10px] text-zinc-400 font-sans ml-1">
            (Ready to paste in your feedback message)
          </span>
        </div>
      )}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
