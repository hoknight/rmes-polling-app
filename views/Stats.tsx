import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import { getVoteStats, getTotalVotes } from '../services/storage';
import { VoteCount } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { RefreshCw, PieChart as PieIcon, BarChart as BarIcon, List, ArrowDown, ArrowUp } from 'lucide-react';

interface StatsProps {
  setPage: (page: Page) => void;
}

export const Stats: React.FC<StatsProps> = ({ setPage }) => {
  const [stats, setStats] = useState<VoteCount[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Modern vibrant palette
  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#10b981', '#06b6d4'];

  const refreshData = () => {
    setStats(getVoteStats());
    setTotalVotes(getTotalVotes());
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const fontSize = 20;

  // Sort stats based on sortOrder
  const sortedStats = [...stats].sort((a, b) => {
    return sortOrder === 'desc' ? b.value - a.value : a.value - b.value;
  });

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  return (
    <div className="flex flex-col h-full w-full bg-white/50">
      {/* Header Info */}
      <div className="flex justify-between items-center px-4 sm:px-6 py-4 bg-white/80 backdrop-blur-md border-b border-white/40 shadow-sm shrink-0 z-10">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">統計結果</h2>
        <div className="flex items-center gap-2 bg-indigo-50 px-3 sm:px-4 py-2 rounded-full border border-indigo-100">
          <span className="text-xs sm:text-sm font-semibold text-indigo-400 uppercase tracking-wider">總票數</span>
          <span className="text-xl sm:text-2xl font-bold text-indigo-600 leading-none">{totalVotes}</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 sm:p-6 relative min-h-0 overflow-hidden">
        <div className="w-full h-full bg-white rounded-3xl shadow-[0_10px_40px_rgb(0,0,0,0.05)] border border-slate-100 p-4 sm:p-6 flex flex-col relative overflow-hidden">
            {totalVotes === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                <div className="bg-slate-50 p-6 rounded-full mb-4">
                    <RefreshCw className="w-10 h-10 text-slate-300" />
                </div>
                <p className="text-xl font-medium">目前尚無投票數據</p>
                <p className="text-sm mt-2 opacity-60">數據將在投票後自動更新</p>
            </div>
            ) : isSmallScreen ? (
              /* Table View for Mobile */
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar -mr-2 pr-2">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
                    <tr>
                      <th className="pb-3 pl-2 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-10">#</th>
                      <th className="pb-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">選項</th>
                      <th 
                        className="pb-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-indigo-600 transition-colors select-none group"
                        onClick={toggleSort}
                      >
                        <div className="flex items-center justify-end gap-1">
                          票數
                          {sortOrder === 'desc' 
                            ? <ArrowDown className="w-3 h-3 text-indigo-500" /> 
                            : <ArrowUp className="w-3 h-3 text-indigo-500" />
                          }
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {sortedStats.map((entry, index) => {
                      const percent = (entry.value / totalVotes) * 100;
                      return (
                        <tr key={index} className="group">
                          <td className="py-4 pl-2 align-top">
                             <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5 bg-indigo-500 shadow-sm shadow-indigo-200">
                               {index + 1}
                             </div>
                          </td>
                          <td className="py-3 px-2 align-top">
                            <div className="text-sm font-bold text-slate-700 mb-1.5 leading-tight">
                              {entry.name}
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ 
                                  width: `${percent}%`,
                                  backgroundColor: COLORS[index % COLORS.length]
                                }}
                              ></div>
                            </div>
                          </td>
                          <td className="py-3 pr-1 text-right align-top">
                            <div className="text-base font-bold text-slate-800 tabular-nums leading-tight">{entry.value}</div>
                            <div className="text-xs font-medium text-slate-400 tabular-nums mt-1">{percent.toFixed(1)}%</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Chart View for Desktop/Tablet */
              chartType === 'bar' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats} layout="vertical" margin={{ top: 20, right: 100, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 14, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={280} 
                      tick={{ fontSize: fontSize, fontWeight: '700', fill: '#334155' }} 
                      interval={0}
                      axisLine={false}
                      tickLine={false}
                      />
                      <Tooltip 
                      cursor={{fill: '#f8fafc', radius: 8}}
                      contentStyle={{ fontSize: '16px', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]} label={{ position: 'right', fontSize: fontSize, fontWeight: 'bold', fill: '#6366f1', dx: 10 }}>
                      {stats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                      </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-row items-center w-full h-full gap-6">
                    <div className="flex-1 h-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius="75%"
                                    fill="#8884d8"
                                    dataKey="value"
                                    paddingAngle={2}
                                >
                                    {stats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={3} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ fontSize: '16px', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} 
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="w-1/3 min-w-[300px] h-full overflow-y-auto py-4 pr-2 custom-scrollbar">
                       <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                          <table className="w-full">
                            <thead>
                                <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/60">
                                    <th className="pb-3 text-left pl-2">選項</th>
                                    <th className="pb-3 text-right pr-2">數據</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {stats.map((entry, index) => {
                                    const color = COLORS[index % COLORS.length];
                                    const percent = totalVotes > 0 ? (entry.value / totalVotes * 100).toFixed(1) : '0.0';
                                    return (
                                        <tr key={index} className="group hover:bg-white/50 transition-colors">
                                            <td className="py-3 pl-2 align-middle">
                                                <div className="flex items-start gap-3">
                                                    <div 
                                                        className="w-3 h-3 rounded-full mt-1.5 shrink-0 shadow-sm" 
                                                        style={{ backgroundColor: color }}
                                                    ></div>
                                                    <span className="text-sm font-bold text-slate-700 leading-snug">{entry.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 text-right align-middle">
                                                <span 
                                                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-white text-sm font-bold shadow-sm whitespace-nowrap min-w-[80px]"
                                                    style={{ backgroundColor: color }}
                                                >
                                                    {entry.value}票 ({percent}%)
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                          </table>
                       </div>
                    </div>
                </div>
              )
            )}
        </div>
      </div>

      {/* Footer Controls - Floating Segmented Control - Only Visible on Desktop */}
      {!isSmallScreen && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-xl p-1.5 rounded-2xl border border-white/40 shadow-xl pointer-events-auto transform transition-all hover:scale-105">
            <div className="flex gap-1">
              <button
                onClick={() => setChartType('pie')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-lg font-bold transition-all duration-300 ${
                  chartType === 'pie' 
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <PieIcon className="w-5 h-5" />
                <span>圓形圖</span>
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-lg font-bold transition-all duration-300 ${
                  chartType === 'bar' 
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <BarIcon className="w-5 h-5" />
                <span>直條圖</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile Footer Hint */}
      {isSmallScreen && totalVotes > 0 && (
         <div className="pb-4 text-center">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
               <List className="w-3 h-3" />
               已切換至列表檢視
            </p>
         </div>
      )}
    </div>
  );
};