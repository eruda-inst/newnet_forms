// src/components/forms/FormDetailModal.js
"use client";

import { XIcon, SyncIcon } from '@/components/ui/Icons';

export const FormDetailModal = ({ form, onClose, isLoading }) => {
    // Lida com ambas as estruturas de dados: a da lista geral e a do pedido individual.
    const attendance = form.attendance || form;
    const responses = form.answered_questions || form.responses || [];

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8 animate-slide-up flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-bold text-gray-800">Detalhes do Atendimento</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><XIcon className="w-6 h-6"/></button>
                </div>
                
                <div className="p-6 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><strong className="text-gray-500 block">Cliente:</strong> <span className="text-gray-800">{attendance.clientName || attendance.client_name}</span></div>
                        <div><strong className="text-gray-500 block">Técnico:</strong> <span className="text-gray-800">{attendance.technician}</span></div>
                        <div><strong className="text-gray-500 block">ID Atendimento:</strong> <span className="text-gray-800 font-mono">{attendance.id}</span></div>
                        <div><strong className="text-gray-500 block">Tipo de Serviço:</strong> <span className="text-gray-800">{attendance.serviceType || attendance.service_type}</span></div>
                        <div><strong className="text-gray-500 block">Data de Fechamento:</strong> <span className="text-gray-800">{new Date(attendance.dateClosed || attendance.date_closed).toLocaleString('pt-BR')}</span></div>
                    </div>
                </div>
                
                <div className="overflow-y-auto p-6 bg-gray-50 rounded-b-xl hide-scrollbar">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4">Respostas do Cliente</h4>
                     {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <SyncIcon className="h-8 w-8 text-gray-400" />
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {(responses && responses.length > 0) ? responses.map((response, index) => {
                                const answer = response.answer_value || response.answer;
                                const questionText = response.question_text || "Pergunta não encontrada";
                                const isImage = typeof answer === 'string' && (answer.startsWith('http'));
                                
                                return (
                                     <div key={index}>
                                        <p className="text-sm font-medium text-gray-600">{questionText}</p>
                                        {isImage ? (
                                            <div className="mt-2">
                                                <a href={answer} target="_blank" rel="noopener noreferrer" className="inline-block">
                                                    <img src={answer} alt="Anexo do cliente" className="max-w-xs rounded-lg shadow-md hover:shadow-lg transition-shadow" />
                                                </a>
                                            </div>
                                        ) : (
                                            <p className="text-lg text-emerald-800 mt-1 pl-4 border-l-2 border-emerald-200">{answer}</p>
                                        )}
                                    </div>
                                );
                            }) : <p className="text-gray-500">Nenhuma resposta detalhada encontrada para este formulário.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
