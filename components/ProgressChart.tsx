import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getChartData, getHistory } from '../services/historyService';
import { HistoryItem } from '../types';
import { TrendingUp, Utensils, Calendar } from 'lucide-react';

const ProgressChart: React.FC = () => {
  const [data, setData] = useState<{ date: string; calories: number }[]>([]);
  const [recentItems, setRecentItems] = useState<HistoryItem[]>([]);

  const refreshData = () => {
    setData(getChartData());
    setRecentItems(getHistory().slice(0, 5));
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('historyUpdated', refreshData);
    return () => window.removeEventListener('historyUpdated', refreshData);
  }, []);

  if (recentItems.length === 0) {
    return (
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center min-h-[200px]">
        <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
          <TrendingUp className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">Здесь будет ваша статистика</h3>
        <p className="text-gray-400 text-sm max-w-xs">
          Начните сканировать еду, чтобы увидеть график калорий и историю.
        </p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8 animate-fade-in-up">
      {/* Chart Section */}
      <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50">
        <div className="flex justify-between items-center mb-8">
           <div>
              <h3 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Динамика калорий
              </h3>
              <p className="text-sm text-gray-400 mt-1">За последние 7 дней</p>
           </div>
           <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(data.reduce((acc, curr) => acc + curr.calories, 0) / 7)}
              </div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Среднее / день</div>
           </div>
        </div>
        
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} 
                dy={15} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#94a3b8' }} 
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc', radius: 8 }}
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  padding: '12px 16px',
                  backgroundColor: '#1e293b',
                  color: '#fff'
                }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: number) => [`${value} ккал`, 'Калории']}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
              />
              <Bar dataKey="calories" radius={[8, 8, 8, 8]} barSize={24}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.calories > 2500 ? '#f87171' : '#10b981'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent History List */}
      <div className="lg:col-span-1 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50 flex flex-col">
        <h3 className="text-xl font-heading font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-orange-500" />
          История
        </h3>
        
        <div className="space-y-4 overflow-y-auto max-h-[320px] pr-2 custom-scrollbar flex-1">
          {recentItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-3 rounded-2xl hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                   <div className="text-lg">🍽️</div>
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm leading-tight">{item.foodName}</p>
                  <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleDateString([], { day: '2-digit', month: '2-digit' })} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <span className="font-bold text-gray-900 text-sm bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                {item.calories}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;