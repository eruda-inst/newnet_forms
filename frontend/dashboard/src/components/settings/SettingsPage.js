// src/components/settings/SettingsPage.js
"use client";

import { useState } from 'react';
import { FormEditorPage } from './FormEditorPage';
import { SmsSettingsPage } from './SmsSettingsPage';
import { EditIcon, MessageSquareIcon } from '@/components/ui/Icons';

export const SettingsPage = ({ initialQuestions, onRefresh }) => {
    const [activeTab, setActiveTab] = useState('form'); // 'form' ou 'sms'

    return (
        <div className="space-y-6">
            <div className="flex border-b">
                <button 
                    onClick={() => setActiveTab('form')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${activeTab === 'form' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <EditIcon className="h-5 w-5" />
                    Editor de Formulário
                </button>
                <button 
                    onClick={() => setActiveTab('sms')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${activeTab === 'sms' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <MessageSquareIcon className="h-5 w-5" />
                    Configurações de SMS
                </button>
            </div>

            {activeTab === 'form' && <FormEditorPage initialQuestions={initialQuestions} onFormUpdate={onRefresh} />}
            {activeTab === 'sms' && <SmsSettingsPage />}
        </div>
    );
};
