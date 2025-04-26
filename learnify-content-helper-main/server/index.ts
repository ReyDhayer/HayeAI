import express from "express";
import pagamentoRouter from "./pagamento";

const app = express();
app.use(express.json());

// Rota para pagamentos
app.use("/api/pagamento", pagamentoRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
