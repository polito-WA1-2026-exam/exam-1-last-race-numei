const API_URL = 'http://localhost:3001/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error ?? 'Request failed')
  }

  if (response.status === 204) return undefined
  const text = await response.text()
  return text ? JSON.parse(text) : undefined
}

export const API = {
  getCurrentUser: () => request('/sessions/current'),
  login: (credentials) =>
    request('/sessions', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  logout: () =>
    request('/sessions/current', {
      method: 'DELETE',
    }),
}
