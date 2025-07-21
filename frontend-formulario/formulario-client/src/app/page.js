'use client';

import React, { useState, useEffect } from 'react';

// --- CONFIGURAÇÃO DA API ---
// Altere este endpoint para o seu ambiente de produção ou desenvolvimento.
const API_BASE_URL = 'http://187.103.0.138:8000';

// --- COMPONENTES AUXILIARES ---

/**
 * Componente para exibir um spinner de carregamento.
 */
const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center h-screen bg-gray-50 text-center">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
    <p className="mt-4 text-lg text-gray-700">Carregando formulário...</p>
  </div>
);

/**
 * Componente para exibir mensagens de erro de forma clara.
 * @param {{ message: string, details?: string }} props
 */
const ErrorDisplay = ({ message, details }) => (
  <div className="flex flex-col justify-center items-center h-screen bg-red-50 p-4 text-center">
    <div className="bg-white p-8 rounded-lg shadow-md max-w-sm w-full">
        <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h2 className="mt-4 text-2xl font-bold text-red-800">Ocorreu um Erro</h2>
        <p className="mt-2 text-red-600">{message}</p>
        {details && <p className="mt-1 text-xs text-gray-500">{details}</p>}
    </div>
  </div>
);

/**
 * Componente para a tela de sucesso após o envio.
 */
const SuccessDisplay = () => (
    <div className="flex flex-col justify-center items-center h-screen bg-green-50 p-4 text-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-sm w-full">
            <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h2 className="mt-4 text-2xl font-bold text-green-800">Obrigado!</h2>
            <p className="mt-2 text-gray-700">Seu feedback foi enviado com sucesso e nos ajudará a melhorar nossos serviços.</p>
        </div>
    </div>
);


// --- COMPONENTE PRINCIPAL DA PÁGINA (PARA NEXT.JS) ---
// Este componente deve ser salvo como `app/forms/[attendanceId]/page.jsx`
const FeedbackPage = ({ params }) => {
  // O ID é pego dos parâmetros da rota, fornecidos pelo Next.js
  const { attendanceId } = params;

  // Estados para controlar o fluxo da aplicação
  const [status, setStatus] = useState('loading'); // loading, error, ready, submitting, success
  const [errorInfo, setErrorInfo] = useState({ message: '', details: '' });
  const [submissionError, setSubmissionError] = useState(null);
  
  // Estados para os dados da API
  const [attendance, setAttendance] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  // Efeito para buscar os dados iniciais (detalhes do atendimento e perguntas)
  useEffect(() => {
    if (!attendanceId) {
      // Isso não deve acontecer se a estrutura de arquivos estiver correta
      setStatus('error');
      setErrorInfo({ message: 'ID do atendimento não fornecido na URL.' });
      return;
    }

    const fetchData = async () => {
      setStatus('loading');
      try {
        const [attendanceResponse, questionsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/forms`),
          fetch(`${API_BASE_URL}/questions`)
        ]);

        if (!attendanceResponse.ok) throw new Error(`Falha ao buscar atendimentos (status: ${attendanceResponse.status})`);
        if (!questionsResponse.ok) throw new Error(`Falha ao buscar perguntas (status: ${questionsResponse.status})`);

        const allAttendances = await attendanceResponse.json();
        const allQuestions = await questionsResponse.json();

        const currentAttendance = allAttendances.find(att => att.id === attendanceId);
        
        if (!currentAttendance) {
          throw new Error('Atendimento não encontrado. Verifique o ID.');
        }

        setAttendance(currentAttendance);
        setQuestions(allQuestions);
        setStatus('ready');

      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setStatus('error');
        setErrorInfo({ message: 'Não foi possível carregar os dados do formulário.', details: err.message });
      }
    };

    fetchData();
  }, [attendanceId]); // A dependência agora é o ID dos parâmetros

  // Função para lidar com a alteração de valores nos inputs do formulário
  const handleAnswerChange = (questionId, value) => {
    setSubmissionError(null); // Limpa erros de submissão anteriores ao interagir novamente
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  // Função para enviar o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setSubmissionError(null);
    
    const submissionData = {
      attendance_id: attendance.id,
      answers: Object.entries(answers).map(([question_id, answer_value]) => ({
        question_id: question_id,
        answer_value: String(answer_value),
      })),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData?.detail?.[0]?.msg || 'Ocorreu um erro desconhecido no servidor.';
        throw new Error(errorMessage);
      }
      
      setStatus('success');

    } catch (err) {
      console.error("Erro ao enviar feedback:", err);
      setSubmissionError(err.message); // Exibe o erro de submissão na UI
      setStatus('ready'); // Volta ao estado 'ready' para permitir nova tentativa
    }
  };
  
  // Função para renderizar cada tipo de pergunta
  const renderQuestion = (q) => {
    const commonLabelClasses = "block text-gray-800 font-medium mb-3 text-base";
    
    switch (q.question_type) {
      case 'nps':
        return (
          <div key={q.id} className="mb-8">
            <label className={commonLabelClasses}>{q.question_text}</label>
            <div className="flex flex-wrap justify-center gap-2" role="group" aria-label={q.question_text}>
              {[...Array(11).keys()].map(num => (
                <button
                  type="button"
                  key={num}
                  onClick={() => handleAnswerChange(q.id, num)}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full text-sm font-semibold transition-all duration-200 transform focus:outline-none focus:ring-4 focus:ring-blue-300 ${
                    answers[q.id] === num
                      ? 'bg-blue-600 text-white scale-110 shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-blue-200 hover:scale-105'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        );
      case 'textarea':
        return (
          <div key={q.id} className="mb-8">
            <label htmlFor={q.id} className={commonLabelClasses}>{q.question_text}</label>
            <textarea
              id={q.id}
              rows="4"
              value={answers[q.id] || ''}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm"
              placeholder="Sua opinião é muito importante..."
            ></textarea>
          </div>
        );
      case 'radio':
        return (
          <div key={q.id} className="mb-8">
            <fieldset>
              <legend className={commonLabelClasses}>{q.question_text}</legend>
              <div className="flex flex-col sm:flex-row gap-3">
                {q.options.map(option => (
                  <label key={option} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 w-full ${answers[q.id] === option ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' : 'border-gray-300 hover:border-blue-400'}`}>
                    <input
                      type="radio"
                      name={q.id}
                      value={option}
                      checked={answers[q.id] === option}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-gray-800 font-medium">{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        );
      default:
        return <p key={q.id}>Tipo de pergunta não suportado: {q.question_type}</p>;
    }
  };

  // Renderização condicional baseada no estado da aplicação
  if (status === 'loading') return <LoadingSpinner />;
  if (status === 'error') return <ErrorDisplay message={errorInfo.message} details={errorInfo.details} />;
  if (status === 'success') return <SuccessDisplay />;

  return (
    <div className="bg-gray-100 min-h-screen font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-3xl mx-auto mb-6 text-center">
        <img src="https://www.newnet.com.br/assets/logo-BEoMyD68.svg" alt="Logo Newnet" className="h-10 sm:h-12 mx-auto" />
      </header>
      
      <main className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-3xl">
        <div className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">Olá, <span className="text-blue-600">{attendance?.client_name}!</span></h1>
          <p className="text-gray-600 mt-2 text-base">
            Por favor, avalie o atendimento de suporte realizado pelo técnico <span className="font-semibold">{attendance?.technician}</span> para o serviço de <span className="font-semibold">{attendance?.service_type}</span>.
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {questions.map(renderQuestion)}
          
          {submissionError && (
            <div className="my-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
              <p><strong>Falha ao enviar:</strong> {submissionError}</p>
            </div>
          )}

          <div className="mt-8">
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {status === 'submitting' && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {status === 'submitting' ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
          </div>
        </form>
      </main>

      <footer className="text-center mt-8">
        <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Newnet. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default FeedbackPage;
