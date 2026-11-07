import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { VouchersPage } from './Vouchers'

/**
 * Route adapter: redirects or renders Vouchers with Refunds tab active.
 */
export function RefundsPage() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/vouchers?tab=refunds', { replace: true })
  }, [navigate])

  return <VouchersPage />
}

export default RefundsPage
