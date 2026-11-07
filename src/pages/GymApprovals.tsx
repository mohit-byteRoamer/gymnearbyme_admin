import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GymsPage } from './Gyms'

/**
 * Route adapter: redirects or renders Gyms with Pending tab active.
 */
export function GymApprovalsPage() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/gyms?tab=pending', { replace: true })
  }, [navigate])

  return <GymsPage />
}

export default GymApprovalsPage
