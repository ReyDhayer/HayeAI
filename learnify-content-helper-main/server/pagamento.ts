import express from "express";
import { MercadoPagoConfig, Payment, PreApproval } from "mercadopago";

// Configuração do cliente Mercado Pago com token de acesso
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || "APP_USR-1531578128511908-112221-3269505eee8e3f7a2257d3b16043c57e-491781231" });

const router = express.Router();

// Criar pagamento (boleto, cartão, pix)
router.post("/pagar", async (req, res) => {
  try {
    console.log('REQ BODY PAGAMENTO:', req.body);
    const { valor, metodo, email, docType, docNumber, cardToken, installments } = req.body;
    
    // Validar dados obrigatórios
    if (!valor || !metodo || !email) {
      return res.status(400).json({ error: 'Dados incompletos. Valor, método de pagamento e email são obrigatórios.' });
    }

    // Garantir que o valor seja um número
    const amount = Number(valor);
    if (isNaN(amount)) {
      return res.status(400).json({ error: 'O valor deve ser um número válido.' });
    }

    // Validar número do documento quando necessário
    if ((metodo === 'bolbradesco' || metodo === 'pix') && !docNumber) {
      return res.status(400).json({ error: 'Número do documento (CPF/CNPJ) é obrigatório para este método de pagamento.' });
    }

    const payment_data: any = {
      transaction_amount: amount,
      payment_method_id: metodo, // "bolbradesco", "pix", "visa", etc.
      payer: {
        email,
        identification: {
          type: docType || 'CPF',
          number: docNumber || ''
        }
      },
      description: `Pagamento Learnify - ${amount} reais`
    };

    // Adicionar dados específicos para pagamento com cartão
    if (metodo === 'visa' || metodo === 'master') {
      if (cardToken) {
        payment_data.token = cardToken;
        payment_data.installments = Number(installments) || 1;
      } else {
        return res.status(400).json({ error: 'Token do cartão é obrigatório para pagamentos com cartão.' });
      }
    }

    console.log('Dados de pagamento a serem enviados:', payment_data);
    const payment = await new Payment(client).create({ body: payment_data });
    console.log('Resposta do Mercado Pago:', payment);
    res.json(payment);

  } catch (e: any) {
    console.error('ERRO PAGAMENTO:', e);
    console.error('Detalhes do erro:', e.cause || e.stack);
    
    // Verificar se é um erro específico do Mercado Pago
    if (e.cause && Array.isArray(e.cause)) {
      const mpErrors = e.cause.map((err: any) => `${err.code}: ${err.description}`).join(', ');
      return res.status(400).json({ 
        error: 'Erro do Mercado Pago', 
        details: mpErrors
      });
    }
    
    res.status(500).json({ 
      error: e.message || 'Erro ao processar pagamento', 
      details: e.cause || e.stack || 'Sem detalhes adicionais'
    });
  }
});

// Criar assinatura
router.post("/assinatura", async (req, res) => {
  try {
    const { reason, valor, email } = req.body;
    const preapprovalData = {
      reason,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: Number(valor),
        currency_id: "BRL"
      },
      payer_email: email,
      back_url: "https://seusite.com/obrigado"
    };
    const preapproval = await new PreApproval(client).create({ body: preapprovalData });
    res.json(preapproval);

  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
