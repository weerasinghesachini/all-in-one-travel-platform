"use client";

import { Suspense, useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function NewRidePage() {
  return <Suspense fallback={<main className="ride-page" />}><NewRideForm /></Suspense>;
}

function NewRideForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState(searchParams.get("destination") ?? "");
  const [distanceKm, setDistanceKm] = useState("");
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const distance = Number(distanceKm);
    if (!distance || distance <= 0) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/v1/rides/estimate?distanceKm=${distance}`, { credentials: "include", signal: controller.signal });
        if (response.ok) setEstimatedFare((await response.json()).estimatedFare);
      } catch {
        if (!controller.signal.aborted) setEstimatedFare(null);
      }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [distanceKm]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/v1/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pickup, destination, distanceKm: Number(distanceKm) }),
      });
      const result = await response.json();
      if (response.status === 401) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      if (!response.ok) throw new Error(result.message ?? "Ride request could not be created.");
      router.push("/dashboard");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to reach the travel service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ride-page">
      <header className="site-nav"><Link className="brand" href="/"><span className="brand-mark">W</span> wayfarer<span className="brand-period">.</span></Link><Link className="text-link" href="/dashboard">Your travel desk ↗</Link></header>
      <section className="ride-content">
        <Link className="back-home" href="/">← Back to exploring</Link>
        <p className="eyebrow">A GOOD WAY TO GET THERE</p>
        <h1>Where to <em>next?</em></h1>
        <p className="ride-intro">Tell us the start and the finish. We’ll keep your request together in your travel desk.</p>
        <form className="ride-form" onSubmit={submit}>
          <label>Pick-up location<input required minLength={2} maxLength={200} value={pickup} onChange={(event) => setPickup(event.target.value)} placeholder="Hotel, address or landmark" /></label>
          <label>Destination<input required minLength={2} maxLength={200} value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Where are you headed?" /></label>
          <label>Estimated route distance<input required type="number" min="0.1" max="1500" step="0.1" value={distanceKm} onChange={(event) => { setDistanceKm(event.target.value); setEstimatedFare(null); }} placeholder="Distance in kilometres" /><small>Use the route distance from your preferred map.</small></label>
          <div className="fare-estimate"><span>Estimated fare</span><strong>{estimatedFare === null ? "Add route distance" : `LKR ${estimatedFare.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`}</strong></div>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="button button-dark" type="submit" disabled={loading}>{loading ? "Sending request…" : "Request this ride"}<span aria-hidden="true">↗</span></button>
        </form>
      </section>
    </main>
  );
}