"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, CarFront, MapPinned } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type SessionUser = { id: string; fullName: string; email: string; roles: string[] };
type Ride = { id: string; reference: string; pickup: string; destination: string; status: string; createdAt: string };

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [sessionResponse, ridesResponse] = await Promise.all([
          fetch("/api/v1/auth/me", { credentials: "include" }),
          fetch("/api/v1/rides", { credentials: "include" }),
        ]);
        if (!sessionResponse.ok) {
          router.replace("/login");
          return;
        }
        const session = await sessionResponse.json();
        const rideData = ridesResponse.ok ? await ridesResponse.json() : { rides: [] };
        setUser(session.user);
        setRides(rideData.rides);
      } finally {
        setLoading(false);
      }
    }
    void loadDashboard();
  }, [router]);

  async function signOut() {
    await fetch("/api/v1/auth/logout", { method: "POST", credentials: "include" });
    router.push("/");
  }

  if (loading) return <main className="dashboard-loading">Loading your travel desk…</main>;

  return (
    <main className="dashboard-page">
      <header className="site-nav dashboard-nav">
        <Link className="brand" href="/"><span className="brand-mark">W</span> wayfarer<span className="brand-period">.</span></Link>
        <div className="nav-actions"><span className="dashboard-greeting">{user ? `Hello, ${user.fullName.split(" ")[0]}` : "Your travel desk"}</span><button className="button button-dark button-small" type="button" onClick={signOut}>Sign out</button></div>
      </header>
      <section className="dashboard-content">
        <p className="eyebrow">YOUR TRAVEL DESK</p>
        <h1>Good journeys<br /><em>start here.</em></h1>
        <p className="dashboard-intro">Your plans, bookings and next steps, all in one place.</p>
        <div className="dashboard-actions">
          <Link className="dashboard-action" href="/rides/new"><span className="action-symbol"><ArrowUpRight size={19} aria-hidden="true" /></span><strong>Book a ride</strong><small>Get there without the guesswork</small></Link>
          <Link className="dashboard-action" href="/?service=Cars"><span className="action-symbol"><CarFront size={19} aria-hidden="true" /></span><strong>Find a car</strong><small>Make the island yours to explore</small></Link>
          <Link className="dashboard-action" href="/?service=Trips"><span className="action-symbol"><MapPinned size={19} aria-hidden="true" /></span><strong>Plan a trip</strong><small>Keep every detail together</small></Link>
        </div>
        <section className="booking-list">
          <div className="booking-list-heading"><div><p className="eyebrow">ALL IN ONE PLACE</p><h2>Your ride requests</h2></div><span>{rides.length} {rides.length === 1 ? "booking" : "bookings"}</span></div>
          {rides.length === 0 ? <div className="empty-bookings"><span aria-hidden="true">↗</span><p>Your next adventure hasn’t been booked yet.</p><Link href="/rides/new">Start with a ride</Link></div> : rides.map((ride) => <article className="ride-row" key={ride.id}><div><strong>{ride.pickup} <span aria-hidden="true">→</span> {ride.destination}</strong><small>{ride.reference} · {new Date(ride.createdAt).toLocaleDateString()}</small></div><span className={`status status-${ride.status.toLowerCase()}`}>{ride.status.toLowerCase()}</span></article>)}
        </section>
      </section>
    </main>
  );
}