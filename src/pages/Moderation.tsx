import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdmin } from '@/context/admin-store'
import { Review } from '@/types'
import { ColumnDef } from '@tanstack/react-table'
import { PageHeader } from '@/components/ui/page-header'
import { DataTable, FilterOption } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/lib/utils'
import { Star } from 'lucide-react'

interface FlattenedMedia {
  id: string
  url: string
  type: 'photo' | 'video'
  caption?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  uploadedAt: string
  gymId: string
  gymName: string
}

export function ModerationPage() {
  const {
    gyms,
    reviews,
    approveMedia,
    rejectMedia,
    approveReview,
    rejectReview,
    replyToReview,
  } = useAdmin()

  const [activeTab, setActiveTab] = useState<'media' | 'reviews'>('media')

  // Collect all media items across gyms
  const allMediaItems: FlattenedMedia[] = gyms.flatMap((g) =>
    g.media.map((m) => ({
      ...m,
      gymId: g.id,
      gymName: g.name,
    }))
  )

  // Review reply modal state
  const [replyingReview, setReplyingReview] = useState<Review | null>(null)
  const [adminReplyText, setAdminReplyText] = useState('')

  // Media reject state
  const [rejectingMedia, setRejectingMedia] = useState<{ gymId: string; mediaId: string } | null>(null)

  // Save admin reply
  const handleSaveReply = () => {
    if (!replyingReview || !adminReplyText.trim()) return
    replyToReview(replyingReview.id, adminReplyText.trim())
    setReplyingReview(null)
    setAdminReplyText('')
  }

  // Reviews columns
  const reviewColumns: ColumnDef<Review>[] = [
    {
      accessorKey: 'userName',
      header: 'Reviewer',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          {row.original.userAvatar ? (
            <img
              src={row.original.userAvatar}
              alt={row.original.userName}
              className="h-7 w-7 rounded-full object-cover border border-border shrink-0"
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-primaryLight text-primary flex items-center justify-center text-xs font-medium shrink-0">
              {row.original.userName.charAt(0)}
            </div>
          )}
          <span className="text-sm font-medium text-text">{row.original.userName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'gymName',
      header: 'Partner gym',
      cell: ({ row }) => (
        <Link
          to={`/gyms/${row.original.gymId}`}
          className="text-sm font-medium text-text hover:text-primary transition-colors hover:underline"
        >
          {row.original.gymName}
        </Link>
      ),
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm text-text">
          <Star className="h-3.5 w-3.5 fill-warningText text-warningText" strokeWidth={1.75} />
          <span>{row.original.rating} (5.0)</span>
        </div>
      ),
    },
    {
      accessorKey: 'comment',
      header: 'Review text',
      cell: ({ row }) => (
        <div className="max-w-md space-y-1">
          <p className="text-sm font-normal text-text line-clamp-2">{row.original.comment}</p>
          {row.original.adminReply && (
            <p className="text-xs text-textMuted bg-background p-2 rounded-control border border-border">
              Reply: {row.original.adminReply}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-2">
            {item.status === 'PENDING' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => approveReview(item.id)}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => rejectReview(item.id)}
                >
                  Reject
                </Button>
              </>
            )}
            {!item.adminReply && item.status === 'APPROVED' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setReplyingReview(item)
                  setAdminReplyText('')
                }}
              >
                Reply
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  // Media columns
  const mediaColumns: ColumnDef<FlattenedMedia>[] = [
    {
      accessorKey: 'url',
      header: 'Preview',
      cell: ({ row }) => (
        <div className="h-12 w-16 rounded-control overflow-hidden border border-border bg-background shrink-0">
          <img
            src={row.original.url}
            alt={row.original.caption || 'Gym media'}
            className="h-full w-full object-cover"
          />
        </div>
      ),
    },
    {
      accessorKey: 'gymName',
      header: 'Partner gym',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <Link
            to={`/gyms/${row.original.gymId}?tab=media`}
            className="text-sm font-medium text-text hover:text-primary transition-colors hover:underline block"
          >
            {row.original.gymName}
          </Link>
          <span className="text-sm font-normal text-textMuted block">{row.original.caption || 'Facility photo'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'uploadedAt',
      header: 'Uploaded',
      cell: ({ row }) => (
        <span className="text-sm text-textMuted font-normal">{formatDate(row.original.uploadedAt)}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-2">
            {item.status === 'PENDING' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => approveMedia(item.gymId, item.id)}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setRejectingMedia({ gymId: item.gymId, mediaId: item.id })}
                >
                  Reject
                </Button>
              </>
            )}
            {item.status !== 'PENDING' && (
              <span className="text-sm text-textMuted font-normal">Processed</span>
            )}
          </div>
        )
      },
    },
  ]

  const reviewFilterOptions: FilterOption[] = [
    {
      id: 'status',
      label: 'Status',
      options: [
        { label: 'Pending', value: 'PENDING' },
        { label: 'Approved', value: 'APPROVED' },
        { label: 'Rejected', value: 'REJECTED' },
      ],
    },
  ]

  const mediaFilterOptions: FilterOption[] = [
    {
      id: 'status',
      label: 'Status',
      options: [
        { label: 'Pending', value: 'PENDING' },
        { label: 'Approved', value: 'APPROVED' },
        { label: 'Rejected', value: 'REJECTED' },
      ],
    },
  ]

  return (
    <div className="space-y-6 font-roboto">
      <PageHeader
        title="Moderation"
        description="Review member feedback, approve partner facility photos, and publish official responses."
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="media">
            Gym media ({allMediaItems.length})
          </TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews ({reviews.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Gym Media */}
        <TabsContent value="media" className="mt-4">
          <DataTable
            columns={mediaColumns}
            data={allMediaItems}
            searchKey="gymName"
            searchPlaceholder="Search media by gym name..."
            filters={mediaFilterOptions}
            exportFilename="gym_media_moderation"
            emptyTitle="No media items"
            emptyDescription="All partner facility photos have been moderated."
          />
        </TabsContent>

        {/* Tab 2: Reviews */}
        <TabsContent value="reviews" className="mt-4">
          <DataTable
            columns={reviewColumns}
            data={reviews}
            searchKey="gymName"
            searchPlaceholder="Search reviews by gym name..."
            filters={reviewFilterOptions}
            exportFilename="reviews_moderation"
            emptyTitle="No reviews"
            emptyDescription="There are no reviews requiring moderation."
          />
        </TabsContent>
      </Tabs>

      {/* Admin Reply Modal */}
      {replyingReview && (
        <Dialog open={!!replyingReview} onOpenChange={() => setReplyingReview(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reply to Review</DialogTitle>
              <DialogDescription>
                Publish an official response for {replyingReview.userName}'s review of {replyingReview.gymName}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-sm">
              <div className="p-3 rounded-control bg-background border border-border space-y-1">
                <span className="text-xs text-textMuted block">Customer review:</span>
                <p className="text-sm text-text font-normal">{replyingReview.comment}</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text">
                  Official reply message
                </label>
                <Textarea
                  placeholder="Thank you for sharing your feedback..."
                  value={adminReplyText}
                  onChange={(e) => setAdminReplyText(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setReplyingReview(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveReply}>
                Post reply
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Media Rejection Confirmation Dialog */}
      {rejectingMedia && (
        <ConfirmationDialog
          open={!!rejectingMedia}
          onOpenChange={(open) => !open && setRejectingMedia(null)}
          title="Reject Facility Photo"
          description="Reject this photo upload from appearing on the public gym listing."
          confirmText="Reject photo"
          variant="destructive"
          requireReason={true}
          reasonLabel="Rejection reason"
          onConfirm={(reason) => {
            rejectMedia(rejectingMedia.gymId, rejectingMedia.mediaId, reason || 'Photo rejected')
            setRejectingMedia(null)
          }}
        />
      )}
    </div>
  )
}

export default ModerationPage
