const API_ENDPOINT = "https://forms.newnet.com.br/api";
const USER_API_KEY = "AIzaSyBE0iAa-9IQEnQGcHCbPVGsMEysTI-2lyY";

// --- DADOS SIMULADOS (MOCK) ---
const MOCK_API_DATA = {
  forms: [
    { id: 'ATD73621', clientName: 'Ana Costa', technician: 'Carlos Silva', serviceType: 'Instalação de Fibra', dateOpened: '2025-07-15T09:00:00Z', dateClosed: '2025-07-17T11:30:00Z', status: 'Respondido', satisfaction: 9, responses: [{ questionId: 'q1', answer: 9 }, { questionId: 'q2', answer: 'O serviço foi rápido e o técnico muito educado. A internet está funcionando perfeitamente.' }, { questionId: 'q3', answer: 'Sim' }, { questionId: 'q4', answer: 'https://placehold.co/400x300/10b981/FFFFFF?text=Evidência' }] },
  ],
  questions: [
    { id: 'q1', text: 'Em uma escala de 0 a 10, o quão provável você é de recomendar a Newnet para um amigo ou colega?', type: 'nps', display_order: 0 },
    { id: 'q2', text: 'O que mais influenciou sua nota?', type: 'textarea', display_order: 1 },
  ],
};

/**
 * Simula uma chamada de API para buscar os dados dos formulários.
 */
const fetchMockData = () => {
  console.log("Usando dados simulados (mock)...");
  return new Promise(resolve => {
    setTimeout(() => {
      console.log("Dados simulados recebidos.");
      resolve(JSON.parse(JSON.stringify(MOCK_API_DATA)));
    }, 800);
  });
};

/**
 * Busca e adapta dados de uma API real.
 */
export const fetchRealData = async () => {
    if (!API_ENDPOINT) return fetchMockData();

    console.log(`Buscando dados da API real em: ${API_ENDPOINT}`);
    
    const formsUrl = `${API_ENDPOINT}/forms`;
    const questionsUrl = `${API_ENDPOINT}/questions`;

    const [formsResponse, questionsResponse] = await Promise.all([
        fetch(formsUrl),
        fetch(questionsUrl)
    ]);

    if (!formsResponse.ok) throw new Error(`Erro ao buscar /forms: ${formsResponse.status}`);
    if (!questionsResponse.ok) throw new Error(`Erro ao buscar /questions: ${questionsResponse.status}`);

    const formsData = await formsResponse.json();
    const questionsData = await questionsResponse.json();

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
      .sort((a, b) => a.display_order - b.display_order);

    console.log("Dados da API real recebidos e adaptados.");
    return { forms: mappedForms, questions: mappedQuestions };
};

export { API_ENDPOINT, USER_API_KEY };