import React from 'react';
import { motion } from 'motion/react';
import { X, Delete } from 'lucide-react';

interface DialPadProps {
  onNumberClick: (key: string) => void;
  onDelete: () => void;
}

export const DialPad: React.FC<DialPadProps> = ({ onNumberClick, onDelete }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="grid grid-cols-3 gap-4">
      {keys.map((key, i) => (
        <motion.button
          key={i}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (key === 'del') {
              onDelete();
            } else if (key !== '') {
              onNumberClick(key);
            }
          }}
          className="aspect-square rounded-full bg-white/5 text-white text-3xl font-light flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-0"
          disabled={key === ''}
        >
          {key === 'del' ? <Delete size={28} /> : key}
        </motion.button>
      ))}
    </div>
  );
};
