import { useState, useRef, useId } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip = ({ content, children }: TooltipProps) => {
  const [visible, setVisible] = useState(false);
  const id = useId();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = () => {
    clearTimeout(timeoutRef.current);
    setVisible(true);
  };
  const hide = () => {
    timeoutRef.current = setTimeout(() => setVisible(false), 150);
  };

  return (
    <span
      className="relative inline-flex items-center cursor-help"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      aria-describedby={visible ? id : undefined}
    >
      {children}
      {visible && (
        <span 
          role="tooltip" 
          id={id} 
          className="absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-800 text-slate-100 px-2.5 py-1.5 rounded-md text-xs whitespace-nowrap z-50 mb-1 shadow-lg pointer-events-none"
        >
          {content}
        </span>
      )}
    </span>
  );
};
