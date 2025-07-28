// src/components/settings/FormEditorPage.js
"use client";

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { DraggableQuestion } from './DraggableQuestion';
import { API_ENDPOINT } from '@/lib/api';
import { SyncIcon, CloudCheckIcon, AlertCircleIcon } from '@/components/ui/Icons';

export const FormEditorPage = ({ initialQuestions, onFormUpdate }) => {
    const [questions, setQuestions] = useState(initialQuestions || []);
    const [globalSaveStatus, setGlobalSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
    const [draggedIdx, setDraggedIdx] = useState(null);
    const debouncedQuestions = useDebounce(questions, 1500);
    const initialQuestionsRef = useRef(JSON.parse(JSON.stringify(initialQuestions)));
    const isFirstRun = useRef(true);

    // Efeito para salvar alterações de CRIAÇÃO e ATUALIZAÇÃO (incluindo reordenação)
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        const handleAutoSave = async () => {
            setGlobalSaveStatus('saving');

            const initialMap = new Map(initialQuestionsRef.current.map(q => [q.id, q]));
            
            const promises = debouncedQuestions.map(async (q, index) => {
                const payload = {
                    question_text: q.text,
                    question_type: q.type,
                    options: q.options || [],
                    display_order: index
                };

                if (q.id.startsWith('new_')) {
                    // CRIAR (POST)
                    const response = await fetch(`${API_ENDPOINT}/questions`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    });
                    if (!response.ok) throw new Error('Falha ao criar pergunta');
                    const newQuestion = await response.json();
                    
                    setQuestions(currentQs => {
                        const updated = currentQs.map(oldQ => 
                            oldQ.id === q.id ? { ...newQuestion, text: newQuestion.question_text, type: newQuestion.question_type, options: newQuestion.options, display_order: newQuestion.display_order } : oldQ
                        );
                        initialQuestionsRef.current = updated;
                        return updated;
                    });

                } else {
                    // ATUALIZAR (PUT)
                    const initialQuestion = initialMap.get(q.id);
                    const hasChanged = !initialQuestion || 
                        initialQuestion.text !== q.text ||
                        initialQuestion.type !== q.type ||
                        initialQuestion.display_order !== index ||
                        JSON.stringify(initialQuestion.options) !== JSON.stringify(q.options);
                    
                    if (hasChanged) {
                        const response = await fetch(`${API_ENDPOINT}/questions/${q.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ...payload, id: q.id }),
                        });
                        if (!response.ok) throw new Error('Falha ao atualizar pergunta');
                    }
                }
            });

            try {
                await Promise.all(promises);
                setGlobalSaveStatus('saved');
                initialQuestionsRef.current = questions.map((q, i) => ({...q, display_order: i}));
            } catch (error) {
                console.error("Erro no autosave:", error);
                setGlobalSaveStatus('error');
            }
        };

        handleAutoSave();

    }, [debouncedQuestions]);


    // Efeito para resetar o status visual após um tempo
    useEffect(() => {
        if (globalSaveStatus === 'saved' || globalSaveStatus === 'error') {
            const timer = setTimeout(() => setGlobalSaveStatus('idle'), 2000);
            return () => clearTimeout(timer);
        }
    }, [globalSaveStatus]);


    const handleAddQuestion = () => {
        const newQuestion = { id: `new_${crypto.randomUUID()}`, text: 'Nova Pergunta', type: 'textarea', options: [] };
        setQuestions([...questions, newQuestion]);
    };

    const handleRemoveQuestion = async (questionToRemove) => {
        const oldQuestions = questions;
        setQuestions(currentQuestions => currentQuestions.filter(q => q.id !== questionToRemove.id));

        if (questionToRemove.id.startsWith('new_')) {
            return; 
        }

        setGlobalSaveStatus('saving');
        try {
            const response = await fetch(`${API_ENDPOINT}/questions/${questionToRemove.id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Falha ao deletar');
            console.log(`Questão ${questionToRemove.id} deletada.`);
            setGlobalSaveStatus('saved');
            initialQuestionsRef.current = questions.filter(q => q.id !== questionToRemove.id);
        } catch (error) {
            console.error("Erro ao deletar pergunta:", error);
            setGlobalSaveStatus('error');
            setQuestions(oldQuestions);
        }
    };
    
    const handleQuestionChange = (index, field, value) => {
        setQuestions(currentQuestions => {
            const updatedQuestions = [...currentQuestions];
            updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
            return updatedQuestions;
        });
    };

    const handleDragStart = (index) => {
        setDraggedIdx(index);
    };

    const handleDrop = (targetIndex) => {
        if (draggedIdx === null || draggedIdx === targetIndex) return;
        
        const newList = [...questions];
        const [draggedItem] = newList.splice(draggedIdx, 1);
        newList.splice(targetIndex, 0, draggedItem);
        
        setQuestions(newList);
        setDraggedIdx(null);
    };
    
    const questionTypes = [
        { value: 'textarea', label: 'Caixa de texto' },
        { value: 'radio', label: 'Múltipla escolha' },
        { value: 'text', label: 'Texto curto' },
        { value: 'file', label: 'Envio de Arquivo' }
    ];

    const GlobalStatusIndicator = () => {
        const statusMap = {
            saving: { icon: <SyncIcon className="h-5 w-5 text-gray-500" />, text: "Salvando..." },
            saved: { icon: <CloudCheckIcon className="h-5 w-5 text-green-500" />, text: "Salvo na nuvem" },
            error: { icon: <AlertCircleIcon className="h-5 w-5 text-red-500" />, text: "Erro ao salvar" },
            idle: { icon: null, text: "" },
        };
        const currentStatus = statusMap[globalSaveStatus];
        if (!currentStatus.icon) return null;

        return (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
                {currentStatus.icon}
                <span>{currentStatus.text}</span>
            </div>
        );
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Editor de Formulário</h2>
                <div className="flex items-center space-x-4">
                    <GlobalStatusIndicator />
                    <button onClick={handleAddQuestion} className="px-4 py-2 bg-emerald-500 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                        Adicionar Pergunta
                    </button>
                </div>
            </div>
            <div className="space-y-4">
                {questions.map((q, index) => (
                    <DraggableQuestion
                        key={q.id}
                        question={q}
                        index={index}
                        onQuestionChange={handleQuestionChange}
                        onRemove={() => handleRemoveQuestion(q)}
                        draggedIdx={draggedIdx}
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
                        questionTypes={questionTypes}
                    />
                ))}
            </div>
        </div>
    );
};
