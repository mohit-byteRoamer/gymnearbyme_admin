import React, { useState } from 'react'
import { useAdmin } from '@/context/admin-store'
import { SupportTicket, BroadcastNotification } from '@/types'
import { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/ui/page-header'
import { DataTable, FilterOption } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/lib/utils'

export function SupportPage() {
  const {
    tickets,
    broadcasts,
    replyToTicket,
    updateTicketStatus,
    sendBroadcast,
  } = useAdmin()

  const [activeTab, setActiveTab] = useState<'tickets' | 'broadcasts'>('tickets')

  // Support ticket thread modal
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [ticketReplyText, setTicketReplyText] = useState('')

  // Broadcast form state
  const [bcTitle, setBcTitle] = useState('')
  const [bcMessage, setBcMessage] = useState('')
  const [bcTarget, setBcTarget] = useState<'ALL' | 'USERS' | 'GYMS'>('ALL')
  const [bcChannel, setBcChannel] = useState<'IN_APP' | 'PUSH' | 'EMAIL'>('IN_APP')
  const [broadcastSentSuccess, setBroadcastSentSuccess] = useState(false)

  // Reply handler
  const handleSendTicketReply = () => {
    if (!selectedTicket || !ticketReplyText.trim()) return
    replyToTicket(selectedTicket.id, ticketReplyText.trim())
    setTicketReplyText('')
    // Update local selected ticket
    setSelectedTicket((prev) =>
      prev
        ? {
            ...prev,
            messages: [
              ...prev.messages,
              {
                id: Math.random().toString(),
                sender: 'Support Desk',
                isStaff: true,
                message: ticketReplyText.trim(),
                timestamp: new Date().toISOString(),
              },
            ],
          }
        : null
    )
  }

  // Broadcast send handler
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault()
    if (!bcTitle.trim() || !bcMessage.trim()) return

    sendBroadcast({
      title: bcTitle.trim(),
      message: bcMessage.trim(),
      target: bcTarget,
      channel: bcChannel,
      recipientsCount: bcTarget === 'ALL' ? 1540 : bcTarget === 'USERS' ? 1200 : 340,
    })

    setBcTitle('')
    setBcMessage('')
    setBroadcastSentSuccess(true)
    setTimeout(() => setBroadcastSentSuccess(false), 4000)
  }

  // Tickets columns
  const ticketColumns: ColumnDef<SupportTicket>[] = [
    {
      accessorKey: 'ticketNumber',
      header: 'Ticket',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-text">{row.original.ticketNumber}</span>
      ),
    },
    {
      accessorKey: 'subject',
      header: 'Subject & category',
      cell: ({ row }) => (
        <div className="space-y-0.5 max-w-sm">
          <span className="text-sm font-medium text-text block truncate">{row.original.subject}</span>
          <span className="text-sm font-normal text-textMuted block">
            {row.original.category} • {row.original.userType === 'USER' ? 'Member' : 'Partner gym'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'userName',
      header: 'Submitted by',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <span className="text-sm font-medium text-text block">{row.original.userName}</span>
          <span className="text-sm font-normal text-textMuted block">{row.original.userEmail}</span>
        </div>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.priority === 'HIGH' || row.original.priority === 'URGENT'
              ? 'red'
              : row.original.priority === 'MEDIUM'
              ? 'yellow'
              : 'grey'
          }
        >
          {row.original.priority}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-sm text-textMuted font-normal">{formatDate(row.original.createdAt)}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            setSelectedTicket(row.original)
          }}
        >
          View thread
        </Button>
      ),
    },
  ]

  // Broadcasts columns
  const broadcastColumns: ColumnDef<BroadcastNotification>[] = [
    {
      accessorKey: 'title',
      header: 'Announcement',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <span className="text-sm font-medium text-text block">{row.original.title}</span>
          <span className="text-sm font-normal text-textMuted block max-w-md truncate">{row.original.message}</span>
        </div>
      ),
    },
    {
      accessorKey: 'target',
      header: 'Target audience',
      cell: ({ row }) => (
        <span className="text-sm text-text font-normal">
          {row.original.target === 'ALL'
            ? 'All members & gyms'
            : row.original.target === 'USERS'
            ? 'Members only'
            : 'Partner gyms only'}
        </span>
      ),
    },
    {
      accessorKey: 'recipientsCount',
      header: 'Recipients',
      cell: ({ row }) => (
        <span className="text-sm text-text font-normal">{row.original.recipientsCount}</span>
      ),
    },
    {
      accessorKey: 'sentAt',
      header: 'Date sent',
      cell: ({ row }) => (
        <span className="text-sm text-textMuted font-normal">{formatDate(row.original.sentAt)}</span>
      ),
    },
  ]

  const ticketFilterOptions: FilterOption[] = [
    {
      id: 'status',
      label: 'Status',
      options: [
        { label: 'Open', value: 'OPEN' },
        { label: 'In progress', value: 'IN_PROGRESS' },
        { label: 'Resolved', value: 'RESOLVED' },
        { label: 'Closed', value: 'CLOSED' },
      ],
    },
  ]

  return (
    <div className="space-y-6 font-roboto">
      <PageHeader
        title="Support"
        description="Respond to member and partner gym inquiries, manage ticket queues, and broadcast notices."
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="tickets">
            Tickets ({tickets.length})
          </TabsTrigger>
          <TabsTrigger value="broadcasts">
            Broadcast notifications ({broadcasts.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Support Tickets */}
        <TabsContent value="tickets" className="mt-4">
          <DataTable
            columns={ticketColumns}
            data={tickets}
            searchKey="subject"
            searchPlaceholder="Search tickets by subject or member..."
            filters={ticketFilterOptions}
            exportFilename="support_tickets"
            onRowClick={(row) => setSelectedTicket(row)}
            emptyTitle="No support tickets"
            emptyDescription="All customer and gym inquiries have been addressed."
          />
        </TabsContent>

        {/* Tab 2: Broadcasts */}
        <TabsContent value="broadcasts" className="mt-4 space-y-6">
          {/* Send Broadcast Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send broadcast notification</CardTitle>
              <p className="text-sm text-textMuted font-normal mt-0.5">
                Send push or in-app announcements to platform members or gym operators in Ludhiana
              </p>
            </CardHeader>
            <CardContent className="pt-2">
              <form onSubmit={handleSendBroadcast} className="space-y-4">
                {broadcastSentSuccess && (
                  <div className="p-3 rounded-control bg-successBg text-successText text-sm font-medium">
                    Broadcast notification sent successfully to recipient queue.
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-sm font-medium text-text">Title</label>
                    <Input
                      placeholder="e.g. Scheduled system maintenance window"
                      value={bcTitle}
                      onChange={(e) => setBcTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-text">Target audience</label>
                    <select
                      value={bcTarget}
                      onChange={(e) => setBcTarget(e.target.value as any)}
                      className="w-full min-h-[40px] max-md:min-h-[44px] rounded-control border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    >
                      <option value="ALL">All members and gyms</option>
                      <option value="USERS">Members only</option>
                      <option value="GYMS">Partner gyms only</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-text">Notification message</label>
                  <Textarea
                    placeholder="Enter the full announcement text..."
                    value={bcMessage}
                    onChange={(e) => setBcMessage(e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="primary">
                    Send broadcast
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Past Broadcast History */}
          <DataTable
            columns={broadcastColumns}
            data={broadcasts}
            searchKey="title"
            searchPlaceholder="Search broadcast history..."
            exportFilename="broadcast_history"
            emptyTitle="No broadcasts sent"
            emptyDescription="There are no past broadcast records logged."
          />
        </TabsContent>
      </Tabs>

      {/* Ticket Thread Modal */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle>{selectedTicket.ticketNumber}</DialogTitle>
                  <DialogDescription>{selectedTicket.subject}</DialogDescription>
                </div>
                <StatusBadge status={selectedTicket.status} />
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2 text-sm">
              <div className="flex items-center justify-between p-3 rounded-control border border-border bg-background text-xs">
                <div>
                  <span className="text-textMuted block">Submitted by</span>
                  <span className="font-medium text-text">{selectedTicket.userName} ({selectedTicket.userEmail})</span>
                </div>
                <div>
                  <span className="text-textMuted block">Category</span>
                  <span className="font-medium text-text">{selectedTicket.category}</span>
                </div>
                <div>
                  <span className="text-textMuted block">Priority</span>
                  <span className="font-medium text-text">{selectedTicket.priority}</span>
                </div>
              </div>

              {/* Messages thread */}
              <div className="space-y-2 max-h-64 overflow-y-auto border border-border rounded-control p-3 bg-background">
                {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                  selectedTicket.messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-control text-sm ${
                        msg.isStaff
                          ? 'bg-primaryLight text-primary ml-6 border border-primary/20'
                          : 'bg-surface text-text mr-6 border border-border'
                      }`}
                    >
                      <div className="flex justify-between text-xs text-textMuted mb-1">
                        <span className="font-medium">{msg.sender}</span>
                        <span>{formatDate(msg.timestamp)}</span>
                      </div>
                      <p className="font-normal">{msg.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-textMuted text-center py-2">No messages in this ticket.</p>
                )}
              </div>

              {/* Reply Box */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Type your response to the customer..."
                  value={ticketReplyText}
                  onChange={(e) => setTicketReplyText(e.target.value)}
                  rows={2}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-textMuted">Status:</span>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as any
                        updateTicketStatus(selectedTicket.id, newStatus)
                        setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null))
                      }}
                      className="min-h-[36px] rounded-control border border-border bg-surface px-2 py-1 text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSendTicketReply}
                    disabled={!ticketReplyText.trim()}
                  >
                    Send reply
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default SupportPage
