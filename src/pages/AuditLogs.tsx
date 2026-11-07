import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SettingsPage } from './Settings'

/**
 * Route adapter: redirects or renders Settings with Audit tab active.
 */
export function AuditLogsPage() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/settings?tab=audit', { replace: true })
  }, [navigate])

  return <SettingsPage />
}

export default AuditLogsPage
