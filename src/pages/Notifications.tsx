import React, { useState, useMemo } from 'react'
import { useAdmin } from '@/context/admin-store'
import { BroadcastNotification } from '@/types'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Bell,
  Send,
  Users,
  Building2,
  Smartphone,
  Mail,
  MessageSquare,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Radio,
  Check,
  AlertCircle,
  Sparkles,
  Zap,
} from 'lucide-react'

interface AutomatedTrigger {
  id: string
  event: string
  triggerCondition: string
  channel: 'PUSH' | 'SMS' | 'WHATSAPP' | 'IN_APP' | 'EMAIL'
  recipientType: 'User' | 'Gym' | 'Both'
  status: 'DELIVERED' | 'ACTIVE'
  recentCount: number
  lastSent: string
}

export function NotificationsPage() {
  const { broadcasts, sendBroadcast, currentUser, users, gyms } = useAdmin()

  const [activeTab, setActiveTab] = useState<'broadcasts' | 'automated' | 'channels'>('broadcasts')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTarget, setSelectedTarget] = useState<string>('ALL')
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL')

  // Compose Modal State
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [target, setTarget] = useState<'ALL' | 'USERS' | 'GYMS'>('ALL')
  const [channel, setChannel] = useState<'IN_APP' | 'PUSH' | 'EMAIL'>('PUSH')
  const [isSending, setIsSending] = useState(false)
  const [successToast, setSuccessToast] = useState(false)

  // Channels Health State
  const [channelsStatus, setChannelsStatus] = useState({
    push: true,
    whatsapp: true,
    sms: true,
    email: true,
  })

  // Automated System Triggers
  const automatedTriggers: AutomatedTrigger[] = [
    {
      id: 'trig-1',
      event: 'Membership Pass Confirmation',
      triggerCondition: 'Triggered instantly when customer completes 100% online payment',
      channel: 'PUSH',
      recipientType: 'User',
      status: 'DELIVERED',
      recentCount: 86,
      lastSent: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    },
    {
      id: 'trig-2',
      event: 'New Member Joined Notification',
      triggerCondition: 'Triggered when a member purchases a pass for a partner gym',
      channel: 'IN_APP',
      recipientType: 'Gym',
      status: 'DELIVERED',
      recentCount: 86,
      lastSent: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    },
    {
      id: 'trig-3',
      event: 'Workout Check-in Welcome',
      triggerCondition: 'Triggered when gym reception scans customer QR code pass',
      channel: 'PUSH',
      recipientType: 'User',
      status: 'DELIVERED',
      recentCount: 74,
      lastSent: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: 'trig-4',
      event: 'Pass Expiry Reminder (7 Days & 24 Hours)',
      triggerCondition: 'Sent before unredeemed pass or active plan reaches validity end',
      channel: 'WHATSAPP',
      recipientType: 'User',
      status: 'DELIVERED',
      recentCount: 28,
      lastSent: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    },
    {
      id: 'trig-5',
      event: 'Razorpay Route Payout Settled to Bank',
      triggerCondition: 'Sent to gym owner when held funds disburse to verified bank account',
      channel: 'EMAIL',
      recipientType: 'Gym',
      status: 'DELIVERED',
      recentCount: 14,
      lastSent: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'trig-6',
      event: 'Gym Onboarding KYC Approval Notice',
      triggerCondition: 'Triggered when admin approves partner gym application & checklist',
      channel: 'SMS',
      recipientType: 'Gym',
      status: 'DELIVERED',
      recentCount: 6,
      lastSent: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
  ]

  // Filtered Broadcasts
  const filteredBroadcasts = useMemo(() => {
    return broadcasts.filter((b) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.message.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTarget = selectedTarget === 'ALL' || b.target === selectedTarget
      const matchesChannel = selectedChannel === 'ALL' || b.channel === selectedChannel

      return matchesSearch && matchesTarget && matchesChannel
    })
  }, [broadcasts, searchQuery, selectedTarget, selectedChannel])

  // Total Recipients Calculation
  const estimatedRecipients = useMemo(() => {
    if (target === 'USERS') return users.length > 0 ? users.length : 1280
    if (target === 'GYMS') return gyms.length > 0 ? gyms.length : 86
    return (users.length > 0 ? users.length : 1280) + (gyms.length > 0 ? gyms.length : 86)
  }, [target, users, gyms])

  // Submit Broadcast Handler
  const handleSendBroadcast = () => {
    if (!title.trim() || !message.trim()) return
    setIsSending(true)

    setTimeout(() => {
      sendBroadcast({
        title: title.trim(),
        message: message.trim(),
        target,
        channel,
        recipientsCount: estimatedRecipients,
      })

      setIsSending(false)
      setIsComposeOpen(false)
      setTitle('')
      setMessage('')
      setSuccessToast(true)
      setTimeout(() => setSuccessToast(false), 3000)
    }, 400)
  }

  return (
    <div className="space-y-6 font-roboto pb-12">
      {/* 1. Page Header & Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">Notifications & Broadcasts</h1>
          <p className="text-sm text-textMuted mt-0.5">
            Send instant announcements to members and gym partners, view automated lifecycle triggers, and manage communication channels.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="primary"
            onClick={() => setIsComposeOpen(true)}
            leftIcon={<Send className="w-4 h-4" strokeWidth={1.75} />}
          >
            Compose Broadcast
          </Button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successToast && (
        <div className="rounded-control bg-successBg border border-successText/20 p-3 text-xs text-successText flex items-center justify-between shadow-subtle animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-successText" />
            <span>Broadcast notification dispatched successfully to {estimatedRecipients} recipients!</span>
          </div>
          <button onClick={() => setSuccessToast(false)} className="text-successText hover:underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Four Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Broadcasts Sent"
          value={`${broadcasts.length} Campaigns`}
          subtext="1,546 total recipients"
        />
        <StatCard
          label="Delivery Success"
          value="99.2%"
          subtext="0.8% bounced / pending"
        />
        <StatCard
          label="Audience Reach"
          value={`${users.length > 0 ? users.length : 1280} Members`}
          subtext={`${gyms.length > 0 ? gyms.length : 86} partner gyms in Ludhiana`}
        />
        <StatCard
          label="Active Channels"
          value="4 Channels"
          subtext="Push, In-App, WhatsApp, Email"
        />
      </div>

      {/* 3. Tab Navigation Bar */}
      <div className="border-b border-border bg-surface rounded-t-card px-4 pt-2 shadow-subtle">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar scrollbar-none">
          {[
            { key: 'broadcasts', label: `Broadcast Campaigns (${broadcasts.length})`, icon: Send },
            { key: 'automated', label: `Automated Lifecycle Alerts (${automatedTriggers.length})`, icon: Zap },
            { key: 'channels', label: 'Channels & Gateway Health', icon: Radio },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`pb-3 pt-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-textMuted hover:text-text'
                }`}
              >
                <Icon className={`w-4 h-4 stroke-[1.75] ${isActive ? 'text-primary' : 'text-textSubtle'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. Tab 1: Broadcast Campaigns */}
      {activeTab === 'broadcasts' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted stroke-[1.75]" />
              <input
                type="text"
                placeholder="Search announcements by title or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-control text-sm text-text placeholder:text-textSubtle focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-xs text-textMuted">
                <Filter className="w-3.5 h-3.5 text-textSubtle stroke-[1.75]" />
                <span>Audience:</span>
              </div>
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="h-9 px-3 bg-surface border border-border rounded-control text-xs font-medium text-text focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Audiences</option>
                <option value="USERS">Members Only</option>
                <option value="GYMS">Gym Partners Only</option>
              </select>

              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="h-9 px-3 bg-surface border border-border rounded-control text-xs font-medium text-text focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Channels</option>
                <option value="PUSH">Push Notifications</option>
                <option value="IN_APP">In-App Inbox</option>
                <option value="EMAIL">Email Blasts</option>
              </select>
            </div>
          </div>

          {/* Broadcasts List */}
          <div className="rounded-card border border-border bg-surface overflow-hidden shadow-subtle">
            {filteredBroadcasts.length === 0 ? (
              <div className="p-12 text-center text-textMuted space-y-2">
                <Bell className="w-8 h-8 text-textSubtle mx-auto" />
                <p className="text-sm font-medium text-text">No broadcasts match your filter</p>
                <p className="text-xs text-textSubtle">Try clearing your search query or send a new broadcast campaign.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredBroadcasts.map((bc) => (
                  <div key={bc.id} className="p-5 hover:bg-background/40 transition-colors space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-bold text-sm text-text">{bc.title}</h3>

                        <Badge
                          variant={bc.target === 'ALL' ? 'purple' : bc.target === 'USERS' ? 'blue' : 'green'}
                        >
                          {bc.target === 'ALL' ? 'ALL RECIPIENTS' : bc.target === 'USERS' ? 'MEMBERS' : 'GYM PARTNERS'}
                        </Badge>

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-background text-textMuted border border-border">
                          {bc.channel === 'PUSH' && <Smartphone className="w-3 h-3 text-primary" />}
                          {bc.channel === 'IN_APP' && <MessageSquare className="w-3 h-3 text-emerald-600" />}
                          {bc.channel === 'EMAIL' && <Mail className="w-3 h-3 text-amber-600" />}
                          <span>{bc.channel}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-textMuted">
                        <Clock className="w-3.5 h-3.5 text-textSubtle" />
                        <span>{formatDate(bc.sentAt)}</span>
                      </div>
                    </div>

                    <p className="text-sm text-text leading-relaxed">{bc.message}</p>

                    <div className="flex items-center justify-between pt-1 text-xs text-textSubtle border-t border-border/50">
                      <span>
                        Sent by <strong className="text-text font-medium">{bc.sentBy}</strong>
                      </span>
                      <span className="font-medium text-text">
                        Delivered to {bc.recipientsCount.toLocaleString('en-IN')} recipients
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Tab 2: Automated Lifecycle Alerts */}
      {activeTab === 'automated' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-text">System-Triggered Events</h3>
              <p className="text-xs text-textMuted">
                Automated messaging workflows triggered by member actions, check-ins, pass expiries, and payouts.
              </p>
            </div>
            <span className="text-xs font-bold text-successText bg-successBg px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              All 6 Triggers Operational
            </span>
          </div>

          <div className="rounded-card border border-border bg-surface overflow-hidden shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-background text-textSubtle text-xs uppercase font-medium border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Trigger Event</th>
                    <th className="py-3 px-4">Condition</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Audience</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Recent Deliveries</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {automatedTriggers.map((trig) => (
                    <tr key={trig.id} className="hover:bg-background/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-text">{trig.event}</td>
                      <td className="py-3.5 px-4 text-xs text-textMuted max-w-sm">{trig.triggerCondition}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-background border border-border text-text">
                          {trig.channel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-text">{trig.recipientType}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-successBg text-successText">
                          <Check className="w-3 h-3" />
                          {trig.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-text">
                        {trig.recentCount} sent
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. Tab 3: Channels & Gateway Health */}
      {activeTab === 'channels' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-text">Messaging Gateways & Channel Health</h3>
              <p className="text-xs text-textMuted">Real-time status of integrated push notification, WhatsApp, SMS, and email services.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Push Notifications */}
            <div className="rounded-card border border-border bg-surface p-5 shadow-subtle space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-control bg-primaryLight text-primary">
                    <Smartphone className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-text">Mobile Push Notifications</h4>
                    <span className="text-xs text-textMuted">Firebase Cloud Messaging (FCM) & Apple APNs</span>
                  </div>
                </div>
                <Badge variant={channelsStatus.push ? 'green' : 'grey'}>
                  {channelsStatus.push ? 'ACTIVE' : 'PAUSED'}
                </Badge>
              </div>
              <p className="text-xs text-textMuted">
                Instant lock-screen and banner alerts for pass activations, QR scan confirmations, and promotional campaigns.
              </p>
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <span className="text-textSubtle">Latency: 120ms avg</span>
                <button
                  onClick={() => setChannelsStatus((prev) => ({ ...prev, push: !prev.push }))}
                  className="text-primary hover:underline font-medium"
                >
                  {channelsStatus.push ? 'Pause Channel' : 'Enable Channel'}
                </button>
              </div>
            </div>

            {/* WhatsApp Business API */}
            <div className="rounded-card border border-border bg-surface p-5 shadow-subtle space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-control bg-emerald-50 text-emerald-600">
                    <MessageSquare className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-text">WhatsApp Business Cloud API</h4>
                    <span className="text-xs text-textMuted">Meta Verified Enterprise Account</span>
                  </div>
                </div>
                <Badge variant={channelsStatus.whatsapp ? 'green' : 'grey'}>
                  {channelsStatus.whatsapp ? 'ACTIVE' : 'PAUSED'}
                </Badge>
              </div>
              <p className="text-xs text-textMuted">
                High-engagement transactional reminders: Membership expiry warning (7-day/24-hour) and digital pass receipt links.
              </p>
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <span className="text-textSubtle">Read Rate: 94.2%</span>
                <button
                  onClick={() => setChannelsStatus((prev) => ({ ...prev, whatsapp: !prev.whatsapp }))}
                  className="text-primary hover:underline font-medium"
                >
                  {channelsStatus.whatsapp ? 'Pause Channel' : 'Enable Channel'}
                </button>
              </div>
            </div>

            {/* Transactional SMS */}
            <div className="rounded-card border border-border bg-surface p-5 shadow-subtle space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-control bg-blue-50 text-blue-600">
                    <Radio className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-text">Transactional SMS Gateway</h4>
                    <span className="text-xs text-textMuted">DLT Principal Entity & Template Approved</span>
                  </div>
                </div>
                <Badge variant={channelsStatus.sms ? 'green' : 'grey'}>
                  {channelsStatus.sms ? 'ACTIVE' : 'PAUSED'}
                </Badge>
              </div>
              <p className="text-xs text-textMuted">
                Fallback OTP login codes, refund completion notices, and critical account security messages.
              </p>
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <span className="text-textSubtle">Carrier Success: 99.1%</span>
                <button
                  onClick={() => setChannelsStatus((prev) => ({ ...prev, sms: !prev.sms }))}
                  className="text-primary hover:underline font-medium"
                >
                  {channelsStatus.sms ? 'Pause Channel' : 'Enable Channel'}
                </button>
              </div>
            </div>

            {/* Email Gateway */}
            <div className="rounded-card border border-border bg-surface p-5 shadow-subtle space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-control bg-amber-50 text-amber-600">
                    <Mail className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-text">Transactional Email (Amazon SES)</h4>
                    <span className="text-xs text-textMuted">SPF, DKIM, and DMARC Authenticated</span>
                  </div>
                </div>
                <Badge variant={channelsStatus.email ? 'green' : 'grey'}>
                  {channelsStatus.email ? 'ACTIVE' : 'PAUSED'}
                </Badge>
              </div>
              <p className="text-xs text-textMuted">
                Gym partner monthly settlement statements, invoice copies, and passwordless authentication magic links.
              </p>
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <span className="text-textSubtle">Spam Rate: 0.01%</span>
                <button
                  onClick={() => setChannelsStatus((prev) => ({ ...prev, email: !prev.email }))}
                  className="text-primary hover:underline font-medium"
                >
                  {channelsStatus.email ? 'Pause Channel' : 'Enable Channel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Compose Broadcast Modal */}
      {isComposeOpen && (
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" />
                Compose Broadcast Announcement
              </DialogTitle>
              <DialogDescription>
                Dispatch an immediate marketing or service notification to active members and gym partners.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Title input */}
              <div>
                <label className="block text-xs font-bold text-text uppercase tracking-wide mb-1">
                  Notification Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Diwali Fitness Fest — 0% Commission Weekend"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm p-2.5 bg-surface border border-border rounded-control text-text placeholder:text-textSubtle focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-xs font-bold text-text uppercase tracking-wide mb-1.5">
                  Target Audience *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'ALL', label: 'Everyone', desc: 'All Users & Gyms' },
                    { key: 'USERS', label: 'Members', desc: 'Active App Users' },
                    { key: 'GYMS', label: 'Gym Partners', desc: 'Owners & Desk' },
                  ].map((aud) => (
                    <button
                      key={aud.key}
                      type="button"
                      onClick={() => setTarget(aud.key as any)}
                      className={`p-2.5 rounded-control border text-left transition-colors ${
                        target === aud.key
                          ? 'border-primary bg-primaryLight text-primary'
                          : 'border-border bg-background hover:bg-surface text-text'
                      }`}
                    >
                      <span className="font-bold text-xs block">{aud.label}</span>
                      <span className="text-[10px] text-textMuted block">{aud.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Channel */}
              <div>
                <label className="block text-xs font-bold text-text uppercase tracking-wide mb-1.5">
                  Primary Channel *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'PUSH', label: 'Push Notification', icon: Smartphone },
                    { key: 'IN_APP', label: 'In-App Inbox', icon: MessageSquare },
                    { key: 'EMAIL', label: 'Email Blast', icon: Mail },
                  ].map((ch) => {
                    const Icon = ch.icon
                    const isSelected = channel === ch.key
                    return (
                      <button
                        key={ch.key}
                        type="button"
                        onClick={() => setChannel(ch.key as any)}
                        className={`p-2.5 rounded-control border text-left transition-colors flex items-center gap-2 ${
                          isSelected
                            ? 'border-primary bg-primaryLight text-primary font-bold'
                            : 'border-border bg-background hover:bg-surface text-text font-normal'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-xs">{ch.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Message Content */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-text uppercase tracking-wide">
                    Announcement Message *
                  </label>
                  <span className="text-[11px] text-textSubtle">{message.length}/250 characters</span>
                </div>
                <textarea
                  rows={3}
                  maxLength={250}
                  placeholder="Type the message body here. Keep it concise, engaging, and informative..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-sm p-2.5 bg-surface border border-border rounded-control text-text placeholder:text-textSubtle focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Preview Box */}
              <div className="rounded-control bg-background p-3 border border-border space-y-1">
                <span className="text-[10px] font-bold text-textSubtle uppercase tracking-wider block">
                  Preview ({estimatedRecipients.toLocaleString('en-IN')} recipients):
                </span>
                <p className="text-xs font-bold text-text">{title || 'Notification Title Preview'}</p>
                <p className="text-xs text-textMuted">{message || 'Your broadcast message preview will appear here...'}</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={!title.trim() || !message.trim() || isSending}
                onClick={handleSendBroadcast}
                leftIcon={<Send className="w-4 h-4" />}
              >
                {isSending ? 'Dispatching...' : `Send to ${estimatedRecipients.toLocaleString('en-IN')} Recipients`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default NotificationsPage

