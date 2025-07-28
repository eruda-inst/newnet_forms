// src/components/settings/SmsSettingsPage.js
"use client";

import { useState, useEffect } from 'react';
import { API_ENDPOINT } from '@/lib/api';

export const SmsSettingsPage = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSmsSettings = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_ENDPOINT}/settings/sms`);
                if (!response.ok) throw new Error("Não foi possível carregar as configurações de SMS.");
                const data = await response.json();
                setIsEnabled(data.enabled);
            } catch (err) {
                setError(err.message);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSmsSettings();
    }, []);

    const handleToggle = async () => {
        const newEnabledState = !isEnabled;
        setIsEnabled(newEnabledState); // Atualiza a UI imediatamente

        try {
            const response = await fetch(`${API_ENDPOINT}/settings/sms`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: newEnabledState }),
            });
            if (!response.ok) {
                // Reverte a alteração na UI em caso de erro
                setIsEnabled(!newEnabledState);
                throw new Error("Não foi possível salvar a alteração.");
            }
        } catch (err) {
            setError(err.message);
            console.error(err);
        }
    };

    if (isLoading) {
        return <div className="text-center p-8">Carregando configurações...</div>;
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Configurações de SMS</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                    <h3 className="font-semibold text-gray-700">Notificações por SMS</h3>
                    <p className="text-sm text-gray-500">Ative para enviar lembretes e notificações por SMS aos clientes.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isEnabled} onChange={handleToggle} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-emerald-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
            </div>
        </div>
    );
};
