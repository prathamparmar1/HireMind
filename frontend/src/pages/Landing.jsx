import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./Landing.css";

const CANDIDATES = [
  {
    name: "Aditi Sharma",
    role: "Senior Backend Engineer",
    score: 92,
    skills: ["Python", "FastAPI", "PostgreSQL", "Docker"],
    missing: ["AWS"],
  },
  {
    name: "Rohit Mehta",
    role: "Backend Engineer",
    score: 85,
    skills: ["Python", "Django", "PostgreSQL"],
    missing: ["Docker"],
  },
  {
    name: "Karan Verma",
    role: "Backend Engineer",
    score: 78,
    skills: ["Python", "Flask"],
    missing: ["PostgreSQL", "Docker"],
  },
];

const STEPS = [
  {
    n: "01",
    title: "Upload a job description",
    body: "Paste the role or upload a JD. HireMind reads the requirements the same way a recruiter would.",
  },
  {
    n: "02",
    title: "Upload candidate resumes",
    body: "PDF or DOCX, one file or a hundred. No formatting required on your end.",
  },
  {
    n: "03",
    title: "AI extracts every profile",
    body: "Skills, experience, education, and projects are pulled from raw text into structured data.",
  },
  {
    n: "04",
    title: "Candidates are scored and ranked",
    body: "Each candidate is compared against the role and ranked by actual fit, with reasons attached.",
  },
];

const FEATURES = [
  {
    title: "AI resume parsing",
    body: "Structured candidate data extracted from raw PDF and DOCX text, instantly.",
  },
  {
    title: "Candidate matching engine",
    body: "Every candidate compared against the role's real requirements, not keyword overlap.",
  },
  {
    title: "Skill gap analysis",
    body: "See exactly what a candidate is missing before you schedule the interview.",
  },
  {
    title: "Reasoned scoring",
    body: "Every match score ships with the reasoning behind it, in plain language.",
  },
  {
    title: "Recruiter dashboard",
    body: "One ranked view per role. Open it, and start with your strongest candidates.",
  },
  {
    title: "Built to extend",
    body: "Designed as services that can plug in interview generation, analytics, and scheduling next.",
  },
];

const METRICS = [
  { value: "80%", label: "Less time spent on manual screening" },
  { value: "3×", label: "Faster candidate shortlisting" },
  { value: "100%", label: "Structured, comparable candidate profiles" },
];

function useInViewport() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  const [problemRef, problemVisible] = useInViewport();
  const [metricsRef, metricsVisible] = useInViewport();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="landing">
      <nav className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
        <div className="nav-inner">
          <div className="nav-logo">
            <span className="nav-logo-mark">H</span>
            HireMind
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#demo">Demo</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className="nav-actions">
            <button className="btn-ghost" onClick={() => navigate("/jobs")}>
              Log in
            </button>
            <button className="btn-primary" onClick={() => navigate("/create-job")}>
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="hero-inner">
          <p className="eyebrow">AI-native applicant tracking</p>
          <h1 className="hero-title">
            Hire the right candidate
            <br />
            in minutes, not weeks.
          </h1>
          <p className="hero-sub">
            Upload resumes and a job description. HireMind extracts every candidate
            profile, ranks applicants against the role, flags skill gaps, and
            surfaces your strongest matches automatically.
          </p>
          <div className="hero-actions">
            <button className="btn-primary btn-large" onClick={() => navigate("/create-job")}>
              Create new post
            </button>
            <button className="btn-secondary btn-large" onClick={() => navigate("/jobs")}>
              Watch existing posts
            </button>
          </div>
        </div>

        <div className={`hero-mockup ${heroVisible ? "is-visible" : ""}`}>
          <div className="mockup-frame">
            <div className="mockup-titlebar">
              <div className="mockup-dots">
                <span /><span /><span />
              </div>
              <span className="mockup-path">hiremind.app/jobs/backend-developer</span>
            </div>

            <div className="mockup-body">
              <div className="mockup-sidebar">
                <div className="mockup-job-card">
                  <span className="mockup-job-label">Open role</span>
                  <span className="mockup-job-title">Backend Developer</span>
                  <span className="mockup-job-meta">142 applicants · Bangalore</span>
                </div>
                <div className="mockup-filter-row">
                  <span className="mockup-filter active">All candidates</span>
                  <span className="mockup-filter">Shortlisted</span>
                </div>
                <div className="mockup-chart">
                  <div className="chart-bar" style={{ height: "38%" }} />
                  <div className="chart-bar" style={{ height: "62%" }} />
                  <div className="chart-bar" style={{ height: "84%" }} />
                  <div className="chart-bar" style={{ height: "51%" }} />
                  <div className="chart-bar" style={{ height: "70%" }} />
                </div>
              </div>

              <div className="mockup-list">
                {CANDIDATES.map((c, i) => (
                  <div className="mockup-candidate" key={c.name} style={{ transitionDelay: `${i * 90}ms` }}>
                    <div className="mockup-candidate-top">
                      <div className="mockup-avatar">{c.name.split(" ").map((p) => p[0]).join("")}</div>
                      <div className="mockup-candidate-info">
                        <span className="mockup-candidate-name">{c.name}</span>
                        <span className="mockup-candidate-role">{c.role}</span>
                      </div>
                      <div className={`mockup-score ${c.score >= 80 ? "score-high" : "score-mid"}`}>
                        {c.score}%
                      </div>
                    </div>
                    <div className="mockup-skills">
                      {c.skills.map((s) => (
                        <span className="chip chip-have" key={s}>✓ {s}</span>
                      ))}
                      {c.missing.map((s) => (
                        <span className="chip chip-missing" key={s}>{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* TRUST */}
      <section className="trust">
        <p className="trust-label">Designed for modern recruiting teams</p>
        <div className="trust-logos">
          <span>NORTHPEAK</span>
          <span>VELOCIRA</span>
          <span>ARCFORM</span>
          <span>STRATALINE</span>
          <span>QUORUM</span>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="problem" ref={problemRef}>
        <div className="problem-inner">
          <div className={`problem-flow ${problemVisible ? "is-visible" : ""}`}>
            <div className="flow-node">500+ applications</div>
            <div className="flow-arrow">↓</div>
            <div className="flow-node">Manual screening</div>
            <div className="flow-arrow">↓</div>
            <div className="flow-node flow-node-warn">Missed qualified candidates</div>
            <div className="flow-arrow">↓</div>
            <div className="flow-node flow-node-warn">Slow hiring decisions</div>
          </div>

          <div className="problem-copy">
            <p className="eyebrow">The problem</p>
            <h2>Recruiters are drowning in resumes.</h2>
            <p className="problem-body">
              HireMind extracts, evaluates, and ranks every candidate automatically —
              so your team spends its time interviewing the best people, not
              scrolling through a folder of PDFs.
            </p>

            <div className="compare-table">
              <div className="compare-col">
                <span className="compare-head">Traditional hiring</span>
                <span className="compare-row">Manual resume review</span>
                <span className="compare-row">Inconsistent screening</span>
                <span className="compare-row">Days to shortlist</span>
              </div>
              <div className="compare-col compare-col-highlight">
                <span className="compare-head">With HireMind</span>
                <span className="compare-row">Automatic extraction</span>
                <span className="compare-row">Consistent, reasoned scoring</span>
                <span className="compare-row">Minutes to shortlist</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how" id="how-it-works">
        <p className="eyebrow center">How it works</p>
        <h2 className="section-title center">From job post to shortlist, in four steps</h2>

        <div className="steps">
          {STEPS.map((s, i) => (
            <div className="step-card" key={s.n}>
              <span className="step-num">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              {i < STEPS.length - 1 && <span className="step-connector" />}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">
        <p className="eyebrow center">Features</p>
        <h2 className="section-title center">Everything a recruiter needs in one workspace</h2>

        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCT DEMO */}
      <section className="demo" id="demo">
        <p className="eyebrow center">See it work</p>
        <h2 className="section-title center">Job description in. Ranked candidates out.</h2>

        <div className="demo-panels">
          <div className="demo-panel">
            <span className="demo-panel-label">Job description</span>
            <div className="demo-jd">
              <span className="demo-jd-title">Backend Developer</span>
              <span className="demo-jd-line">Python · FastAPI · PostgreSQL · Docker</span>
              <span className="demo-jd-line muted">3+ years building production APIs</span>
            </div>
          </div>

          <div className="demo-arrow">
            <span className="demo-arrow-label">AI processing</span>
            <div className="demo-arrow-line" />
          </div>

          <div className="demo-panel">
            <span className="demo-panel-label">Ranked candidate</span>
            <div className="demo-result">
              <div className="demo-result-top">
                <span className="demo-result-name">Aditi Sharma</span>
                <span className="demo-result-score">92%</span>
              </div>
              <span className="demo-result-reason">
                Strong match on core stack. Has shipped FastAPI services in production.
              </span>
              <span className="demo-result-missing">Missing: AWS</span>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section className={`metrics ${metricsVisible ? "is-visible" : ""}`} ref={metricsRef}>
        {METRICS.map((m) => (
          <div className="metric-card" key={m.label}>
            <span className="metric-value">{m.value}</span>
            <span className="metric-label">{m.label}</span>
          </div>
        ))}
      </section>

      {/* BENEFITS */}
      <section className="benefits">
        <p className="eyebrow center">Built for the work recruiters actually do</p>
        <h2 className="section-title center">Make faster hiring decisions, with less manual work</h2>

        <div className="benefit-list">
          <div className="benefit-row">
            <span className="benefit-num">01</span>
            <span>Reduce manual screening time across every open role</span>
          </div>
          <div className="benefit-row">
            <span className="benefit-num">02</span>
            <span>Identify qualified candidates instantly, not after a week of review</span>
          </div>
          <div className="benefit-row">
            <span className="benefit-num">03</span>
            <span>Improve hiring consistency across recruiters and teams</span>
          </div>
          <div className="benefit-row">
            <span className="benefit-num">04</span>
            <span>Scale recruitment operations without scaling headcount</span>
          </div>
          <div className="benefit-row">
            <span className="benefit-num">05</span>
            <span>Make every hiring decision with data, not gut feel alone</span>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <h2>Stop reviewing resumes manually.</h2>
        <p>Let AI identify your strongest candidates.</p>
        <div className="final-cta-actions">
          <button className="btn-primary btn-large" onClick={() => navigate("/create-job")}>
            Get started
          </button>
          <button className="btn-secondary btn-large" onClick={() => navigate("/jobs")}>
            Watch posts
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="nav-logo">
              <span className="nav-logo-mark">H</span>
              HireMind
            </div>
            <p>AI-native recruiting, built end to end.</p>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <span className="footer-col-title">Product</span>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#demo">Demo</a>
            </div>
            <div className="footer-col">
              <span className="footer-col-title">Company</span>
              <a href="#">Contact</a>
              <a href="#">Privacy policy</a>
              <a href="#">Terms</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} HireMind. All rights reserved.</span>
          <div className="footer-social">
            <span>LinkedIn</span>
            <span>GitHub</span>
            <span>X</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
