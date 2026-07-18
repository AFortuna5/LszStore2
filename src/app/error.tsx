"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="pt-BR"><body className="grid min-h-screen place-items-center bg-black p-6 text-center text-white"><main><p className="text-sm font-bold uppercase text-neon-blue">LSZ Store</p><h1 className="mt-3 text-3xl font-black uppercase">Algo deu errado</h1><p className="mt-3 text-silver">Nossa equipe pode verificar o ocorrido. Tente novamente em instantes.</p><button onClick={reset} className="mt-6 rounded bg-neon-blue px-6 py-3 font-bold uppercase text-black">Tentar novamente</button></main></body></html>;
}
