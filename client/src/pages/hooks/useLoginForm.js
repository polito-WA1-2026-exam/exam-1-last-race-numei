import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { debounce } from '../util.js'
import { useAuth } from './useAuth.js'

export function useLoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const returnPath = location.state?.from?.pathname ?? '/setup'

  const handleChange = (field) => (event) => {
    setCredentials((current) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  const submitLogin = useMemo(
    () =>
      debounce(async (nextCredentials) => {
        try {
          await login(nextCredentials)
          navigate(returnPath, { replace: true })
        } catch (err) {
          setError(err.message)
        } finally {
          setSubmitting(false)
        }
      }, 250),
    [login, navigate, returnPath],
  )

  useEffect(() => () => submitLogin.cancel(), [submitLogin])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (submitting) return

    setError('')
    setSubmitting(true)
    submitLogin({ ...credentials })
  }

  return {
    credentials,
    error,
    handleChange,
    handleSubmit,
    submitting,
  }
}
