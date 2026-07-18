import { jsonError } from "@/server/http/api";

type Context = { params: Promise<{ cep: string }> };
export async function GET(_req: Request, context: Context) {
  const cep = (await context.params).cep.replace(/\D/g, "");
  if (cep.length !== 8) return jsonError("CEP invalido");
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { next: { revalidate: 86_400 } });
  if (!response.ok) return jsonError("Nao foi possivel consultar o CEP", 502);
  const data = await response.json();
  if (data.erro) return jsonError("CEP nao encontrado", 404);
  return Response.json({ zipCode: cep, street: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf });
}
