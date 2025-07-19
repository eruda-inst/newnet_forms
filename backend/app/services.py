# app/services.py
import requests
import os

def enviar_sms_disparo_pro(telefone: str, mensagem: str) -> bool:
    """
    Envia um SMS usando a API da Disparo PRO.

    Retorna True se o envio foi bem-sucedido, False caso contrário.
    """
    api_key = os.getenv("DISPAROPRO_API_KEY")
    url_api = "https://api.disparopro.com/v1/sms/send"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "to": telefone,
        "message": mensagem
    }

    try:
        print(f"Enviando SMS de lembrete para o número: {telefone}")
        response = requests.post(url_api, json=payload, headers=headers, timeout=10)
        
        # Verifica se a requisição foi bem-sucedida (código de status 2xx)
        response.raise_for_status()
        
        print("SMS enviado com sucesso!")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Erro ao enviar SMS para {telefone}: {e}")
        return False