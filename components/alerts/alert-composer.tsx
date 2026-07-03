"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

type Role = "admin" | "agency" | "community" | "resident" | "researcher" | "all"
type Severity = "info" | "watch" | "warning" | "severe"

export function AlertComposer() {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [audience, setAudience] = useState<Role>("resident")
  const [severity, setSeverity] = useState<Severity>("info")
  const [sendPush, setSendPush] = useState(true)
  const [sendSms, setSendSms] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)
    setError(null)
    setNotice(null)
    const supabase = createClient()

    // Ensure user session exists
    const {
      data: { user },
      error: getUserErr,
    } = await supabase.auth.getUser()
    if (getUserErr || !user) {
      setError("You must be logged in.")
      setIsSending(false)
      return
    }

    try {
      // Create alert row as the creator; RLS requires created_by = auth.uid()
      const { data: inserted, error: insertErr } = await supabase
        .from("alerts")
        .insert([
          {
            title,
            message,
            severity,
            audience,
            status: "draft",
            created_by: user.id,
          },
        ])
        .select("id")
        .single()

      if (insertErr || !inserted?.id) {
        const supabaseError = insertErr as { code?: string; message?: string } | null
        if (supabaseError?.code === "42P01") {
          throw new Error("Database not initialized. Please run scripts/001_profiles.sql - 006_detections.sql.")
        }
        throw new Error(supabaseError?.message || "Failed to create alert")
      }

      // Hit API stub to record dispatch across channels
      const channels = [sendPush && "push", sendSms && "sms"].filter(Boolean)
      const res = await fetch("/api/alerts/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId: inserted.id, channels, audience }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.error || "Dispatch failed")
      }

      setNotice(`Dispatched ${json.dispatched} channel(s) to ${json.audience}.`)
      setTitle("")
      setMessage("")
      setSendPush(true)
      setSendSms(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Compose and Send Alert (Demo)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Storm surge risk"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Prepare sandbags and avoid low-lying roads."
              required
            />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="audience">Audience</Label>
              <select
                id="audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value as Role)}
                className="h-9 rounded-md border bg-background px-3 text-sm"
              >
                <option value="all">All</option>
                <option value="admin">Admin</option>
                <option value="agency">Agency</option>
                <option value="community">Community</option>
                <option value="resident">Resident</option>
                <option value="researcher">Researcher</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="severity">Severity</Label>
              <select
                id="severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity)}
                className="h-9 rounded-md border bg-background px-3 text-sm"
              >
                <option value="info">Info</option>
                <option value="watch">Watch</option>
                <option value="warning">Warning</option>
                <option value="severe">Severe</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Channels</Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={sendPush} onChange={(e) => setSendPush(e.target.checked)} /> Push
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={sendSms} onChange={(e) => setSendSms(e.target.checked)} /> SMS
                </label>
              </div>
            </div>
          </div>
          {notice && <p className="text-sm text-teal-700">{notice}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isSending}>
              {isSending ? "Sending..." : "Send Demo Alert"}
            </Button>
            <span className="text-xs text-muted-foreground">This is a demo. No real messages are sent.</span>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
