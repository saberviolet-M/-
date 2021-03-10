// token相关
const tokenKey = 'mobile-token'

export const setToken = tokenObj => {
  localStorage.setItem(tokenKey, JSON.stringify(tokenObj))
}

export const getToken = () => {
  return JSON.parse(localStorage.getItem(tokenKey)) || {}
}

export const delToken = () => {
  localStorage.removeItem(tokenKey)
}

// history 相关
const history = 'history'

export const setHistory = tokenObj => {
  localStorage.setItem(history, JSON.stringify(tokenObj))
}

export const getHistory = () => {
  return JSON.parse(localStorage.getItem(history)) || []
}

export const delHistory = () => {
  localStorage.removeItem(history)
}
