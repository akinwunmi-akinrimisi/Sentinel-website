"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { proposalSchema, PROPOSAL_OPTIONS, type ProposalInput } from "@/lib/proposal/schema"
import { analytics } from "@/lib/analytics/events"
import { z } from "zod"

type ProposalOutput = z.output<typeof proposalSchema>
type FormError = { field?: string | null; message: string } | null

export function ProposalForm() {
  const router = useRouter()
  const startFiredRef = useRef(false)
  const [serverError, setServerError] = useState<FormError>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProposalInput, unknown, ProposalOutput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(proposalSchema) as any,
    defaultValues: {
      fullName: "",
      businessEmail: "",
      phone: "",
      company: "",
      jobTitle: "",
      certifications: [],
      notes: "",
    },
    mode: "onBlur",
  })

  // Fire `proposal_form_start` on first focus of any field.
  useEffect(() => {
    if (typeof window === "undefined") return
    function handler() {
      if (startFiredRef.current) return
      const active = document.activeElement
      if (active && active.closest("form[data-form='proposal']")) {
        startFiredRef.current = true
        analytics.proposalFormStart()
      }
    }
    document.addEventListener("focusin", handler)
    return () => document.removeEventListener("focusin", handler)
  }, [])

  const certs = watch("certifications") ?? []

  function toggleCert(value: string, checked: boolean) {
    const next = checked
      ? Array.from(new Set([...certs, value]))
      : certs.filter((c) => c !== value)
    setValue("certifications", next as ProposalOutput["certifications"], { shouldValidate: true })
  }

  async function onSubmit(data: ProposalOutput) {
    setServerError(null)
    setSubmitting(true)
    try {
      const res = await fetch("/api/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { field?: string; message?: string }
        setServerError({ field: body.field, message: body.message ?? "Submission failed. Please try again." })
        return
      }
      analytics.proposalFormSubmit()
      router.push("/thanks")
    } catch {
      setServerError({ message: "Network error. Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      data-form="proposal"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-[42rem]"
    >
      <Field label="Full name" error={errors.fullName?.message}>
        <Input {...register("fullName")} autoComplete="name" />
      </Field>

      <Field label="Business email" error={errors.businessEmail?.message}>
        <Input type="email" {...register("businessEmail")} autoComplete="email" />
      </Field>

      <Field label="Phone" error={errors.phone?.message}>
        <Input type="tel" {...register("phone")} autoComplete="tel" placeholder="+1 (312) 555-0194" />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Company" error={errors.company?.message}>
          <Input {...register("company")} autoComplete="organization" />
        </Field>

        <Field label="Job title" error={errors.jobTitle?.message}>
          <Input {...register("jobTitle")} autoComplete="organization-title" />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ControlledSelect
          name="companySize"
          label="Company size"
          control={control}
          options={PROPOSAL_OPTIONS.companySize}
          error={errors.companySize?.message}
        />
        <ControlledSelect
          name="industry"
          label="Industry"
          control={control}
          options={PROPOSAL_OPTIONS.industry}
          error={errors.industry?.message}
        />
      </div>

      <ControlledSelect
        name="teamSize"
        label="Team size to train"
        control={control}
        options={PROPOSAL_OPTIONS.teamSize}
        error={errors.teamSize?.message}
      />

      <Field label="Certifications of interest" error={errors.certifications?.message}>
        <fieldset className="flex flex-wrap gap-x-5 gap-y-3">
          {PROPOSAL_OPTIONS.certifications.map((cert) => (
            <label key={cert} className="inline-flex items-center gap-2 text-[var(--color-text-primary)] cursor-pointer">
              <input
                type="checkbox"
                value={cert}
                checked={certs.includes(cert)}
                onChange={(e) => toggleCert(cert, e.target.checked)}
                className="h-4 w-4"
              />
              <span>{cert}</span>
            </label>
          ))}
        </fieldset>
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ControlledSelect
          name="complianceDriver"
          label="Compliance driver"
          control={control}
          options={PROPOSAL_OPTIONS.complianceDriver}
          error={errors.complianceDriver?.message}
        />
        <ControlledSelect
          name="timeline"
          label="Target start"
          control={control}
          options={PROPOSAL_OPTIONS.timeline}
          error={errors.timeline?.message}
        />
      </div>

      <ControlledSelect
        name="referralSource"
        label="How did you hear about us?"
        control={control}
        options={PROPOSAL_OPTIONS.referralSource}
        error={errors.referralSource?.message}
      />

      <Field label="Additional notes (optional)" error={errors.notes?.message}>
        <Textarea {...register("notes")} rows={4} placeholder="Specific compliance requirements, timing constraints, etc." />
      </Field>

      {serverError ? (
        <p role="alert" className="text-sm text-red-400">
          {serverError.message}
        </p>
      ) : null}

      <Button type="submit" disabled={submitting} className="w-full md:w-auto">
        {submitting ? "Submitting…" : "Request proposal"}
      </Button>

      <p className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
        Response within 1 business day  ·  No-pass, re-train guarantee
      </p>
    </form>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--color-text-secondary)]">
        {label}
      </Label>
      {children}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  )
}

interface ControlledSelectProps<TName extends keyof ProposalOutput> {
  name: TName
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any
  options: readonly string[]
  error?: string
}

function ControlledSelect<TName extends keyof ProposalOutput>({
  name,
  label,
  control,
  options,
  error,
}: ControlledSelectProps<TName>) {
  return (
    <Field label={label} error={error}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={(field.value as string) ?? ""}>
            <SelectTrigger>
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </Field>
  )
}
