// src/components/forms/FormsListPage.js
"use client";

import { useState, useMemo } from 'react';
import { FormDetailModal } from '@/components/forms/FormDetailModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DownloadIcon } from '@/components/ui/Icons';
import { API_ENDPOINT } from '@/lib/api';

export const FormsListPage = ({ formsData, questionsData, initialFilters, onFiltersChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedForm, setSelectedForm] = useState(null);
    const [detailedForm, setDetailedForm] = useState(null);
    const [isModalLoading, setIsModalLoading] = useState(false);

    const technicians = useMemo(() => [...new Set(formsData.map(f => f.technician))], [formsData]);

    const filteredData = useMemo(() => {
        if (!formsData) return [];
        
        const now = new Date();
        const daysToSubtract = initialFilters.time === '7d' ? 7 : 30;
        const startDate = initialFilters.time === 'all' ? null : new Date(new Date().setDate(now.getDate() - daysToSubtract));

        return formsData
            .filter(form => !startDate || new Date(form.dateClosed) >= startDate)
            .filter(form => initialFilters.status === 'all' || form.status === initialFilters.status)
            .filter(form => initialFilters.technician === 'all' || form.technician === initialFilters.technician)
            .filter(form => initialFilters.nps === 'all' || form.satisfaction === parseInt(initialFilters.nps))
            .filter(form => form.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [formsData, initialFilters, searchTerm]);
    
    const handleRowClick = async (form) => {
        if (form.status === 'Respondido') {
            setSelectedForm(form);
            setIsModalLoading(true);
            setDetailedForm(null);

            try {
                const response = await fetch(`${API_ENDPOINT}/forms/${form.id}`);
                if (!response.ok) {
                    throw new Error(`Falha ao buscar detalhes do formulário: ${response.statusText}`);
                }
                const data = await response.json();
                setDetailedForm(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsModalLoading(false);
            }
        }
    };

    const handleCloseModal = () => {
        setSelectedForm(null);
        setDetailedForm(null);
    };

    const downloadCSV = () => {
        const headers = ["ID Atendimento", "Cliente", "Técnico", "Tipo Serviço", "Data Fechamento", "Status", "NPS"];
        const rows = filteredData.map(form => [
            form.id,
            form.clientName,
            form.technician,
            form.serviceType,
            new Date(form.dateClosed).toLocaleString('pt-BR'),
            form.status,
            form.satisfaction ?? 'N/A'
        ]);

        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "relatorio_newnet.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleClearFilters = () => {
        onFiltersChange({
            time: 'all',
            technician: 'all',
            nps: 'all',
            status: 'all'
        });
        setSearchTerm('');
    };

    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4 items-center">
                    <input 
                        type="text" 
                        placeholder="Buscar por cliente..." 
                        className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 col-span-1 md:col-span-3 lg:col-span-2" 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)} 
                    />
                    <select value={initialFilters.time} className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" onChange={e => onFiltersChange({...initialFilters, time: e.target.value})}>
                        <option value="all">Todo o período</option>
                        <option value="7d">Últimos 7 dias</option>
                        <option value="30d">Últimos 30 dias</option>
                    </select>
                    <select value={initialFilters.technician} className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" onChange={e => onFiltersChange({...initialFilters, technician: e.target.value})}>
                        <option value="all">Todos os Técnicos</option>
                        {technicians.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                     <select value={initialFilters.nps} className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" onChange={e => onFiltersChange({...initialFilters, nps: e.target.value})}>
                        <option value="all">Todas as Notas</option>
                        {Array.from({length: 11}, (_, i) => i).map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <button onClick={handleClearFilters} className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 text-sm h-full">
                        Limpar Filtros
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">ID Atendimento</th>
                                <th scope="col" className="px-6 py-3">Cliente</th>
                                <th scope="col" className="px-6 py-3">Técnico</th>
                                <th scope="col" className="px-6 py-3">Tipo Serviço</th>
                                <th scope="col" className="px-6 py-3">Data Fechamento</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3 text-center">NPS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map(form => (
                                <tr key={form.id} onClick={() => handleRowClick(form)} className={`bg-white border-b ${form.status === 'Respondido' ? 'hover:bg-emerald-50 cursor-pointer' : 'hover:bg-gray-50'}`}>
                                    <td className="px-6 py-4 font-mono text-xs">{form.id}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{form.clientName}</td>
                                    <td className="px-6 py-4">{form.technician}</td>
                                    <td className="px-6 py-4">{form.serviceType}</td>
                                    <td className="px-6 py-4">{new Date(form.dateClosed).toLocaleString('pt-BR')}</td>
                                    <td className="px-6 py-4"><StatusBadge status={form.status} /></td>
                                    <td className="px-6 py-4 text-center font-bold">{form.satisfaction ?? '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedForm && (
                <FormDetailModal 
                    form={detailedForm || selectedForm} 
                    onClose={handleCloseModal}
                    isLoading={isModalLoading}
                />
            )}
        </>
    );
};
