// ==================================================================================
// ||                                                                              ||
// ||              *** ARQUIVO: src/components/analytics/AnalyticsAnalysis.js *** ||
// ||                                                                              ||
// ==================================================================================
"use client";

import { useState, useMemo } from 'react';
import { USER_API_KEY } from '@/lib/api';
import { RefreshCwIcon } from '@/components/ui/Icons';

const MarkdownRenderer = ({ content }) => {
    const htmlContent = useMemo(() => {
        if (!content) return '';
        const lines = content.split('\n');
        let html = '';
        let inList = false;

        lines.forEach(line => {
            line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
            if (line.startsWith('- ')) {
                if (!inList) {
                    html += '<ul>';
                    inList = true;
                }
                html += `<li class="ml-4 list-disc">${line.substring(2)}</li>`;
            } else {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                if (line.trim() !== '') {
                    html += `<p>${line}</p>`;
                }
            }
        });

        if (inList) {
            html += '</ul>';
        }
        return html;
    }, [content]);

    return <div className="text-sm text-gray-800 space-y-3" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export const AnalyticsAnalysis = ({ formsData, questionsData }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState("Clique em 'Analisar Feedbacks' para gerar insights com a IA.");
    const MAX_FEEDBACKS_FOR_ANALYSIS = 50;

    const analyzeFeedback = async () => {
        setIsLoading(true);
        setAnalysisResult("");

        const answeredForms = formsData
            .filter(f => f.status === 'Respondido' && f.responses)
            .sort((a, b) => new Date(b.dateClosed) - new Date(a.dateClosed));

        if (answeredForms.length === 0) {
            setAnalysisResult("Nenhum feedback para analisar.");
            setIsLoading(false);
            return;
        }

        const feedbackByTechnician = answeredForms.reduce((acc, form) => {
            const textResponse = form.responses.find(r => {
                const q = questionsData.find(q => q.id === r.questionId);
                return q && (q.type === 'textarea' || q.type === 'text');
            });
            if (textResponse) {
                if (!acc[form.technician]) {
                    acc[form.technician] = [];
                }
                acc[form.technician].push(textResponse.answer);
            }
            return acc;
        }, {});

        let feedbackText = "";
        for (const tech in feedbackByTechnician) {
            const recentFeedbacks = feedbackByTechnician[tech].slice(0, MAX_FEEDBACKS_FOR_ANALYSIS / Object.keys(feedbackByTechnician).length);
            feedbackText += `\nFeedback para o técnico ${tech}:\n` + recentFeedbacks.map(fb => `- ${fb}`).join('\n');
        }


        const prompt = `
            Você é um analista de dados para a Newnet, uma empresa de telecomunicações. Analise o seguinte conjunto de feedbacks de clientes, agrupados por técnico.

            Feedbacks:
            ---
            ${feedbackText}
            ---

            Sua tarefa é:
            1. **Análise Comparativa:** Compare o feedback entre os técnicos. Quem está recebendo os melhores elogios e por quê? Existem reclamações recorrentes para algum técnico específico?
            2. **Insights Chave:** Identifique 2-3 insights principais que a gerência deveria saber sobre a performance da equipe técnica.

            Formate a sua resposta EXATAMENTE assim, usando markdown:
            **Análise Comparativa:** [Sua análise aqui, comparando os técnicos]
            **Insights Chave:**
            - [Insight 1]
            - [Insight 2]
        `;

        try {
            let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
            const payload = { contents: chatHistory };
            const apiKey = USER_API_KEY || "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content.parts[0].text) {
                const text = result.candidates[0].content.parts[0].text;
                setAnalysisResult(text);
            } else {
                setAnalysisResult("Não foi possível analisar o feedback. Verifique sua chave de API e tente novamente.");
            }
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            setAnalysisResult("Ocorreu um erro ao conectar com a IA. Verifique o console.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 col-span-1 lg:col-span-2">
            <div className="flex justify-between items-center mb-2">
                 <h3 className="text-lg font-semibold text-gray-700">✨ Análise de Performance da Equipe</h3>
                 <button 
                    onClick={analyzeFeedback} 
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    <RefreshCwIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'Analisando...' : 'Analisar Feedbacks'}
                 </button>
            </div>
            {isLoading ? (
                <div className="space-y-4 animate-pulse p-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
            ) : (
                <MarkdownRenderer content={analysisResult} />
            )}
        </div>
    );
};
