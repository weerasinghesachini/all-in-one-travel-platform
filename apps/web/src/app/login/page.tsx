"use client";

import { Suspense, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  return <Suspense fallback={<main className="login-shell" />}><LoginForm /></Suspense>;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [registering, setRegistering] = useState(searchParams.get("mode") === "register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/v1/auth/${registering ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(registering ? { fullName: name, email, password } : { email, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "We couldn't sign you in. Please try again.");
      const requestedPath = searchParams.get("next");
      let returnPath = "/dashboard";
      if (requestedPath) {
        const requestedUrl = new URL(requestedPath, window.location.origin);
        if (requestedUrl.origin === window.location.origin) returnPath = `${requestedUrl.pathname}${requestedUrl.search}${requestedUrl.hash}`;
      }
      router.push(returnPath);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to reach the travel service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-visual" aria-label="Travel inspiration">
        <Link className="brand" href="/"><span className="brand-mark">W</span> wayfarer<span className="brand-period">.</span></Link>
        <div className="login-quote"><p>“The best journeys take you home to yourself.”</p><span>Find your own way around the island.</span></div>
      </section>
      <section className="login-form-side">
        <div className="login-box">
          <p className="eyebrow">YOUR ISLAND, IN GOOD HANDS</p>
          <h1>{registering ? "Start your story." : "Welcome back."}</h1>
          <p className="login-subtitle">{registering ? "Create an account to bring every part of your trip together." : "Sign in to pick up right where your journey left off."}</p>
          <form className="auth-form" onSubmit={submit}>
            {registering && <label>Full name<input autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label>}
            <label>Email address<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
            <label>Password<input type="password" autoComplete={registering ? "new-password" : "current-password"} required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="button button-dark" type="submit" disabled={loading}>{loading ? "Please wait…" : registering ? "Create account" : "Sign in"}<span aria-hidden="true">↗</span></button>
          </form>
          <button className="auth-switch" type="button" onClick={() => { setRegistering(!registering); setError(""); }}>{registering ? "Already have an account? Sign in" : "New to Wayfarer? Create an account"}</button>
          <Link className="back-home" href="/">← Back to exploring</Link>
        </div>
      </section>
    </main>
  );
}