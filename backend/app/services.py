# app/services.py
import requests
import os

def enviar_sms_disparo_pro(telefone: str, mensagem: str) -> bool:
    """
    Envia um SMS usando a API da Disparo PRO.

    Retorna True se o envio foi bem-sucedido, False caso contrário.
    """
    api_key = os.getenv("DISPAROPRO_API_KEY")
    parceiro_id = os.getenv("DISPAROPRO_PARCEIRO_ID")
    url_api = "https://apihttp.disparopro.com.br:8433/mt"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = [
      {
        "numero": telefone,
        "servico": "short", # Valor fixo do exemplo
        "mensagem": mensagem,
        "parceiro_id": parceiro_id,
        "codificacao": "0" # Valor fixo do exemplo
      }
    ]

    if not all([api_key, parceiro_id]):
        print("Erro: API Key ou Parceiro ID da Disparo PRO não definidos no .env")
        return False

    try:
        print(f"Enviando SMS de lembrete para o número: {telefone}")
        response = requests.post(url_api, json=payload, headers=headers, timeout=10)
        
        response.raise_for_status()
        
        print(f"SMS enviado com sucesso! Resposta da API: {response.text}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Erro ao enviar SMS para {telefone}: {e}")
        # Se houver um erro de resposta da API, imprime o corpo do erro
        if e.response is not None:
            print(f"Detalhe do erro da API: {e.response.text}")
        return False