import React, { useState, useEffect } from 'react';
import { getOptions, getTitle, saveVote, getAppConfig, AppConfig } from '../services/storage';
import { Button } from '../components/Button';
import { Page } from '../types';

interface HomeProps {
  setPage: (page: Page) => void;
}

export const Home: React.FC<HomeProps> = ({ setPage }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  // Initialize state directly from storage to prevent render mismatch
  const [options, setOptions] = useState<string[]>(() => getOptions());
  const [title, setTitle] = useState(() => getTitle());
  const [config, setConfig] = useState<AppConfig>(() => getAppConfig());

  useEffect(() => {
    // Re-fetch on mount just in case, though lazy init covers most cases
    setOptions(getOptions());
    setTitle(getTitle());
    setConfig(getAppConfig());
  }, []);

  const handleOptionClick = (option: string) => {
    if (config.enableMultiSelect) {
      // Multi-select logic
      if (selectedOptions.includes(option)) {
        // Deselect
        setSelectedOptions(selectedOptions.filter(item => item !== option));
      } else {
        // Select
        if (selectedOptions.length < config.maxSelections) {
          setSelectedOptions([...selectedOptions, option]);
        } else {
           // Optional: Shake animation or toast could be added here to indicate limit reached
        }
      }
    } else {
      // Single-select logic
      setSelectedOptions([option]);
    }
  };

  const handleSubmit = () => {
    if (selectedOptions.length > 0) {
      saveVote(selectedOptions);
      setPage('success');
    }
  };

  const isSelected = (option: string) => selectedOptions.includes(option);
  const isMaxReached = config.enableMultiSelect && selectedOptions.length >= config.maxSelections;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center min-h-[85vh]">
      <div className="w-full flex flex-col items-center animate-fade-in-up">
        
        {/* Title Section */}
        <div className="text-center mb-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 mb-4 tracking-tight drop-shadow-sm">
            {title}
          </h1>
          <div className="flex items-center justify-center gap-2 text-lg text-slate-500 font-medium">
            <span>請點選下方卡片選擇</span>
            {config.enableMultiSelect ? (
               <span className="bg-indigo-100 text-indigo-700 px-3 py-0.5 rounded-full text-sm font-bold border border-indigo-200">
                  可選 {config.maxSelections} 項
               </span>
            ) : (
              <span className="bg-slate-100 text-slate-600 px-3 py-0.5 rounded-full text-sm font-bold border border-slate-200">
                 單選
              </span>
            )}
          </div>
        </div>

        {/* Options Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {options.map((option) => {
            const selected = isSelected(option);
            // If multi-select is enabled, max is reached, and this option is NOT selected, dim it
            const disabled = config.enableMultiSelect && isMaxReached && !selected;
            
            return (
            <label 
              key={option}
              onClick={(e) => {
                e.preventDefault(); // Prevent default browser behavior (double events/native toggling)
                if (!disabled) {
                  handleOptionClick(option);
                }
              }}
              className={`group relative flex flex-col items-center justify-center p-8 rounded-2xl cursor-pointer transition-all duration-300 min-h-[180px] text-center select-none backdrop-blur-sm
                ${selected 
                  ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/30 ring-4 ring-indigo-100 scale-[1.03] z-10' 
                  : disabled 
                    ? 'bg-white/40 border border-white/50 opacity-60 cursor-not-allowed'
                    : 'bg-white/80 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 hover:border-indigo-200 text-slate-700'
                }`}
            >
              <input
                type={config.enableMultiSelect ? "checkbox" : "radio"}
                name="vote"
                value={option}
                checked={selected}
                readOnly
                className="sr-only"
              />
              
              {/* Checkmark Icon */}
              <div className={`absolute top-4 right-4 transition-all duration-300 ${selected ? 'opacity-30 scale-100' : 'opacity-0 scale-75'}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
              </div>
              
              {/* Count badge for Multi-select */}
              {config.enableMultiSelect && selected && (
                  <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border border-white/30">
                    {selectedOptions.indexOf(option) + 1}
                  </div>
              )}

              <span className={`text-2xl font-bold leading-snug break-words w-full tracking-tight`}>
                {option}
              </span>
            </label>
          )})}
        </div>

        {/* Submit Button Area */}
        <div className="w-full max-w-md sticky bottom-6 z-20">
          <div className="absolute inset-0 bg-white/50 backdrop-blur-xl rounded-2xl -m-4"></div>
          <Button 
            onClick={handleSubmit} 
            fullWidth 
            disabled={selectedOptions.length === 0}
            className="relative text-xl py-4 shadow-xl shadow-indigo-500/20"
          >
            {selectedOptions.length > 0 
                ? `確認送出 (${selectedOptions.length})` 
                : '請選擇項目'}
          </Button>
        </div>
      </div>
    </div>
  );
};