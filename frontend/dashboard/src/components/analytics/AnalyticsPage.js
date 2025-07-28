"use client";

import { useMemo } from 'react';
import { SimpleBarChart } from '@/components/ui/SimpleCharts';
import { AnalyticsAnalysis } from './AnalyticsAnalysis';

export const AnalyticsPage = ({ formsData, questionsData }) => {
    const npsByTechnician = useMemo(() => {
        if (!formsData) return [];
        const answered = formsData.filter(f => f.status === 'Respondido');
        const technicians = [...new Set(answered.map(f => f.technician))];
        
        return technicians.map(tech => {
            const techForms = answered.filter(f => f.technician === tech);
            const promoters = techForms.filter(f => f.satisfaction >= 9).length;
            const detractors = techForms.filter(f => f.satisfaction <= 6).length;
            const total = techForms.length;
            const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;
            return { name: tech, value: nps };
        });
    }, [formsData]);

    const npsByServiceType = useMemo(() => {
        if (!formsData) return [];
        const answered = formsData.filter(f => f.status === 'Respondido');
        const serviceTypes = [...new Set(answered.map(f => f.serviceType))];
        
        return serviceTypes.map(type => {
            const typeForms = answered.filter(f => f.serviceType === type);
            const promoters = typeForms.filter(f => f.satisfaction >= 9).length;
            const detractors = typeForms.filter(f => f.satisfaction <= 6).length;
            const total = typeForms.length;
            const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;
            return { name: type, value: nps };
        });
    }, [formsData]);

    const barColors = ['#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857'];

    return (
        <div className="space-y-6">
            <AnalyticsAnalysis formsData={formsData} questionsData={questionsData} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">NPS por Técnico</h3>
                    <SimpleBarChart data={npsByTechnician} colors={barColors} />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">NPS por Tipo de Serviço</h3>
                    <SimpleBarChart data={npsByServiceType} colors={barColors} />
                </div>
            </div>
        </div>
    );
};
