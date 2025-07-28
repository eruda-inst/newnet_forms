// src/components/settings/DraggableQuestion.js
"use client";

import { GripVerticalIcon, TrashIcon } from '@/components/ui/Icons';

export const DraggableQuestion = ({ question, index, onQuestionChange, onRemove, draggedIdx, onDragStart, onDrop, questionTypes }) => {
    
    return (
        <div 
            draggable={question.type !== 'nps'}
            onDragStart={() => onDragStart(index)}
            onDrop={() => onDrop(index)}
            onDragOver={(e) => e.preventDefault()}
            className={`flex items-start gap-4 p-4 border rounded-lg
                ${question.type !== 'nps' ? 'cursor-move hover:shadow-md' : 'bg-gray-100'}
                ${draggedIdx === index ? 'shadow-xl backdrop-blur-lg bg-white/75 opacity-50' : 'bg-white'}
            `}
        >
            {question.type !== 'nps' && <GripVerticalIcon className="h-6 w-6 text-gray-400 mt-8" />}
            <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pergunta {index + 1}
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={question.text}
                        onChange={(e) => onQuestionChange(index, 'text', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        disabled={question.type === 'nps'}
                    />
                    {question.type !== 'nps' && (
                        <select
                            value={question.type}
                            onChange={(e) => onQuestionChange(index, 'type', e.target.value)}
                            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            {questionTypes.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    )}
                </div>
                {question.type === 'nps' && <p className="text-xs text-gray-500 mt-1">A pergunta principal do NPS não pode ser alterada.</p>}
                {question.type === 'radio' && (
                    <div className="mt-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Opções (separadas por vírgula)</label>
                        <input
                            type="text"
                            value={(question.options || []).join(',')}
                            onChange={(e) => onQuestionChange(index, 'options', e.target.value.split(','))}
                            className="w-full p-2 text-sm border border-gray-300 rounded-lg"
                            placeholder="Ex: Sim, Não, Talvez"
                        />
                    </div>
                )}
            </div>
            {question.type !== 'nps' && (
                 <button onClick={onRemove} className="text-gray-400 hover:text-red-500 mt-7">
                    <TrashIcon className="h-5 w-5" />
                </button>
            )}
        </div>
    );
};
