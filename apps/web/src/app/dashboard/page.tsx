"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bell,
  CarFront,
  CircleUserRound,
  Clock3,
  House,
  LogOut,
  Plane,
  Search,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type SessionUser = { id: string; fullName: string; email: string; roles: string[] };
type Ride = { id: string; reference: string; pickup: string; destination: string; status: string; createdAt: string };

const services = [
  {
    title: "Transportation",
    description: "Book rides, rent vehicles, view routes & fares",
    href: "/rides/new",
    icon: CarFront,
    tone: "mint",
  },
  {
    title: "Food & Dining",
    description: "Order food, book tables at top restaurants",
    href: "/?service=Food",
    icon: Utensils,
    tone: "rose",
  },
  {
    title: "Travel Planner",
    description: "Explore destinations, create itineraries, find guides",
    href: "/?service=Trips",
    icon: Plane,
    tone: "sky",
  },
];

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

  const firstName = user?.fullName.split(" ")[0] ?? "Traveler";
  const initials = user?.fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "W";

  return (
    <main className="dashboard-page travel-dashboard">
      <aside className="dashboard-sidebar">
        <Link className="dashboard-brand" href="/" aria-label="Wayfarer home">
          <span className="dashboard-brand-mark"><Plane size={19} aria-hidden="true" /></span>
          <span>Wayfarer</span>
        </Link>

        <nav className="dashboard-sidebar-nav" aria-label="Dashboard">
          <Link className="sidebar-link active" href="/dashboard"><House size={17} aria-hidden="true" /><span>Home</span></Link>
          <Link className="sidebar-link" href="/rides/new"><CarFront size={17} aria-hidden="true" /><span>Transportation</span></Link>
          <Link className="sidebar-link" href="/?service=Food"><Utensils size={17} aria-hidden="true" /><span>Food &amp; Dining</span></Link>
          <Link className="sidebar-link" href="/?service=Trips"><Plane size={17} aria-hidden="true" /><span>Travel Planner</span></Link>
          <Link className="sidebar-link sidebar-link-spaced" href="#booking-history"><Clock3 size={17} aria-hidden="true" /><span>Booking History</span></Link>
          <Link className="sidebar-link" href="#profile"><CircleUserRound size={17} aria-hidden="true" /><span>Profile</span></Link>
        </nav>

        <button className="sidebar-link sidebar-logout" type="button" onClick={signOut}>
          <LogOut size={17} aria-hidden="true" /><span>Log out</span>
        </button>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <label className="dashboard-search">
            <Search size={16} aria-hidden="true" />
            <input type="search" placeholder="Search destinations, restaurants, or services..." aria-label="Search destinations, restaurants, or services" />
          </label>
          <div className="dashboard-topbar-actions">
            <Link className="dashboard-notifications" href="#booking-history" aria-label="Booking updates">
              <Bell size={18} aria-hidden="true" />
            </Link>
            <Link className="dashboard-profile" href="#profile" id="profile">
              <span className="profile-avatar" aria-hidden="true">{initials}</span>
              <span>{firstName}</span>
              <span className="profile-chevron" aria-hidden="true">⌄</span>
            </Link>
          </div>
        </header>

        <div className="dashboard-content dashboard-workspace">
          <section className="dashboard-welcome" aria-labelledby="dashboard-welcome-title">
            <div className="welcome-copy">
              <p className="eyebrow eyebrow-light">YOUR NEXT ADVENTURE STARTS HERE</p>
              <h1 id="dashboard-welcome-title">Explore. Dine. Travel.<br />All in One Place.</h1>
              <p>Discover amazing places, great food and comfortable travel options.</p>
              <Link className="welcome-search-link" href="/?service=Trips">
                <span>Where do you want to go?</span>
                <span className="welcome-search-icon"><Search size={17} aria-hidden="true" /></span>
              </Link>
            </div>
          </section>

          <section className="dashboard-services" aria-label="Travel services">
            {services.map(({ title, description, href, icon: Icon, tone }) => (
              <article className={`service-card service-card-${tone}`} key={title}>
                <span className="service-icon"><Icon size={28} strokeWidth={2.2} aria-hidden="true" /></span>
                <h2>{title}</h2>
                <p>{description}</p>
                <Link className="service-card-link" href={href}>Explore <ArrowRight size={15} aria-hidden="true" /></Link>
              </article>
            ))}
          </section>

          <section className="booking-list dashboard-bookings" id="booking-history">
            <div className="booking-list-heading">
              <div><p className="eyebrow">YOUR TRAVEL PLANS</p><h2>Booking history</h2></div>
              <span>{rides.length} {rides.length === 1 ? "booking" : "bookings"}</span>
            </div>
            {rides.length === 0 ? (
              <div className="empty-bookings">
                <span aria-hidden="true">↗</span>
                <p>Your next adventure hasn’t been booked yet.</p>
                <Link href="/rides/new">Start with a ride</Link>
              </div>
            ) : rides.map((ride) => (
              <article className="ride-row" key={ride.id}>
                <div>
                  <strong>{ride.pickup} <span aria-hidden="true">→</span> {ride.destination}</strong>
                  <small>{ride.reference} · {new Date(ride.createdAt).toLocaleDateString()}</small>
                </div>
                <span className={`status status-${ride.status.toLowerCase()}`}>{ride.status.toLowerCase()}</span>
              </article>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
