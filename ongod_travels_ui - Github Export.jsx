import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function OnGodTravels() {
  const [page, setPage] = useState("landing");
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem("ogt:lastQuiz");
    return (
      saved ? JSON.parse(saved) : {
        origin: "BOM",
        start: new Date().toISOString().slice(0, 10),
        end: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
        style: "balanced",
        interests: ["food", "photo"],
        budgetINR: 40000,
        adults: 1,
        weather: "warm",
        nightlife: true,
        diet: "none",
        vibe: "mix",
      }
    );
  });
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [historyList, setHistoryList] = useState(() => JSON.parse(localStorage.getItem("ogt:history") || "[]"));

  useEffect(() => {
    localStorage.setItem("ogt:history", JSON.stringify(historyList));
  }, [historyList]);

  const budgetTier = useMemo(() => {
    const n = Number(answers.budgetINR || 0);
    if (n < 25000) return "budget";
    if (n < 60000) return "mid";
    return "premium";
  }, [answers.budgetINR]);

  const planTrip = async () => {
    setError("");
    setLoading(true);
    try {
      localStorage.setItem("ogt:lastQuiz", JSON.stringify(answers));
      const result = mockPlanner(answers);
      setItinerary(result);
      setHistoryList([{ ts: Date.now(), answers, result }, ...historyList].slice(0, 50));
      setPage("home");
    } catch (e) {
      console.error(e);
      setError("Something broke. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <CursorGlow />
      <Header page={page} setPage={setPage} />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-20">
        {page === "landing" && <Landing setPage={setPage} />}
        {page === "home" && (
          <Home
            answers={answers}
            setAnswers={setAnswers}
            budgetTier={budgetTier}
            planTrip={planTrip}
            itinerary={itinerary}
            loading={loading}
            error={error}
          />
        )}
        {page === "previous" && <HistorySection historyList={historyList} setPage={setPage} />}
        {page === "packages" && <PackagesSection />}
        {page === "about" && <AboutSection />}
        {page === "feedback" && <FeedbackSection />}
      </main>
      <Footer />
    </div>
  );
}

function Landing({ setPage }) {
  const images = [
    "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1526779259212-939e64788e3c?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=600&auto=format&fit=crop",
  ];
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 md:p-12 backdrop-blur-xl">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(600px_300px_at_80%_20%,rgba(255,106,0,0.25),transparent),radial-gradient(500px_240px_at_20%_80%,rgba(0,170,255,0.12),transparent)]" />
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-semibold">
        OnGod Travels
      </motion.h1>
      <p className="mt-3 max-w-2xl text-white/80">
        Your AI-powered travel buddy. Clean, fast, privacy-first. Plan trips that feel like you.
      </p>
      <div className="mt-5 flex gap-3">
        <button onClick={() => setPage("home")} className="rounded-2xl bg-orange-500 px-5 py-3 text-black font-medium hover:bg-orange-400">
          Start Planning ✈️
        </button>
        <button onClick={() => setPage("packages")} className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 hover:bg-white/15">
          Explore Packages 🌍
        </button>
      </div>
      <div className="mt-10 grid grid-cols-4 gap-3">
        {images.map((src, i) => (
          <motion.img
            key={i}
            src={src}
            alt="travel"
            className="h-24 w-full rounded-2xl object-cover"
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 200 }}
          />
        ))}
      </div>
    </section>
  );
}

function Home({ answers, setAnswers, budgetTier, planTrip, itinerary, loading, error }) {
  return (
    <div className="pt-6">
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <h3 className="flex items-center gap-2 font-medium">Your vibe 🧭</h3>
          <div className="mt-4 space-y-4 text-sm">
            <Labeled label="Origin (IATA)">
              <input value={answers.origin || ""} onChange={(e) => setAnswers((a) => ({ ...a, origin: e.target.value.toUpperCase().slice(0, 3) }))} placeholder="BOM" className="w-full rounded-xl bg-white/10 px-3 py-2 outline-none" />
            </Labeled>
            <div className="grid grid-cols-2 gap-3">
              <Labeled label="Start">
                <input type="date" value={answers.start} onChange={(e) => setAnswers((a) => ({ ...a, start: e.target.value }))} className="w-full rounded-xl bg-white/10 px-3 py-2 outline-none" />
              </Labeled>
              <Labeled label="End">
                <input type="date" value={answers.end} onChange={(e) => setAnswers((a) => ({ ...a, end: e.target.value }))} className="w-full rounded-xl bg-white/10 px-3 py-2 outline-none" />
              </Labeled>
            </div>
            <Labeled label="Budget (total)">
              <div className="flex items-center gap-3">
                <input type="range" min={10000} max={120000} step={1000} value={answers.budgetINR} onChange={(e) => setAnswers((a) => ({ ...a, budgetINR: Number(e.target.value) }))} className="w-full accent-orange-500" />
                <span className="w-28 text-right tabular-nums">{inr(answers.budgetINR)}</span>
              </div>
              <p className="mt-1 text-xs text-white/60">Tier: {budgetTier}</p>
            </Labeled>
            <Labeled label="Crew size">
              <input type="number" min={1} max={6} value={answers.adults} onChange={(e) => setAnswers((a) => ({ ...a, adults: Math.max(1, Math.min(6, Number(e.target.value))) }))} className="w-full rounded-xl bg-white/10 px-3 py-2 outline-none" />
            </Labeled>
            <Labeled label="Pace">
              <ChipRow value={answers.style} onChange={(v) => setAnswers((a) => ({ ...a, style: v }))} options={[{ v: "chill", t: "Chill" }, { v: "balanced", t: "Balanced" }, { v: "packed", t: "Packed" }]} />
            </Labeled>
            <Labeled label="Core interests">
              <MultiChips value={answers.interests} onChange={(v) => setAnswers((a) => ({ ...a, interests: v }))} options={["food", "photo", "nightlife", "history", "adventure", "beach", "nature", "shopping", "wellness"]} />
            </Labeled>
            <Labeled label="Vibe preference">
              <ChipRow value={answers.vibe} onChange={(v) => setAnswers((a) => ({ ...a, vibe: v }))} options={[{ v: "beach", t: "Beach" }, { v: "mountain", t: "Mountain" }, { v: "city", t: "City" }, { v: "mix", t: "Mix" }]} />
            </Labeled>
            <Labeled label="Nightlife">
              <Toggle value={!!answers.nightlife} onChange={(v) => setAnswers((a) => ({ ...a, nightlife: v }))} />
            </Labeled>
            <div className="grid grid-cols-2 gap-3">
              <Labeled label="Diet">
                <select value={answers.diet} onChange={(e) => setAnswers((a) => ({ ...a, diet: e.target.value }))} className="w-full rounded-xl bg-white/10 px-3 py-2 outline-none">
                  {["none", "veg", "non-veg", "vegan", "halal", "jain"].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Labeled>
              <Labeled label="Weather">
                <select value={answers.weather} onChange={(e) => setAnswers((a) => ({ ...a, weather: e.target.value }))} className="w-full rounded-xl bg-white/10 px-3 py-2 outline-none">
                  {["warm", "mild", "cold", "any"].map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </Labeled>
            </div>
            <button onClick={planTrip} disabled={loading} className={cx("mt-2 w-full rounded-2xl px-4 py-3 font-medium border border-orange-500/30", loading ? "bg-orange-500/20" : "bg-orange-500 text-black hover:bg-orange-400")}>
              {loading ? "Thinking…" : "Generate itinerary"}
            </button>
            {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
          </div>
        </div>
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          {!itinerary && !loading && <EmptyState />}
          <AnimatePresence>
            {itinerary && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {itinerary.destination} {itinerary.country ? <span className="text-white/60 text-base">· {itinerary.country}</span> : null}
                    </h3>
                    <p className="text-sm text-white/70">
                      Tailored: {answers.style}, {answers.interests.slice(0, 3).join(", ")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {itinerary.flight?.deepLink && (
                      <a href={itinerary.flight.deepLink} target="_blank" rel="noreferrer" className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm">
                        ✈️ Flights {itinerary.flight.priceINR ? `· ${inr(itinerary.flight.priceINR)}` : ""}
                      </a>
                    )}
                    {itinerary.stay?.deepLink && (
                      <a href={itinerary.stay.deepLink} target="_blank" rel="noreferrer" className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm">
                        📍 Stays {itinerary.stay.priceINR ? `· ${inr(itinerary.stay.priceINR)}` : ""}
                      </a>
                    )}
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <InfoCard title="Flight" subtitle={itinerary.flight?.carrier || "Suggested"} right={itinerary.flight?.priceINR ? inr(itinerary.flight.priceINR) : undefined}>
                    {itinerary.flight?.deepLink ? <p className="text-xs text-white/70">Open link for live prices.</p> : <p className="text-xs text-white/70">Domestic trip – no flight needed.</p>}
                  </InfoCard>
                  <InfoCard title="Stay" subtitle={itinerary.stay?.name || "Suggested"} right={itinerary.stay?.priceINR ? inr(itinerary.stay.priceINR) : undefined}>
                    <p className="text-xs text-white/70">Rating ~{itinerary.stay?.rating ?? 4.4} · {answers.adults} adult(s)</p>
                  </InfoCard>
                  <InfoCard title="Budget" subtitle="Est. total">
                    <p className="text-base font-medium">{inr((itinerary.flight?.priceINR || 0) + (itinerary.stay?.priceINR || 0) + 6000)}</p>
                    <p className="text-xs text-white/60">Includes food & local travel placeholder.</p>
                  </InfoCard>
                </div>
                <div className="space-y-4">
                  {itinerary.days.map((d, i) => (
                    <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="font-medium">{d.title}</h4>
                        <span className="text-xs text-white/60">{d.summary}</span>
                      </div>
                      <div className="mt-3 space-y-2">
                        {d.activities.map((ac, j) => (
                          <div key={j} className="flex items-center justify-between text-sm">
                            <span className="text-white/80">{ac.time ? <span className="mr-2 tabular-nums text-white/50">{ac.time}</span> : null}{ac.name}</span>
                            <span className="text-xs text-white/60">{ac.priceINR ? inr(ac.priceINR) : ac.note}</span>
                          </div>
                        ))}
                      </div>
                      {d.evening && <p className="mt-3 text-sm text-white/70">Evening: {d.evening}</p>}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

function HistorySection({ historyList, setPage }) {
  return (
    <section className="pt-6">
      <h2 className="flex items-center gap-2 text-2xl font-semibold">Previous Searches 📜</h2>
      <p className="mt-1 text-sm text-white/70">Stored locally on this device.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {historyList.length === 0 && (
          <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            No history yet. Head to Home <button onClick={() => setPage("home")} className="text-orange-400 underline">and plan one</button> ✨
          </div>
        )}
        {historyList.map((h, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{h.result.destination}</div>
              <div className="text-xs text-white/60">{new Date(h.ts).toLocaleDateString()}</div>
            </div>
            <div className="mt-2 text-xs text-white/70">Budget ~ {inr((h.result.flight?.priceINR || 0) + (h.result.stay?.priceINR || 0) + 6000)}</div>
            <div className="mt-3 flex gap-2 text-xs">
              <span className="rounded-lg bg-orange-500/20 px-2 py-1 text-orange-200">{h.answers.style}</span>
              <span className="rounded-lg bg-white/10 px-2 py-1">{h.answers.interests.slice(0, 2).join(" • ")}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PackagesSection() {
  const packs = [
    { title: "Beach & Beats", desc: "3-day coastal escapes with curated nightlife 🏖️🎶", price: "₹4,999", tag: "Goa / Phuket / Bali" },
    { title: "Mountain Reset", desc: "Slow mornings, viewpoints, cedar-scented cafes 🏔️", price: "₹5,999", tag: "Manali / Bir / Leh" },
    { title: "City Sprint", desc: "72-hour urban blitz with coffee + culture ☕🏙️", price: "₹5,499", tag: "Bangkok / Singapore / Dubai" },
  ];
  return (
    <section className="pt-6">
      <h2 className="flex items-center gap-2 text-2xl font-semibold">Itinerary Packages 🎁</h2>
      <p className="mt-1 text-sm text-white/70">Creator-curated packs you can apply anywhere.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {packs.map((p, i) => (
          <div key={i} className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-orange-500/40">
            <div className="flex items-center gap-2 text-lg font-medium">{p.title} <span>⭐</span></div>
            <p className="mt-1 text-sm text-white/70">{p.desc}</p>
            <div className="mt-3 text-xs text-white/60">{p.tag}</div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-base font-semibold text-orange-400">{p.price}</span>
              <button className="rounded-xl bg-orange-500 px-3 py-2 text-sm text-black">Preview</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="pt-6">
      <h2 className="flex items-center gap-2 text-2xl font-semibold">About Us ℹ️</h2>
      <div className="mt-5 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-medium">OnGod Travels — built by Veer Shounak</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/80">
            This started on a random Tuesday at 1AM. I was jamming with my school senior, Saksham Sinha, and we asked a simple question: what if trip planning actually respected your vibe? No spam, no clutter, no generic lists — just a clean AI buddy that learns what you like and gets out of your way.
          </p>
          <p className="mt-3 text-sm text-white/70">I build brands and media for a living. OnGod Travels is the travel product I wanted for myself — privacy-first, gorgeous, and fast.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm text-white/80">Principles</div>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>• Premium, minimal UI</li>
            <li>• Smart preference learning</li>
            <li>• Tight booking integrations</li>
            <li>• Trust & privacy by default</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function FeedbackSection() {
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const send = () => {
    if (!msg.trim()) return;
    const box = JSON.parse(localStorage.getItem("ogt:feedback") || "[]");
    box.unshift({ msg, ts: Date.now() });
    localStorage.setItem("ogt:feedback", JSON.stringify(box));
    setSent(true);
    setMsg("");
  };
  return (
    <section className="pt-6">
      <h2 className="flex items-center gap-2 text-2xl font-semibold">Feedback 💬</h2>
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-white/70">Tell us what to build next.</p>
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Write your thoughts…" className="mt-4 h-32 w-full rounded-xl bg-white/10 px-3 py-2 outline-none" />
        <div className="mt-3 flex items-center justify-between">
          <button onClick={send} className="rounded-xl bg-orange-500 px-4 py-2 text-sm text-black">Send</button>
          {sent && <span className="flex items-center gap-2 text-sm text-emerald-300">👍 Thanks!</span>}
        </div>
      </div>
    </section>
  );
}

function Header({ page, setPage }) {
  const nav = [
    { id: "landing", label: "Home" },
    { id: "home", label: "Search" },
    { id: "previous", label: "Previous Searches" },
    { id: "packages", label: "Itinerary Packages" },
    { id: "about", label: "About Us" },
    { id: "feedback", label: "Feedback" },
  ];
  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/40">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/10 text-xs">🧭</div>
          <span className="font-semibold">OnGod Travels</span>
        </div>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <button key={n.id} onClick={() => setPage(n.id)} className={cx("rounded-xl border px-3 py-2 text-sm", page === n.id ? "border-orange-500/40 bg-orange-500/10" : "border-white/10 hover:bg-white/5")}>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="md:hidden">
          <select value={page} onChange={(e) => setPage(e.target.value)} className="rounded-xl bg-white/10 px-2 py-1 text-sm">
            {nav.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-10 border-t border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
        <div>Privacy-first. Your data stays on-device unless you book.</div>
        <div>© {new Date().getFullYear()} OnGod Travels · Built with 🧠 + ✈️</div>
      </div>
    </footer>
  );
}

function Labeled({ label, children }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs uppercase tracking-wide text-white/60">{label}</div>
      {children}
    </label>
  );
}

function Chip({ active, children, onClick }) {
  return (
    <button onClick={onClick} className={cx("rounded-xl px-3 py-2 text-sm border", active ? "border-orange-500/60 bg-orange-500/10" : "border-white/10 bg-white/5 hover:bg-white/10")}>
      {children}
    </button>
  );
}

function ChipRow({ value, onChange, options }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip key={o.v} active={value === o.v} onClick={() => onChange(o.v)}>
          {o.t}
        </Chip>
      ))}
    </div>
  );
}

function MultiChips({ value, onChange, options }) {
  const toggle = (v) => {
    const set = new Set(value);
    set.has(v) ? set.delete(v) : set.add(v);
    onChange(Array.from(set));
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip key={o} active={value.includes(o)} onClick={() => toggle(o)}>
          {o}
        </Chip>
      ))}
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} className={cx("w-full rounded-xl px-3 py-2 text-sm border", value ? "border-emerald-300/60 bg-emerald-300/10" : "border-white/10 bg-white/5")}>{value ? "On" : "Off"}</button>
  );
}

function InfoCard({ title, subtitle, right, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-white/60">{title}</div>
          <div className="text-sm font-medium">{subtitle}</div>
        </div>
        {right && <div className="text-sm font-medium text-orange-300">{right}</div>}
      </div>
      <div className="mt-2 text-sm text-white/80">{children}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="grid h-full place-items-center py-10 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/5">✈️</div>
        <h3 className="text-lg font-medium">No plan yet</h3>
        <p className="mt-1 text-sm text-white/70">Set your dates, pace, and interests on the left. We’ll draft a 3-day plan with bookable links.</p>
      </div>
    </div>
  );
}

function CursorGlow() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e) => {
      el.style.transform = `translate(${e.clientX - 120}px, ${e.clientY - 120}px)`;
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return <div ref={ref} className="pointer-events-none fixed left-0 top-0 z-0 h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(255,106,0,0.18),transparent_60%)]" />;
}

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

function inr(n) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
  } catch {
    return `₹${n}`;
  }
}

function skyScannerQuery(origin, destination, start, end) {
  const s = String(start || "").replaceAll("-", "");
  const e = String(end || "").replaceAll("-", "");
  return `https://www.skyscanner.com/transport/flights/${encodeURIComponent(origin || "BOM")}/${encodeURIComponent(destination)}/${s}/${e}/`;
}

function bookingQuery(place, start, end, adults) {
  return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(place)}&checkin=${start}&checkout=${end}&group_adults=${adults || 1}`;
}

function mockPlanner(a) {
  const destination = a.vibe === "beach" ? "Goa" : a.vibe === "mountain" ? "Manali" : a.vibe === "city" ? "Bangkok" : a.nightlife ? "Bangkok" : "Udaipur";
  const stayBase = a.budgetINR < 25000 ? 3500 : a.budgetINR < 60000 ? 6500 : 12000;
  const it = {
    destination,
    country: destination === "Bangkok" ? "Thailand" : "India",
    flight: destination === "Bangkok" ? {
      carrier: "IndiGo",
      priceINR: 21000,
      deepLink: skyScannerQuery(a.origin || "BOM", "BKK", a.start, a.end),
    } : undefined,
    stay: {
      name: destination === "Goa" ? "Vivenda Rebelo" : destination === "Manali" ? "The Himalayan" : destination === "Bangkok" ? "The Quarter Silom" : "Jagat Niwas Palace",
      priceINR: 3 * stayBase,
      rating: 4.4,
      deepLink: bookingQuery(destination, a.start, a.end, a.adults),
    },
    days: [
      {
        title: "Day 1 – Arrival & Neighborhood Walk",
        summary: `Check in, quick local exploration, and a ${a.style} pace evening.`,
        activities: [
          { time: "10:00", name: "Arrival & hotel check-in" },
          { time: "13:00", name: "Local lunch", note: a.diet === "veg" ? "veg-friendly" : undefined, priceINR: 600 },
          { time: "16:00", name: "Old town walk & photos" },
        ],
        evening: a.nightlife ? "Cocktails + live music 🎷" : "Sunset viewpoint 🌇 & early dinner",
      },
      {
        title: "Day 2 – Signature Experiences",
        summary: `Curated picks across your interests: ${a.interests.join(", ") || "highlights"}.`,
        activities: [
          { time: "09:00", name: "Guided experience #1" },
          { time: "14:00", name: "Cafe crawl ☕ + creative pause" },
          { time: "17:00", name: "Golden hour photo spot 📸" },
        ],
        evening: a.nightlife ? "Night market + club hop 🕺" : "Spa & slow dinner by the water",
      },
      {
        title: "Day 3 – Flex & Fly",
        summary: "Buffer for shopping, food you missed, and airport transfers.",
        activities: [
          { time: "10:00", name: "Brunch at a top-rated spot 🥞" },
          { time: "12:00", name: "Souvenir run" },
        ],
      },
    ],
    notes: [
      "This is a mock itinerary. Hook your /api/plan to go live.",
      "Refine results by toggling style, budget, and interests.",
    ],
  };
  return it;
}
