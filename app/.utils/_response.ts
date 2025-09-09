type JsonInit = number | ResponseInit;

export const jsonError = (message: string, status = 400) =>
  Response.json({ error: message, status }, { status });

export const jsonOk = (data: Record<string, any>, status = 200, init?: JsonInit) =>
  Response.json({ ...data, status }, typeof init === 'number' ? { status: init } : init ?? { status });

