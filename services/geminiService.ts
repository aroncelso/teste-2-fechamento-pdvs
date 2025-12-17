import { GoogleGenAI } from "@google/genai";
import { FinancialData, CalculationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateClosingReport = async (
  data: FinancialData,
  results: CalculationResult
): Promise<string> => {
  try {
    const prompt = `
      Atue como um gerente financeiro sênior experiente. Analise os dados de fechamento de caixa (PDV) abaixo e forneça um relatório conciso e profissional em Português do Brasil.

      **Dados do Fechamento:**
      - Fundo de Caixa Inicial: R$ ${data.openingBalance.toFixed(2)}
      - Vendas em Dinheiro: R$ ${data.salesCash.toFixed(2)}
      - Vendas em Cartão (Crédito/Débito/Voucher): R$ ${(data.salesCredit + data.salesDebit + data.salesVoucher).toFixed(2)}
      - Vendas via PIX: R$ ${data.salesPix.toFixed(2)}
      - Sangrias/Despesas: R$ ${data.expenses.toFixed(2)}
      - Contagem Física de Dinheiro: R$ ${data.closingCount.toFixed(2)}

      **Resultados Calculados:**
      - Faturamento Total: R$ ${results.totalRevenue.toFixed(2)}
      - Dinheiro Esperado no Sistema: R$ ${results.totalSystemCash.toFixed(2)}
      - Diferença de Caixa: R$ ${results.difference.toFixed(2)} (${results.status})

      **Instruções:**
      1. Comece com uma saudação profissional e um resumo rápido do faturamento.
      2. Analise a diferença de caixa. Se houver quebra (falta) ou sobra, ofereça uma possível explicação lógica ou recomendação de segurança.
      3. Dê uma dica rápida baseada no mix de vendas (ex: se muito PIX, sugerir manter QR code visível; se muito dinheiro, cuidado com segurança).
      4. Use formatação Markdown (negrito, tópicos) para facilitar a leitura.
      5. Mantenha o tom encorajador mas fiscalmente responsável.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Fast response needed
      }
    });

    return response.text || "Não foi possível gerar a análise no momento.";
  } catch (error) {
    console.error("Erro ao gerar análise:", error);
    throw new Error("Falha na comunicação com a IA.");
  }
};