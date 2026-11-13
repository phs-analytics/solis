export interface Status {
  configurado: boolean;
  desbloqueado: boolean;
  autenticado: boolean;
}

export async function getStatus(): Promise<Status> {
  return (await fetch('/api/status')).json() as Promise<Status>;
}

export async function post(
  url: string,
  body: object = {},
): Promise<{ ok: boolean; status: number; data: Record<string, string> }> {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return {
    ok: r.ok,
    status: r.status,
    data: (await r.json().catch(() => ({}))) as Record<string, string>,
  };
}
