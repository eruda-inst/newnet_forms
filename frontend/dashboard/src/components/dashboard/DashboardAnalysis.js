// src/components/dashboard/DashboardAnalysis.js
"use client";

import { useState, useMemo } from 'react'; // Adicionado 'useMemo' à importação
import { USER_API_KEY } from '@/lib/api';
import { RefreshCwIcon } from '@/components/ui/Icons';

// Componente para renderizar Markdown (pode ser movido para ui/MarkdownRenderer.js)
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


export const DashboardAnalysis = ({ filteredForms, questionsData }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState("Clique em 'Analisar Feedbacks' para gerar insights com a IA.");
    const MAX_FEEDBACKS_FOR_ANALYSIS = 50;

    const analyzeFeedback = async () => {
        setIsLoading(true);
        setAnalysisResult("");

        const textResponses = filteredForms
            .filter(form => form.status === 'Respondido' && form.responses)
            .sort((a, b) => new Date(b.dateClosed) - new Date(a.dateClosed))
            .flatMap(form => form.responses
                .map(res => {
                    const question = questionsData.find(q => q.id === res.questionId);
                    if (question && (question.type === 'textarea' || question.type === 'text')) {
                        return res.answer;
                    }
                    return null;
                })
                .filter(Boolean)
            )
            .slice(0, MAX_FEEDBACKS_FOR_ANALYSIS);
        
        if (textResponses.length === 0) {
            setAnalysisResult("Nenhum feedback em texto para analisar no período selecionado.");
            setIsLoading(false);
            return;
        }

        const prompt = `
            Analise o seguinte conjunto de feedbacks de clientes da empresa de telecomunicações Newnet para o período selecionado. Esta é uma amostra dos ${textResponses.length} feedbacks mais recentes.

            Feedbacks:
            ---
            ${textResponses.map(r => `- ${r}`).join('\n')}
            ---

            Sua tarefa é:
            1. **Resumo Geral:** Crie um resumo executivo de 2 a 3 frases destacando os principais insights do período.
            2. **Temas Positivos Comuns:** Identifique e liste até 3 pontos positivos mais mencionados pelos clientes.
            3. **Pontos de Melhoria:** Identifique e liste até 3 críticas ou sugestões de melhoria mais comuns.

            Formate a sua resposta EXATAMENTE assim, usando markdown:
            **Resumo Geral:** [Seu resumo aqui]
            **Pontos Positivos Comuns:**
            - [Ponto 1]
            - [Ponto 2]
            **Pontos de Melhoria:**
            - [Ponto 1]
            - [Ponto 2]
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
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex justify-between items-center mb-2">
                 <h3 className="text-lg font-semibold text-gray-700">✨ Insights da IA</h3>
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
