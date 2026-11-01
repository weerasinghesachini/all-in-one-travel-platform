"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const services = ["Stays", "Rides", "Cars", "Food", "Trips"];

const destinations = [
  { name: "Ella, Sri Lanka", detail: "Tea country, slow mornings", image: "https://images.unsplash.com/photo-1588258524675-c8e0e1a3b6b0?auto=format&fit=crop&w=900&q=85", tag: "MOUNTAIN ESCAPE" },
  { name: "Galle Fort", detail: "Coastal weekends, beautifully spent", image: "https://images.unsplash.com/photo-1586613835341-7f4f4c14265f?auto=format&fit=crop&w=900&q=85", tag: "CULTURE & COAST" },
  { name: "Sigiriya", detail: "A little wonder, a lot of history", image: "https://images.unsplash.com/photo-1588598198321-9735fd5fe7b4?auto=format&fit=crop&w=900&q=85", tag: "ANCIENT ISLAND" },
];

export default function Home() {
  const router = useRouter();
  const [service, setService] = useState("Stays");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams({ destination, date });
    router.push(service === "Rides" ? `/rides/new?${params.toString()}` : `/dashboard?${params.toString()}`);
  }

  return (
    <main>
      <header className="site-nav">
        <Link className="brand" href="/" aria-label="Wayfarer home"><span className="brand-mark">W</span> wayfarer<span className="brand-period">.</span></Link>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="#discover">Discover</a><a href="#how-it-works">How it works</a>
        </nav>
        <div className="nav-actions"><Link className="text-link" href="/login">Log in</Link><Link className="button button-dark button-small" href="/login?mode=register">Get started <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
      </header>

      <section className="hero">
        <div className="hero-image" role="img" aria-label="A quiet tropical coastline in Sri Lanka" />
        <div className="hero-content">
          <p className="eyebrow eyebrow-light">THE ISLAND, YOUR WAY</p>
          <h1>One trip.<br /><em>Every detail.</em></h1>
          <p className="hero-copy">Find your way around Sri Lanka, from the first ride to the last sunset.</p>
          <div className="search-panel">
            <div className="service-tabs" role="tablist" aria-label="What are you planning?">
              {services.map((item) => <button key={item} type="button" className={service === item ? "service-tab active" : "service-tab"} onClick={() => setService(item)} role="tab" aria-selected={service === item}>{item}</button>)}
            </div>
            <form className="search-form" onSubmit={search}>
              <label className="search-field"><span>Where to?</span><input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Choose a destination" /></label>
              <label className="search-field"><span>When?</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} aria-label="Travel date" /></label>
              <button className="button button-coral search-button" type="submit"><Search size={16} aria-hidden="true" /> Explore</button>
            </form>
          </div>
        </div>
        <p className="image-credit">SOUTHERN PROVINCE · SRI LANKA</p>
        <div className="hero-count"><span>01</span><span className="count-rule" /><span>03</span></div>
      </section>

      <section className="intro-strip" id="how-it-works">
        <p>Less juggling.<br /><strong>More journey.</strong></p>
        <p className="intro-copy">Rides, stays, wheels, tables and little detours. Bring the whole trip together in one place, and spend your time where it matters.</p>
        <Link className="arrow-link" href="/login">Plan your trip <ArrowUpRight size={14} aria-hidden="true" /></Link>
      </section>

      <section className="discover-section" id="discover">
        <div className="section-heading"><div><p className="eyebrow">A GOOD PLACE TO BEGIN</p><h2>Island days, <em>well spent.</em></h2></div><Link className="text-link" href="/dashboard">View all destinations <ArrowUpRight size={14} aria-hidden="true" /></Link></div>
        <div className="destination-grid">{destinations.map((place, index) => <Link className={`destination-card destination-${index + 1}`} href={`/dashboard?destination=${encodeURIComponent(place.name)}`} key={place.name} style={{ backgroundImage: `linear-gradient(180deg, transparent 30%, rgba(12, 28, 29, .75) 100%), url("${place.image}")` }}><span className="destination-tag">{place.tag}</span><span className="destination-name">{place.name}</span><span className="destination-detail">{place.detail}</span></Link>)}</div>
      </section>

      <footer className="site-footer"><Link className="brand brand-footer" href="/">wayfarer<span className="brand-period">.</span></Link><p>Make room for the good parts.</p><span>© 2026 Wayfarer Travel</span></footer>
    </main>
  );
}
