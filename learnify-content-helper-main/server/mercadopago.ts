import { MercadoPagoConfig } from "mercadopago";

// Configuração Mercado Pago (SDK v2.x)
const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "APP_USR-1531578128511908-112221-3269505eee8e3f7a2257d3b16043c57e-491781231"
});

export default mercadopago;
