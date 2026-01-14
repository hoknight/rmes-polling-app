import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import { 
  getTitle, saveTitle, getOptions, saveOptions, clearVotes,
  getAppConfig, saveAppConfig, AppConfig, getPassword, savePassword,
  getVotes, getVoteStats, getTotalVotes
} from '../services/storage';
import { Button } from '../components/Button';
import { Lock, Plus, Trash2, Save, AlertTriangle, Settings, ArrowLeft, CheckSquare, ListOrdered, ShieldCheck, CheckCircle, Download, FileSpreadsheet, FileText, Printer } from 'lucide-react';

interface AdminProps {
  setPage: (page: Page) => void;
  onUpdate: () => void;
}

export const Admin: React.FC<AdminProps> = ({ setPage, onUpdate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [config, setConfig] = useState<AppConfig>({ enableMultiSelect: false, maxSelections: 3 });
  
  const [newPassword, setNewPassword] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setTitle(getTitle());
      setOptions(getOptions());
      setConfig(getAppConfig());
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === getPassword()) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('密碼錯誤');
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, "新選項"]);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleConfigChange = (key: keyof AppConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handlePasswordUpdate = () => {
    const isValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{1,8}$/.test(newPassword);

    if (!isValid) {
        alert("密碼格式不符：需為英數混合且最多8位");
        return;
    }

    savePassword(newPassword);
    setNewPassword('');
    
    alert(`密碼修改成功！\n\n[模擬郵件發送]\n收件人: rme@catholic.edu.hk\n主旨: 統計App密碼更新\n內容: 您的管理員密碼已更新為: ${newPassword}`);
  };

  const handleSave = () => {
    const validOptions = options.filter(o => o.trim() !== "");
    
    // Validation: Max selections cannot be greater than total options
    let finalConfig = { ...config };
    if (finalConfig.enableMultiSelect && finalConfig.maxSelections > validOptions.length) {
      finalConfig.maxSelections = validOptions.length;
      setConfig(finalConfig); // Update local state to reflect the auto-correction
      alert(`注意：「多選數目」已自動調整為 ${validOptions.length} (因為不能超過選項總數)`);
    }

    if (finalConfig.enableMultiSelect && finalConfig.maxSelections < 1) {
       finalConfig.maxSelections = 1;
       setConfig(finalConfig);
    }

    saveTitle(title);
    saveOptions(validOptions);
    saveAppConfig(finalConfig);
    
    onUpdate(); // Notify App to refresh header
    
    // Show success message
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    clearVotes();
    setShowResetConfirm(false);
    alert('所有投票數據已重設');
  };

  // Export Logic: CSV
  const handleExportCSV = () => {
    const votes = getVotes();
    const headers = ["時間", "選項"];
    
    // Add Byte Order Mark (BOM) for Excel Chinese support
    let csvContent = "\uFEFF"; 
    csvContent += headers.join(",") + "\n";
    
    votes.forEach(vote => {
      // Escape quotes if necessary, though simple options usually don't need it
      const cleanOption = vote.option.replace(/"/g, '""');
      const time = new Date(vote.timestamp).toLocaleString();
      csvContent += `"${time}","${cleanOption}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `votes_export_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Logic: PDF (via Print)
  const handleExportPDF = () => {
    const votes = getVotes();
    const stats = getVoteStats();
    const total = getTotalVotes();
    const currentTitle = getTitle();

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('請允許彈出視窗以產生 PDF 報告');
        return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>投票統計報告 - ${currentTitle}</title>
        <style>
          @font-face {
            font-family: 'NotoSansTC-Variable';
            src: url('https://raw.githubusercontent.com/google/fonts/main/ofl/notosanstc/NotoSansTC%5Bwght%5D.ttf') format('truetype');
            font-weight: 100 900;
            font-display: swap;
          }
          body { font-family: 'NotoSansTC-Variable', 'Noto Sans TC', sans-serif; padding: 40px; color: #1e293b; }
          .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
          h1 { margin: 0 0 10px 0; color: #334155; }
          .meta { color: #64748b; font-size: 0.9em; }
          .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
          .stat-card { background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .stat-label { font-size: 0.85em; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: bold; }
          .stat-value { font-size: 2em; font-weight: bold; color: #0f172a; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #f1f5f9; text-align: left; padding: 12px; font-weight: bold; color: #475569; border-bottom: 2px solid #e2e8f0; }
          td { padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155; }
          tr:last-child td { border-bottom: none; }
          .footer { margin-top: 50px; text-align: center; font-size: 0.8em; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${currentTitle} - 投票統計報告</h1>
          <div class="meta">產生時間: ${new Date().toLocaleString()}</div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">總投票數</div>
            <div class="stat-value">${total}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">選項總數</div>
            <div class="stat-value">${stats.length}</div>
          </div>
        </div>

        <h2>統計明細</h2>
        <table>
          <thead>
            <tr>
              <th>選項名稱</th>
              <th style="text-align: right;">得票數</th>
              <th style="text-align: right;">百分比</th>
            </tr>
          </thead>
          <tbody>
            ${stats.map(s => {
              const percent = total > 0 ? ((s.value / total) * 100).toFixed(1) : '0.0';
              return `
                <tr>
                  <td>${s.name}</td>
                  <td style="text-align: right; font-weight: bold;">${s.value}</td>
                  <td style="text-align: right;">${percent}%</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="footer">
          RMES Polling App Report
        </div>

        <script>
          window.onload = () => {
            // Give font a moment to load
            setTimeout(() => {
              window.print();
              // Optional: window.close(); 
            }, 800);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-6 min-h-[70vh] flex flex-col justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-10 border border-white/50">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-indigo-50 rounded-2xl shadow-inner">
              <Lock className="w-10 h-10 text-indigo-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">
            管理員登入
          </h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="輸入管理密碼"
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-center text-lg tracking-widest"
                autoFocus
              />
              {error && <p className="text-red-500 text-sm mt-3 text-center font-medium">{error}</p>}
            </div>
            <div className="flex gap-4">
              <Button type="button" variant="ghost" onClick={() => setPage('home')} className="flex-1">
                取消
              </Button>
              <Button type="submit" fullWidth className="flex-1 shadow-indigo-200">
                登入
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-24">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50 p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-100 rounded-lg">
                <Settings className="w-6 h-6 text-indigo-600" />
             </div>
             <h2 className="text-2xl font-bold text-slate-800">內容管理</h2>
          </div>
          <Button variant="ghost" onClick={() => setPage('home')} className="text-sm px-3">
            <ArrowLeft className="w-4 h-4 mr-1" /> 返回
          </Button>
        </div>

        <div className="space-y-8">
          {/* Title Section */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
              投票標題
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all bg-white font-medium text-lg"
            />
          </div>
          
          {/* Voting Settings Section */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
             <div className="flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-indigo-500" />
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  投票設定
                </label>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Multi-select Toggle */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${config.enableMultiSelect ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                         <CheckSquare className="w-5 h-5" />
                      </div>
                      <div>
                         <div className="font-bold text-slate-700">啟用多選功能</div>
                         <div className="text-xs text-slate-400">允許使用者選擇多個項目</div>
                      </div>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={config.enableMultiSelect}
                        onChange={(e) => handleConfigChange('enableMultiSelect', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                   </label>
                </div>

                {/* Max Selections Input */}
                <div className={`bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm transition-opacity duration-300 ${!config.enableMultiSelect ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                   <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                         <ListOrdered className="w-5 h-5" />
                      </div>
                      <div>
                         <div className="font-bold text-slate-700">多選數目限制</div>
                         <div className="text-xs text-slate-400">最多可選擇的項目數量</div>
                      </div>
                   </div>
                   <div className="flex items-center">
                      <input 
                        type="number" 
                        min="1"
                        max={options.length} 
                        value={config.maxSelections}
                        onChange={(e) => handleConfigChange('maxSelections', parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 text-center font-bold text-lg border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none text-indigo-600"
                      />
                      <span className="ml-2 text-slate-400 text-sm">項</span>
                   </div>
                </div>
             </div>
             
             {config.enableMultiSelect && config.maxSelections > options.length && (
                 <p className="mt-3 text-xs text-amber-500 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    注意：設定數值大於選項總數，儲存時將自動調整為 {options.length}。
                 </p>
             )}
          </div>

          {/* Account Security Section */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
             <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  帳號安全
                </label>
             </div>
             <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                <div className="flex-1 w-full">
                    <div className="text-sm font-bold text-slate-700 mb-1">更改管理員密碼</div>
                    <div className="text-xs text-slate-400 mb-2">需為英數混合且最多8位</div>
                    <input 
                        type="text" 
                        placeholder="輸入新密碼"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full md:w-64 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                    />
                    <div className="text-xs text-indigo-500 mt-2 font-medium flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      更改後的密碼已電郵至 rme@catholic.edu.hk
                    </div>
                </div>
                <Button 
                    onClick={handlePasswordUpdate}
                    disabled={!newPassword}
                    className="whitespace-nowrap w-full md:w-auto text-sm py-2 px-6"
                >
                    確認更改
                </Button>
             </div>
          </div>
          
           {/* Data Export Section */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
             <div className="flex items-center gap-2 mb-4">
                <Download className="w-4 h-4 text-indigo-500" />
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  數據匯出
                </label>
             </div>
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-700 mb-1">CSV 原始數據</h3>
                        <p className="text-xs text-slate-400 mb-4">
                            匯出包含所有投票紀錄的原始資料，格式支援 Excel 開啟（含時間戳記與選項）。
                        </p>
                        <Button 
                            onClick={handleExportCSV}
                            variant="secondary"
                            className="w-full sm:w-auto flex items-center justify-center gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            下載 CSV 檔案
                        </Button>
                    </div>
                    <div className="w-px bg-slate-100 hidden sm:block"></div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-700 mb-1">PDF 統計報告</h3>
                        <p className="text-xs text-slate-400 mb-4">
                            產生包含統計圖表數據的正式報告（將開啟列印視窗，請選擇「另存為 PDF」）。
                        </p>
                         <Button 
                            onClick={handleExportPDF}
                            variant="secondary"
                            className="w-full sm:w-auto flex items-center justify-center gap-2 text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                        >
                            <Printer className="w-4 h-4" />
                            匯出 PDF 報告
                        </Button>
                    </div>
                </div>
             </div>
          </div>

          {/* Options Section */}
          <div>
            <div className="flex justify-between items-end mb-3 px-1">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">
                投票選項
                </label>
                <span className="text-xs text-slate-400 font-medium">共 {options.length} 項</span>
            </div>
            
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex gap-3 group">
                  <div className="flex-1 relative">
                    <span className="absolute left-4 top-3.5 text-xs text-slate-400 font-mono">#{index + 1}</span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <button
                    onClick={() => removeOption(index)}
                    className="px-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                    title="刪除"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Button onClick={addOption} variant="secondary" fullWidth className="border-dashed border-2 border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 py-3">
                <Plus className="w-5 h-5 mr-2" />
                新增選項
              </Button>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="pt-8 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-between items-center gap-6">
             {/* Reset Section */}
            <div className="w-full sm:w-auto">
              {!showResetConfirm ? (
                <button 
                  onClick={() => setShowResetConfirm(true)}
                  className="flex items-center justify-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-3 rounded-xl transition-colors w-full sm:w-auto"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">重設數據</span>
                </button>
              ) : (
                <div className="flex items-center bg-red-50 px-2 py-2 rounded-xl border border-red-100 w-full sm:w-auto justify-between sm:justify-start">
                   <span className="text-sm text-red-700 mx-3 font-bold whitespace-nowrap">確認清空?</span>
                   <div className="flex gap-1">
                    <button 
                        onClick={handleReset}
                        className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 shadow-sm"
                    >
                        確認
                    </button>
                    <button 
                        onClick={() => setShowResetConfirm(false)}
                        className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1.5"
                    >
                        取消
                    </button>
                   </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                {showSaveSuccess && (
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 animate-fade-in-up">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-bold">設定已更新</span>
                    </div>
                )}
                <Button onClick={handleSave} className="flex items-center gap-2 min-w-[160px] justify-center shadow-lg shadow-indigo-200 w-full sm:w-auto">
                <Save className="w-4 h-4" />
                儲存變更
                </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};