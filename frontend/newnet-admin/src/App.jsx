import React, { useState, useEffect, useMemo, useRef, useLayoutEffect, useCallback } from 'react';

// ==================================================================================
// ||                                                                              ||
// ||                   *** CONFIGURAÇÃO DA APLICAÇÃO *** ||
// ||                                                                              ||
// ==================================================================================

// 1. CHAVE DA API DO GEMINI (PARA RECURSOS DE IA)
//    Para rodar a funcionalidade de IA localmente, insira sua chave da API do
//    Google AI Studio aqui. Obtenha sua chave em: https://aistudio.google.com/app/apikey
const USER_API_KEY = "AIzaSyBE0iAa-9IQEnQGcHCbPVGsMEysTI-2lyY"; // <-- INSIRA SUA CHAVE DA API AQUI

// 2. ENDEREÇO DA API DE DADOS
//    Insira o endereço BASE da sua API aqui (ex: http://localhost:8000).
//    Se esta variável estiver vazia (""), a aplicação usará os dados simulados (mock).
//    Se preenchida, tentará buscar os dados de '/forms' e '/questions' a partir deste endereço.
const API_ENDPOINT = "https://forms.newnet.com.br/api"; // <-- INSIRA O ENDEREÇO BASE DA SUA API AQUI


// ==================================================================================
// ||                                                                              ||
// ||                     CONFIGURAÇÃO DA API SIMULADA (MOCK)                        ||
// ||                                                                              ||
// ==================================================================================

const MOCK_API_DATA = {
  forms: [
    { id: 'ATD73621', clientName: 'Ana Costa', technician: 'Carlos Silva', serviceType: 'Instalação de Fibra', dateOpened: '2025-07-15T09:00:00Z', dateClosed: '2025-07-17T11:30:00Z', status: 'Respondido', satisfaction: 9, responses: [{ questionId: 'q1', answer: 9 }, { questionId: 'q2', answer: 'O serviço foi rápido e o técnico muito educado. A internet está funcionando perfeitamente.' }, { questionId: 'q3', answer: 'Sim' }, { questionId: 'q4', answer: 'https://placehold.co/400x300/10b981/FFFFFF?text=Evidência' }] },
    { id: 'ATD73622', clientName: 'Bruno Martins', technician: 'Sofia Alves', serviceType: 'Reparo de Conexão', dateOpened: '2025-07-15T14:00:00Z', dateClosed: '2025-07-17T15:00:00Z', status: 'Pendente' },
    { id: 'ATD73620', clientName: 'Mariana Lima', technician: 'Carlos Silva', serviceType: 'Upgrade de Plano', dateOpened: '2025-07-14T10:00:00Z', dateClosed: '2025-07-16T10:45:00Z', status: 'Respondido', satisfaction: 8, responses: [{ questionId: 'q1', answer: 8 }, { questionId: 'q2', answer: 'Achei que a velocidade poderia ser um pouco melhor.' }, { questionId: 'q3', answer: 'Sim' }] },
    { id: 'ATD73619', clientName: 'João Pereira', technician: 'Ricardo Dias', serviceType: 'Suporte Técnico', dateOpened: '2025-07-13T08:00:00Z', dateClosed: '2025-07-15T09:15:00Z', status: 'Não Respondido' },
    { id: 'ATD73618', clientName: 'Lúcia Fernandes', technician: 'Sofia Alves', serviceType: 'Instalação de Fibra', dateOpened: '2025-07-12T13:00:00Z', dateClosed: '2025-07-14T15:00:00Z', status: 'Respondido', satisfaction: 10, responses: [{ questionId: 'q1', answer: 10 }, { questionId: 'q2', answer: 'Atendimento impecável!' }, { questionId: 'q3', answer: 'Sim' }] },
    { id: 'ATD73617', clientName: 'Pedro Almeida', technician: 'Carlos Silva', serviceType: 'Reparo de Conexão', dateOpened: '2025-07-11T16:00:00Z', dateClosed: '2025-07-13T17:30:00Z', status: 'Recorrente' },
    { id: 'ATD73616', clientName: 'Vanessa Rocha', technician: 'Ricardo Dias', serviceType: 'Instalação de Fibra', dateOpened: '2025-07-10T09:30:00Z', dateClosed: '2025-07-12T11:00:00Z', status: 'Respondido', satisfaction: 6, responses: [{ questionId: 'q1', answer: 6 }, { questionId: 'q2', answer: 'O técnico demorou um pouco para chegar.' }, { questionId: 'q3', answer: 'Não' }] },
    { id: 'ATD73615', clientName: 'Fernando Gomes', technician: 'Sofia Alves', serviceType: 'Upgrade de Plano', dateOpened: '2025-07-10T14:00:00Z', dateClosed: '2025-07-11T14:45:00Z', status: 'Respondido', satisfaction: 9, responses: [{ questionId: 'q1', answer: 9 }, { questionId: 'q2', answer: 'Tudo certo.' }, { questionId: 'q3', answer: 'Sim' }] },
    { id: 'ATD73614', clientName: 'Carla Dias', technician: 'Ricardo Dias', serviceType: 'Suporte Técnico', dateOpened: '2025-06-20T10:00:00Z', dateClosed: '2025-06-22T11:00:00Z', status: 'Respondido', satisfaction: 7, responses: [{ questionId: 'q1', answer: 7 }, { questionId: 'q2', 'answer': 'Ok.'}, { questionId: 'q3', answer: 'Sim' }] },
  ],
  questions: [
    { id: 'q1', text: 'Em uma escala de 0 a 10, o quão provável você é de recomendar a Newnet para um amigo ou colega?', type: 'nps', display_order: 0 },
    { id: 'q2', text: 'O que mais influenciou sua nota?', type: 'textarea', display_order: 1 },
    { id: 'q3', text: 'O técnico foi pontual e profissional?', type: 'radio', options: ['Sim', 'Não'], display_order: 2 },
    { id: 'q4', text: 'Se desejar, envie uma foto ou vídeo do problema.', type: 'file', display_order: 3 }
  ],
  settings: {
    sms: { enabled: true }
  }
};

// --- FUNÇÕES DE BUSCA DE DADOS ---

/**
 * Simula uma chamada de API para buscar os dados dos formulários.
 * @returns {Promise<Object>} Uma promessa que resolve com os dados da API.
 */
const fetchMockData = () => {
  console.log("Usando dados simulados (mock)...");
  return new Promise(resolve => {
    setTimeout(() => {
      console.log("Dados simulados recebidos.");
      resolve(JSON.parse(JSON.stringify(MOCK_API_DATA))); // Retorna uma cópia profunda
    }, 800);
  });
};

/**
 * Busca e adapta dados de uma API real.
 * @param {string} baseUrl - O URL base da API.
 * @returns {Promise<Object>} Uma promessa que resolve com os dados adaptados.
 */
const fetchRealData = async (baseUrl) => {
    // NOTA PARA DESENVOLVIMENTO LOCAL:
    // Se estiver a ter um erro de 'CORS' ou 'NetworkError' no seu browser ao tentar
    // conectar-se à sua API local (ex: http://localhost:8000 ou um IP),
    // é uma restrição de segurança normal do browser.
    // Para contornar isto APENAS em ambiente de desenvolvimento, pode usar
    // uma extensão de browser que desabilite o CORS, como "CORS Unblock" ou "Allow CORS".
    // Lembre-se de desativar a extensão quando não estiver a desenvolver.
    console.log(`Buscando dados da API real em: ${baseUrl}`);
    
    const formsUrl = `${baseUrl}/forms`;
    const questionsUrl = `${baseUrl}/questions`;

    // Busca os dados de /forms e /questions em paralelo
    const [formsResponse, questionsResponse] = await Promise.all([
        fetch(formsUrl),
        fetch(questionsUrl)
    ]);

    if (!formsResponse.ok) throw new Error(`Erro ao buscar /forms: ${formsResponse.status}`);
    if (!questionsResponse.ok) throw new Error(`Erro ao buscar /questions: ${questionsResponse.status}`);

    const formsData = await formsResponse.json();
    const questionsData = await questionsResponse.json();

    // Adapta (mapeia) os dados da API para o formato esperado pela aplicação
    const mappedForms = formsData.map(form => ({
        id: form.id,
        clientName: form.client_name,
        technician: form.technician,
        serviceType: form.service_type,
        dateOpened: form.date_opened,
        dateClosed: form.date_closed,
        status: form.status,
        satisfaction: form.satisfaction,
        responses: form.responses || [],
    }));

    const mappedQuestions = questionsData
      .map(q => ({
          id: q.id,
          text: q.question_text,
          type: q.question_type,
          options: q.options || [],
          display_order: q.display_order
      }))
      .sort((a, b) => a.display_order - b.display_order); // Garante a ordenação inicial

    console.log("Dados da API real recebidos e adaptados.");
    return { forms: mappedForms, questions: mappedQuestions };
};


// --- HOOKS PERSONALIZADOS ---

// Hook para debounce (atrasar a execução de uma função)
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


// Hook de Animação
const useAnimatedData = (data, keyField = 'name', duration = 500) => {
    const [animatedData, setAnimatedData] = useState(data);
    const frameRef = useRef();
    const previousDataRef = useRef(JSON.parse(JSON.stringify(data)));

    useEffect(() => {
        const startTime = performance.now();
        
        const prevDataMap = new Map(previousDataRef.current.map(d => [d[keyField], d]));
        const currentDataMap = new Map(data.map(d => [d[keyField], d]));
        
        const allKeys = new Set([...prevDataMap.keys(), ...currentDataMap.keys()]);

        const animate = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            const frameData = Array.from(allKeys).map(key => {
                const prevPoint = prevDataMap.get(key) || { [keyField]: key, value: 0, ...data.find(d => d[keyField] === key) };
                const currentPoint = currentDataMap.get(key) || { [keyField]: key, value: 0, ...prevPoint };
                
                const value = (prevPoint.value || 0) + ((currentPoint.value || 0) - (prevPoint.value || 0)) * progress;
                
                return { ...currentPoint, value };
            }).filter(d => currentDataMap.has(d[keyField]) || progress < 1);

            setAnimatedData(frameData);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                setAnimatedData(data);
                previousDataRef.current = JSON.parse(JSON.stringify(data));
            }
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(frameRef.current);
    }, [data, duration, keyField]);

    return animatedData;
};


// --- ÍCONES EM SVG ---
const HomeIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> );
const FileTextIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg> );
const BarChartIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" /></svg> );
const CheckCircleIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> );
const ClockIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> );
const AlertCircleIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg> );
const StarIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> );
const SettingsIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg> );
const GripVerticalIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="9" cy="12" r="1" /><circle cx="9" cy="5" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="19" r="1" /></svg> );
const TrashIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg> );
const XIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> );
const DownloadIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> );
const SyncIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> );
const CloudCheckIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><path d="m9 12 2 2 4-4"/></svg> );
const MessageSquareIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> );
const EditIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> );
const RefreshCwIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg> );


// --- COMPONENTES DA UI ---

const StatCard = ({ title, value, icon, subtext }) => ( <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"><div className="flex items-center justify-between"><h3 className="text-sm font-medium text-gray-500">{title}</h3><div className="text-emerald-500">{icon}</div></div><div className="mt-4"><p className="text-3xl font-bold text-gray-800">{value}</p>{subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}</div></div> );
const StatusBadge = ({ status }) => { const styles = { 'Respondido': 'bg-green-100 text-green-800', 'Pendente': 'bg-yellow-100 text-yellow-800', 'Recorrente': 'bg-orange-100 text-orange-800', 'Não Respondido': 'bg-red-100 text-red-800', }; return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>; };

const Sidebar = ({ activePage, setActivePage }) => (
    <aside className="w-64 bg-white p-4 flex-shrink-0 border-r border-gray-200 flex flex-col">
        <div className="flex items-center mb-8 px-2">
            <img src="https://www.newnet.com.br/assets/logo-BEoMyD68.svg" alt="Logo Newnet" className="h-8 w-auto"/>
        </div>
        <nav className="space-y-2">
            <NavItem icon={<HomeIcon />} label="Dashboard" active={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} />
            <NavItem icon={<FileTextIcon />} label="Formulários" active={activePage === 'forms'} onClick={() => setActivePage('forms')} />
            <NavItem icon={<BarChartIcon />} label="Análises" active={activePage === 'analytics'} onClick={() => setActivePage('analytics')} />
            <NavItem icon={<SettingsIcon />} label="Configurações" active={activePage === 'settings'} onClick={() => setActivePage('settings')} />
        </nav>
        <div className="mt-auto p-4 bg-emerald-50 rounded-lg text-center">
            <p className="text-sm text-emerald-800">Precisa de ajuda?</p>
            <p className="text-xs text-emerald-600 mt-1">Consulte nossa documentação.</p>
        </div>
    </aside>
);

const NavItem = ({ icon, label, active, onClick }) => ( <button onClick={onClick} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${ active ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100' }`}><div className="mr-3">{icon}</div><span>{label}</span></button> );

// --- COMPONENTES DE GRÁFICO ---

const SimpleBarChart = ({ data, colors, onBarClick }) => {
    const animatedData = useAnimatedData(data, 'name');
    const maxValue = useMemo(() => Math.max(...animatedData.map(d => d.value), 1), [animatedData]);
    return (
        <div className="w-full h-64 flex items-end justify-between px-2 pt-8 relative">
             {animatedData.map((item, index) => (
                <div key={item.name} className="h-full w-full flex flex-col items-center justify-end group relative px-1" onClick={() => onBarClick && onBarClick(item.name)}>
                    <div className="absolute -top-6 bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.name}: {item.value.toFixed(1)}
                    </div>
                    <div 
                        className={`w-full max-w-8 rounded-t-md transition-all duration-300 ${onBarClick ? 'cursor-pointer' : ''}`}
                        style={{ 
                            height: `${(item.value / maxValue) * 100}%`,
                            backgroundColor: colors[index % colors.length]
                        }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-1">{item.name}</span>
                </div>
            ))}
        </div>
    );
};

const SimplePieChart = ({ data, colors }) => {
    const animatedData = useAnimatedData(data, 'name');
    const total = useMemo(() => animatedData.reduce((sum, item) => sum + item.value, 0), [animatedData]);
    if (total === 0) {
        return <div className="w-full h-64 flex items-center justify-center text-gray-500">Sem dados para exibir</div>;
    }
    let cumulativePercent = 0;

    const segments = animatedData.map((item) => {
        const percent = (item.value / total) * 100;
        const startAngle = cumulativePercent;
        cumulativePercent += percent;
        const endAngle = cumulativePercent;
        return { percent, startAngle, endAngle, name: item.name, value: item.value };
    });

    return (
        <div className="w-full flex flex-col md:flex-row items-center justify-center p-4">
            <div className="w-48 h-48 rounded-full" style={{ background: `conic-gradient(${
                segments.map((s, i) => `${colors[i % colors.length]} ${s.startAngle}% ${s.endAngle}%`).join(', ')
            })`}}></div>
            <div className="ml-0 md:ml-6 mt-4 md:mt-0">
                <ul className="space-y-2">
                    {animatedData.map((item, index) => (
                        <li key={item.name} className="flex items-center text-sm">
                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[index % colors.length] }}></span>
                            <span className="text-gray-700">{item.name}:</span>
                            <span className="font-semibold ml-1">{item.value.toFixed(1)}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const SimpleLineChart = ({ data, color }) => {
    const animatedData = useAnimatedData(data, 'label');
    const padding = 40;
    const width = 500;
    const height = 250;

    const maxValue = useMemo(() => Math.max(...animatedData.map(d => d.value), 0), [animatedData]);
    const minValue = useMemo(() => Math.min(...animatedData.map(d => d.value), 0), [animatedData]);

    const getX = (index) => {
        if (animatedData.length <= 1) return padding;
        return padding + (index / (animatedData.length - 1)) * (width - padding * 2);
    };

    const getY = (value) => {
        if (maxValue === minValue) return height / 2;
        return height - padding - ((value - minValue) / (maxValue - minValue)) * (height - padding * 2);
    };

    const linePath = animatedData.map((point, index) => `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(point.value)}`).join(' ');

    return (
        <div className="w-full h-64 relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                {/* Y-axis labels */}
                <text x={padding - 10} y={getY(maxValue)} textAnchor="end" alignmentBaseline="middle" className="text-xs fill-gray-500">{maxValue.toFixed(0)}</text>
                <text x={padding - 10} y={getY(minValue)} textAnchor="end" alignmentBaseline="middle" className="text-xs fill-gray-500">{minValue.toFixed(0)}</text>
                
                {/* X-axis labels */}
                {animatedData.map((point, index) => (
                    <text key={index} x={getX(index)} y={height - padding + 15} textAnchor="middle" className="text-xs fill-gray-500">{point.label}</text>
                ))}

                <path d={linePath} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                
                {animatedData.map((point, index) => (
                    <circle key={index} cx={getX(index)} cy={getY(point.value)} r="4" fill={color} />
                ))}
            </svg>
        </div>
    );
};


// --- PÁGINAS DA APLICAÇÃO ---

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


const DashboardAnalysis = ({ filteredForms, questionsData }) => {
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

const DashboardPage = ({ formsData, questionsData, onNavigate, timeFilter }) => {
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


const FormDetailModal = ({ form, onClose, isLoading }) => {
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
                                const questionText = response.question_text;
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

const FormsListPage = ({ formsData, questionsData, initialFilters, onFiltersChange }) => {
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

const AnalyticsPage = ({ formsData, questionsData }) => {
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

const AnalyticsAnalysis = ({ formsData, questionsData }) => {
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

const SettingsPage = ({ initialQuestions, onRefresh }) => {
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

const FormEditorPage = ({ initialQuestions, onFormUpdate }) => {
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

const DraggableQuestion = ({ question, index, onQuestionChange, onRemove, draggedIdx, onDragStart, onDrop, questionTypes }) => {
    
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

const SmsSettingsPage = () => {
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


// --- COMPONENTE PRINCIPAL DA APLICAÇÃO ---
export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [appData, setAppData] = useState({ forms: [], questions: [] });
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [error, setError] = useState(null);
  const [pageFilters, setPageFilters] = useState({
      time: 'all',
      technician: 'all',
      nps: 'all',
      status: 'all'
  });
  const [timeFilter, setTimeFilter] = useState('all');

  const loadData = useCallback(async () => {
      setIsRefreshing(true);
      setError(null);
      try {
          const data = API_ENDPOINT ? await fetchRealData(API_ENDPOINT) : await fetchMockData();
          setAppData(data);
      } catch (err) {
          console.error("Falha ao carregar dados:", err);
          setError(err.message);
      } finally {
          setIsRefreshing(false);
      }
  }, []);

  useEffect(() => {
    loadData(); // Carga na mudança de página e na carga inicial
    const intervalId = setInterval(loadData, 10000); // Recarrega a cada 10 segundos
    return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar ou ao re-executar o efeito
  }, [activePage, loadData]); 
  
  const handleNavigate = (page, newFilters = {}) => {
      setPageFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
      setActivePage(page);
  };

  const pageTitles = {
      dashboard: "Dashboard",
      forms: "Todos os Formulários",
      analytics: "Análises de Performance",
      settings: "Configurações"
  };

  const renderContent = () => {
    if (error && !appData.forms.length) { // Mostra erro apenas se não houver dados para exibir
        return <div className="flex items-center justify-center h-full"><p className="text-red-500">Erro ao carregar dados: {error}</p></div>;
    }
    switch (activePage) {
      case 'dashboard': return <DashboardPage formsData={appData.forms} questionsData={appData.questions} onNavigate={handleNavigate} timeFilter={timeFilter} />;
      case 'forms': return <FormsListPage formsData={appData.forms} questionsData={appData.questions} initialFilters={pageFilters} onFiltersChange={setPageFilters} />;
      case 'analytics': return <AnalyticsPage formsData={appData.forms} questionsData={appData.questions} />;
      case 'settings': return <SettingsPage initialQuestions={appData.questions} onRefresh={loadData} />;
      default: return <DashboardPage formsData={appData.forms} questionsData={appData.questions} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            } 
            @keyframes slide-up {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            .animate-spin {
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `}</style>
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold text-gray-800 transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>{pageTitles[activePage]}</h2>
            {activePage === 'dashboard' && (
                <div className="flex items-center space-x-2">
                    <button onClick={() => setTimeFilter('7d')} className={`px-3 py-1 text-sm rounded-md ${timeFilter === '7d' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700'}`}>7 dias</button>
                    <button onClick={() => setTimeFilter('30d')} className={`px-3 py-1 text-sm rounded-md ${timeFilter === '30d' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700'}`}>30 dias</button>
                    <button onClick={() => setTimeFilter('all')} className={`px-3 py-1 text-sm rounded-md ${timeFilter === 'all' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Tudo</button>
                </div>
            )}
        </div>
        {renderContent()}
      </main>
    </div>
  );
}
