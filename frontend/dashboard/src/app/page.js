"use client";

import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import { FormsListPage } from '@/components/forms/FormsListPage';
import { AnalyticsPage } from '@/components/analytics/AnalyticsPage';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { API_ENDPOINT, fetchRealData, fetchMockData } from '@/lib/api';

export default function Home() {
  const [activePage, setActivePage] = useState('dashboard');
  const [appData, setAppData] = useState({ forms: [], questions: [] });
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [error, setError] = useState(null);
  const [pageFilters, setPageFilters] = useState({
      time: 'all',
      technician: 'all',
      nps: 'all',
      status: 'all'
  });
  const [timeFilter, setTimeFilter] = useState('all');

  const loadData = useCallback(async () => {
      setIsRefreshing(true);
      setError(null);
      try {
          const data = API_ENDPOINT ? await fetchRealData(API_ENDPOINT) : await fetchMockData();
          setAppData(data);
      } catch (err) {
          console.error("Falha ao carregar dados:", err);
          setError(err.message);
      } finally {
          setIsRefreshing(false);
      }
  }, []);

  useEffect(() => {
    loadData(); // Carga na mudança de página e na carga inicial
    const intervalId = setInterval(loadData, 10000); // Recarrega a cada 10 segundos
    return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar ou ao re-executar o efeito
  }, [activePage, loadData]); 
  
  const handleNavigate = (page, newFilters = {}) => {
      setPageFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
      setActivePage(page);
  };

  const pageTitles = {
      dashboard: "Dashboard",
      forms: "Todos os Formulários",
      analytics: "Análises de Performance",
      settings: "Configurações"
  };

  const renderContent = () => {
    if (error && !appData.forms.length) { // Mostra erro apenas se não houver dados para exibir
        return <div className="flex items-center justify-center h-full"><p className="text-red-500">Erro ao carregar dados: {error}</p></div>;
    }
    switch (activePage) {
      case 'dashboard': return <DashboardPage formsData={appData.forms} questionsData={appData.questions} onNavigate={handleNavigate} timeFilter={timeFilter} />;
      case 'forms': return <FormsListPage formsData={appData.forms} questionsData={appData.questions} initialFilters={pageFilters} onFiltersChange={setPageFilters} />;
      case 'analytics': return <AnalyticsPage formsData={appData.forms} questionsData={appData.questions} />;
      case 'settings': return <SettingsPage initialQuestions={appData.questions} onRefresh={loadData} />;
      default: return <DashboardPage formsData={appData.forms} questionsData={appData.questions} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            } 
            @keyframes slide-up {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            .animate-spin {
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `}</style>
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold text-gray-800 transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>{pageTitles[activePage]}</h2>
            {activePage === 'dashboard' && (
                <div className="flex items-center space-x-2">
                    <button onClick={() => setTimeFilter('7d')} className={`px-3 py-1 text-sm rounded-md ${timeFilter === '7d' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700'}`}>7 dias</button>
                    <button onClick={() => setTimeFilter('30d')} className={`px-3 py-1 text-sm rounded-md ${timeFilter === '30d' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700'}`}>30 dias</button>
                    <button onClick={() => setTimeFilter('all')} className={`px-3 py-1 text-sm rounded-md ${timeFilter === 'all' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Tudo</button>
                </div>
            )}
        </div>
        {renderContent()}
      </main>
    </div>
  );
}