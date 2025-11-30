import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getChartData, getHistory, updateHistoryItem, deleteHistoryItem } from '../services/historyService';
import { HistoryItem } from '../types';
import { TrendingUp, Utensils, Calendar, Pencil, Trash2, X, Save, Clock } from 'lucide-react';

const ProgressChart: React.FC = () => {
  const [data, setData] = useState<{ date: string; calories: number }[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [average, setAverage] = useState(0);
  const [startDate, setStartDate] = useState<string>('');
  const [editingItem, setEditingItem] = useState<HistoryItem | null>(null);

  const refreshData = () => {
    setData(getChartData());
    const allHistory = getHistory();
    setHistoryItems(allHistory);
    
    // Calculate stats
    if (allHistory.length > 0) {
       const totalCals = allHistory.reduce((acc, curr) => acc + curr.calories, 0);
       // Calculate days since first entry for average
       const timestamps = allHistory.map(h => h.timestamp);
       const firstTime = Math.min(...timestamps);
       setStartDate(new Date(firstTime).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }));
       
       const daysDiff = Math.max(1, Math.ceil((Date.now() - firstTime) / (1000 * 60 * 60 * 24)));
       setAverage(Math.round(totalCals / daysDiff));
    } else {
       setAverage(0);
       setStartDate('');
    }
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('historyUpdated', refreshData);
    return () => window.removeEventListener('historyUpdated', refreshData);
  }, []);

  const handleEditClick = (item: HistoryItem) => {
    setEditingItem(item);
  };

  const handleCloseEdit = () => {
    setEditingItem(null);
  };

  const handleSaveEdit = (id: string, newName: string, newCals: number) => {
    updateHistoryItem(id, { foodName: newName, calories: newCals });
    handleCloseEdit();
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту запись?')) {
      deleteHistoryItem(id);
      handleCloseEdit();
    }
  };

  if (historyItems.length === 0) {
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
    <>
      <div className="grid lg:grid-cols-3 gap-8 animate-fade-in-up">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50">
          <div className="flex justify-between items-start mb-8">
             <div>
                <h3 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  Динамика
                </h3>
                <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                   <Clock className="w-3 h-3" /> Старт: {startDate}
                </p>
             </div>
             <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {average}
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

        {/* History List */}
        <div className="lg:col-span-1 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-orange-500" />
              История
            </h3>
            <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">
              {historyItems.length}
            </span>
          </div>
          
          <div className="space-y-4 overflow-y-auto max-h-[320px] pr-2 custom-scrollbar flex-1">
            {historyItems.map((item) => (
              <div 
                key={item.id} 
                onClick={() => handleEditClick(item)}
                className="flex justify-between items-center p-3 rounded-2xl hover:bg-gray-50 transition-colors group cursor-pointer border border-transparent hover:border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                     <div className="text-lg">🍽️</div>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm leading-tight line-clamp-1 max-w-[120px]">{item.foodName}</p>
                    <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-sm bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                    {item.calories}
                  </span>
                  <Pencil className="w-4 h-4 text-gray-300 group-hover:text-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <EditModal 
          item={editingItem} 
          onClose={handleCloseEdit} 
          onSave={handleSaveEdit} 
          onDelete={handleDelete}
        />
      )}
    </>
  );
};

const EditModal: React.FC<{ 
  item: HistoryItem; 
  onClose: () => void; 
  onSave: (id: string, name: string, cals: number) => void;
  onDelete: (id: string) => void;
}> = ({ item, onClose, onSave, onDelete }) => {
  const [name, setName] = useState(item.foodName);
  const [calories, setCalories] = useState(item.calories.toString());

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl scale-100 animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-heading font-bold text-gray-900">Редактировать</h3>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Название</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Калории</label>
            <input 
              type="number" 
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button 
            onClick={() => onDelete(item.id)}
            className="flex-1 py-3.5 rounded-xl bg-red-50 text-red-600 font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onSave(item.id, name, parseInt(calories) || 0)}
            className="flex-[3] py-3.5 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30"
          >
            <Save className="w-5 h-5" /> Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;