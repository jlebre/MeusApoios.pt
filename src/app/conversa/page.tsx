import { redirect } from "next/navigation";

// Esta página foi retirada — o produto é totalmente self-service.
// Redireciona para a subscrição de notificações.
export default function Conversa() {
  redirect("/notificacoes");
}
