// src/components/dashboard/DashboardPage.js
"use client";

import { useMemo } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { CheckCircleIcon, StarIcon, ClockIcon, AlertCircleIcon } from '@/components/ui/Icons';
import { SimpleBarChart, SimplePieChart, SimpleLineChart } from '@/components/ui/SimpleCharts';
import { DashboardAnalysis } from '@/components/dashboard/DashboardAnalysis';

export const DashboardPage = ({ formsData, questionsData, onNavigate, timeFilter }) => {
    const filteredForms = useMemo(() => {
        if (timeFilter === 'all') return formsData;
        const now = new Date();
        const daysToSubtract = timeFilter === '7d' ? 7 : 30;
        const startDate = new Date(new Date().setDate(now.getDate() - daysToSubtract));
        return formsData.filter(form => new Date(form.dateClosed) >= startDate);
    }, [formsData, timeFilter]);

    const stats = useMemo(() => {
        const data = filteredForms || [];
        const total = data.length;
        const responded = data.filter(f => f.status === 'Respondido');
        const pending = data.filter(f => f.status === 'Pendente' || f.status === 'Recorrente');
        const responseRate = total > 0 ? ((responded.length / total) * 100).toFixed(0) : 0;
        let nps = 'N/A';
        if (responded.length > 0) {
            const promoters = responded.filter(f => f.satisfaction >= 9).length;
            const detractors = responded.filter(f => f.satisfaction <= 6).length;
            const promoterPercentage = (promoters / responded.length) * 100;
            const detractorPercentage = (detractors / responded.length) * 100;
            nps = Math.round(promoterPercentage - detractorPercentage);
        }
        return { total, responded: responded.length, pending: pending.length, nps, responseRate };
    }, [filteredForms]);

    const chartData = useMemo(() => {
        if (!filteredForms || !questionsData) return [];
        const answeredForms = filteredForms.filter(f => f.status === 'Respondido');
        if (answeredForms.length === 0) return [];

        return questionsData
            .filter(q => !['textarea', 'text', 'file'].includes(q.type))
            .map(question => {
                if (question.type === 'nps') {
                    const npsCounts = Array(11).fill(0).map((_, i) => ({ name: `${i}`, value: 0 }));
                    answeredForms.forEach(form => {
                        const score = form.satisfaction;
                        if (typeof score === 'number' && score >= 0 && score <= 10) {
                            npsCounts[score].value++;
                        }
                    });
                    return { id: question.id, title: 'Distribuição de NPS', type: 'bar', data: npsCounts };
                }
                if (question.type === 'radio') {
                    const optionCounts = {};
                    (question.options || []).forEach(opt => { optionCounts[opt] = 0; });
                    answeredForms.forEach(form => {
                        const response = form.responses.find(r => r.questionId === question.id);
                        if (response && (question.options || []).includes(response.answer)) {
                            optionCounts[response.answer]++;
                        }
                    });
                    const data = Object.keys(optionCounts).map(key => ({ name: key, value: optionCounts[key] }));
                    return { id: question.id, title: question.text, type: 'pie', data };
                }
                return null;
            }).filter(Boolean);
    }, [filteredForms, questionsData]);
    
    const npsOverTimeData = useMemo(() => {
        const answeredForms = filteredForms.filter(f => f.status === 'Respondido');
        if (answeredForms.length < 2) return null;

        const groupedByDay = answeredForms.reduce((acc, form) => {
            const date = new Date(form.dateClosed).toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(form);
            return acc;
        }, {});

        const sortedDays = Object.keys(groupedByDay).sort();
        
        return sortedDays.map(day => {
            const dayForms = groupedByDay[day];
            const promoters = dayForms.filter(f => f.satisfaction >= 9).length;
            const detractors = dayForms.filter(f => f.satisfaction <= 6).length;
            const totalResponses = dayForms.length;
            const nps = totalResponses > 0 ? Math.round(((promoters - detractors) / totalResponses) * 100) : 0;
            return { label: new Date(day).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), value: nps };
        });

    }, [filteredForms]);
    
    const handleNpsBarClick = (npsScore) => {
        onNavigate('forms', { nps: npsScore, time: timeFilter, technician: 'all', status: 'Respondido' });
    };

    const barColors = ['#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857'];
    const pieColors = ['#10b981', '#6ee7b7', '#3b82f6', '#a5b4fc', '#f87171'];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Taxa de Resposta" value={`${stats.responseRate}%`} icon={<CheckCircleIcon />} subtext={`${stats.responded} de ${stats.total} formulários`} />
                <StatCard title="NPS Score" value={stats.nps} icon={<StarIcon />} subtext="De -100 a 100" />
                <StatCard title="Formulários Pendentes" value={stats.pending} icon={<ClockIcon />} subtext="Aguardando resposta do cliente" />
                <StatCard title="Não Respondidos" value={filteredForms ? filteredForms.filter(f => f.status === 'Não Respondido').length : 0} icon={<AlertCircleIcon />} subtext="Ciclo de cobrança encerrado" />
            </div>

            <DashboardAnalysis filteredForms={filteredForms} questionsData={questionsData} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {npsOverTimeData && (
                     <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                         <h3 className="text-lg font-semibold text-gray-700 mb-2">NPS ao Longo do Tempo</h3>
                         <SimpleLineChart data={npsOverTimeData} color="#10b981" />
                    </div>
                )}
                {chartData.map(chart => (
                    <div key={chart.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                         <h3 className="text-lg font-semibold text-gray-700 mb-2">{chart.title}</h3>
                         {chart.type === 'bar' && <SimpleBarChart data={chart.data} colors={barColors} onBarClick={handleNpsBarClick} />}
                         {chart.type === 'pie' && <SimplePieChart data={chart.data} colors={pieColors} />}
                    </div>
                ))}
            </div>
        </div>
    );
};
