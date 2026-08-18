# Tokens na prática: o teste do strawberry 🍓

> **Do treinamento:** "O modelo não lê letras. Lê tokens."

Esta é a demo que fizemos direto na API para mostrar por que um LLM tropeça em
algo que parece trivial — contar quantas letras **R** existem em *strawberry*.
O modelo nunca viu as letras: ele enxerga a palavra quebrada em tokens
(`str` + `aw` + `berry`, por exemplo). Por isso ele erra contagem de
caracteres, e por isso a conta da API chega em tokens — eles são a unidade de
custo, de contexto e de velocidade.

Para rodar os exemplos você precisa de uma chave da OpenAI exportada no
terminal:

```bash
export OPENAI_API_KEY=sk-...
```

## 1. Chamada direta — o modelo erra

Sem espaço para "pensar", o modelo responde no reflexo e frequentemente diz
**2**:

```bash
curl -s https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4.1-mini",
    "temperature": 0,
    "messages": [
      { "role": "user", "content": "Quantas letras R existem na palavra strawberry? Responda APENAS com o número, sem explicar." }
    ]
  }' | jq -r '.choices[0].message.content'
```

## 2. Pedindo para raciocinar antes de responder

Uma única frase a mais ("raciocine bem antes de responder") dá ao modelo
espaço para escrever o passo a passo — e escrever *é* o raciocínio dele.
A taxa de acerto muda visivelmente:

```bash
curl -s https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4.1-mini",
    "temperature": 0,
    "messages": [
      { "role": "user", "content": "Quantas letras R existem na palavra strawberry? Raciocine bem antes de responder." }
    ]
  }' | jq -r '.choices[0].message.content'
```

## 3. A API não tem memória: o histórico vai junto

Cada chamada é independente. Quem "lembra" da conversa é você, reenviando o
histórico inteiro a cada requisição — inclusive as respostas do próprio
modelo. É assim que todo chat funciona por baixo:

```bash
curl -s https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4.1-mini",
    "temperature": 0,
    "messages": [
      { "role": "user", "content": "Quantas letras R existem na palavra strawberry?" },
      { "role": "assistant", "content": "Existem 2 letras r em strawberry" },
      { "role": "user", "content": "Tem certeza?" }
    ]
  }' | jq -r '.choices[0].message.content'
```

## 4. Modelos com reasoning nativo

Nos modelos mais novos o raciocínio virou parâmetro: você escolhe quanto
esforço o modelo gasta pensando antes de responder (o mesmo conceito de
*effort* que vimos no Claude):

```bash
curl -s https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.6-luna",
    "reasoning": { "effort": "medium", "summary": "auto" },
    "input": [
      { "role": "user", "content": "Quantas letras R existem em: strawberry?" }
    ]
  }'
```

## O que levar disso

- Tokens são a lente do modelo: ele nunca viu as letras.
- "Pensar antes de responder" não é mágica — é dar espaço (e tokens) para o
  raciocínio acontecer.
- A API é stateless: contexto é você quem monta, e ele custa a cada chamada.
