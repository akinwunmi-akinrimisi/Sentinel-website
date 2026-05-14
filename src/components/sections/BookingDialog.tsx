"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK ?? "https://cal.com/sentinelinstitute/discovery"

interface BookingButtonProps {
  variant?: "primary" | "secondary"
  className?: string
  /** Optional data-cta attribute for GA4 — defaults to "booking-dialog-open". */
  ctaId?: string
  children?: React.ReactNode
}

/**
 * Button that opens a Cal.com discovery-call modal. Falls back to a
 * target="_blank" anchor inside the modal body when the iframe is blocked
 * (some corporate networks). Use anywhere the spec calls for a
 * "Book a 20-Minute Discovery Call" CTA — Hero secondary, ProposalCTA secondary.
 */
export function BookingButton({
  variant = "secondary",
  className,
  ctaId = "booking-dialog-open",
  children = "Book a 20-Minute Discovery Call",
}: BookingButtonProps) {
  const [open, setOpen] = useState(false)
  const cls = variant === "primary" ? "btn-primary" : "btn-secondary"
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={`${cls}${className ? ` ${className}` : ""}`}
          data-cta={ctaId}
        >
          {children}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[960px] h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-[var(--color-border)]">
          <DialogTitle className="font-display text-[1.125rem] text-[var(--color-text-primary)]">
            Book a 20-Minute Discovery Call
          </DialogTitle>
          <DialogDescription className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
            Sentinel Institute · Enterprise Cybersecurity Certification
          </DialogDescription>
        </DialogHeader>
        <div className="h-full w-full bg-white">
          <iframe
            src={CAL_LINK}
            title="Book a 20-Minute Discovery Call"
            className="w-full h-full border-0"
            allow="camera; microphone; autoplay; encrypted-media; fullscreen; geolocation"
          />
        </div>
        <div className="px-6 py-3 border-t border-[var(--color-border)] flex justify-end">
          <a
            href={CAL_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-accent-light)] hover:text-[var(--color-text-primary)] transition-colors"
            data-cta="booking-dialog-fallback"
          >
            Open in new tab →
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}
