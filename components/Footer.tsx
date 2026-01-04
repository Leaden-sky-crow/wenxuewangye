
import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';

export const Footer: React.FC = () => {
  const [lastEdited, setLastEdited] = useState<string | null>(null);

  const updateTimestamp = () => {
    const timestamp = dataService.getLastEdited();
    if (timestamp) {
      const date = new Date(timestamp);
      // Format: YYYY-MM-DD HH:mm
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      setLastEdited(formattedDate);
    }
  };
  
  useEffect(() => {
    updateTimestamp(); // Initial load

    window.addEventListener('storageUpdated', updateTimestamp);

    return () => {
      window.removeEventListener('storageUpdated', updateTimestamp);
    };
  }, []);

  if (!lastEdited) {
    return null;
  }

  return (
    <footer className="w-full text-center py-6 border-t border-gray-800 mt-12">
      <p className="text-xs text-gray-500">
        最后编辑于：{lastEdited}
      </p>
    </footer>
  );
};
