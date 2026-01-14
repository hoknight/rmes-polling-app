import React from 'react';
import { Page } from '../types';
import { Button } from '../components/Button';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface SuccessProps {
  setPage: (page: Page) => void;
}

export const Success: React.FC<SuccessProps> = ({ setPage }) => {
  return (
    <div className="max-w-md mx-auto p-6 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.08)] p-12 border border-white/50 w-full text-center relative overflow-hidden">
        
        {/* Background decorative glow */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-50"></div>

        <div className="flex justify-center mb-8 relative z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20"></div>
            <CheckCircle className="w-24 h-24 text-emerald-500 relative z-10 drop-shadow-lg" />
          </div>
        </div>
        
        <h2 className="text-3xl font-extrabold text-slate-800 mb-2">
          投票成功！
        </h2>
        <p className="text-slate-500 mb-10 text-lg">
          感謝您的參與，您的意見對我們很重要。
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={() => setPage('stats')}
            variant="secondary"
            fullWidth
            className="group"
          >
            <span className="flex items-center justify-center gap-2">
              查看即時統計
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </span>
          </Button>
          
           <Button 
            onClick={() => setPage('home')}
            variant="ghost"
            fullWidth
            className="text-sm font-medium"
          >
            返回首頁
          </Button>
        </div>
      </div>
    </div>
  );
};