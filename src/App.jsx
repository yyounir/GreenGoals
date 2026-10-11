import { useEffect, useRef, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import { authServices, firebaseReady, loadDataServices } from "./firebase";
import {
  completeChallenge as completeChallengeRequest,
  createGroup as createGroupRequest,
  generateChallenges,
  initializeUser,
  joinGroup as joinGroupRequest,
} from "./data";

const initialChallenges = [
  {
    id: 1,
    category: "OUTDOORS",
    title: "Take the scenic route",
    description:
      "Walk, bike, or roll instead of driving for your next short trip.",
    points: 120,
    duration: "20 min",
    icon: "sun",
    color: "lime",
  },
  {
    id: 2,
    category: "AT HOME",
    title: "A plant-based plate",
    description: "Make one meal today with local, plant-forward ingredients.",
    points: 90,
    duration: "Today",
    icon: "leaf",
    color: "peach",
  },
  {
    id: 3,
    category: "COMMUNITY",
    title: "Give it a second life",
    description: "Repair, swap, or donate something you no longer use.",
    points: 150,
    duration: "This week",
    icon: "heart",
    color: "blue",
  },
];

const leaderboard = [
  {
    rank: 1,
    name: "Alex Morgan",
    handle: "@alexgrows",
    points: 2480,
    initials: "AM",
    color: "avatar-lilac",
  },
  {
    rank: 2,
    name: "Jamie Chen",
    handle: "@jamiechen",
    points: 2210,
    initials: "JC",
    color: "avatar-peach",
  },
  {
    rank: 3,
    name: "You",
    handle: "@you",
    points: 1840,
    initials: "YO",
    color: "avatar-green",
    you: true,
  },
  {
    rank: 4,
    name: "Sam Rivera",
    handle: "@samrivera",
    points: 1625,
    initials: "SR",
    color: "avatar-yellow",
  },
];

const navItems = [
  { id: "overview", label: "Overview", icon: "grid" },
  { id: "challenges", label: "Challenges", icon: "sparkle" },
  { id: "leaderboard", label: "Leaderboard", icon: "trophy" },
  { id: "groups", label: "My groups", icon: "users" },
];

function Icon({ name, size = 20, className = "" }) {
  const paths = {
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </>
    ),
    arrowUp: (
      <>
        <path d="M7 17 17 7" />
        <path d="M7 7h10v10" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    close: (
      <>
        <path d="m18 6-12 12" />
        <path d="m6 6 12 12" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="8" height="8" rx="2" />
        <rect x="13" y="3" width="8" height="5" rx="2" />
        <rect x="13" y="10" width="8" height="11" rx="2" />
        <rect x="3" y="13" width="8" height="8" rx="2" />
      </>
    ),
    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
    ),
    leaf: (
      <>
        <path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 10-6 8-16Z" />
        <path d="M4 20c3-5 7-8 12-10" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
      </>
    ),
    menu: (
      <>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.5.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.5-.9l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.8l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.5-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.5.9l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 1.8Z" />
      </>
    ),
    sparkle: (
      <>
        <path d="m12 3 1.9 5.8L20 11l-6.1 2.1L12 19l-1.9-5.9L4 11l6.1-2.2L12 3Z" />
        <path d="m19 14 1 2.5 2.5 1-2.5 1L19 21l-1-2.5-2.5-1 2.5-1L19 14Z" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </>
    ),
    trophy: (
      <>
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
        <path d="M17 6h4v2a4 4 0 0 1-4 4" />
        <path d="M7 6H3v2a4 4 0 0 0 4 4" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.9" />
        <path d="M16 3.1a4 4 0 0 1 0 7.8" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name] || paths.leaf}
    </svg>
  );
}

function Brand({ light = false, onClick }) {
  return (
    <a
      className={`brand${light ? " brand-light" : ""}`}
      href="#home"
      aria-label="GreenGoals home"
      onClick={(event) => {
        if (onClick) {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <span className="brand-mark">
        <Icon name="leaf" size={20} />
      </span>
      <span>
        green<span>goals</span>
      </span>
    </a>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48">
      <path
        fill="#4285F4"
        d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.8 6-15Z"
      />
      <path
        fill="#34A853"
        d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.7-5.1c-1.8 1.2-4 2-6.8 2-5.2 0-9.6-3.5-11.2-8.2H5.9v5.2A20 20 0 0 0 24 44Z"
      />
      <path
        fill="#FBBC05"
        d="M12.8 27.9a12 12 0 0 1 0-7.8v-5.2H5.9a20 20 0 0 0 0 18.2l6.9-5.2Z"
      />
      <path
        fill="#EA4335"
        d="M24 11.9c3 0 5.7 1 7.8 3.1l5.9-5.9A19.7 19.7 0 0 0 24 4 20 20 0 0 0 5.9 14.9l6.9 5.2c1.6-4.7 6-8.2 11.2-8.2Z"
      />
    </svg>
  );
}

function SignInModal({ onClose, onDemo, onGoogleSignIn, busy, authError }) {
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="signin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="signin-title"
      >
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="Close sign in"
        >
          <Icon name="close" />
        </button>
        <span className="modal-mark">
          <Icon name="leaf" size={24} />
        </span>
        <p className="eyebrow">A little good goes a long way</p>
        <h2 id="signin-title">Let’s grow something good.</h2>
        <p className="modal-copy">
          Sign in to save your points, meet your group, and take on your next
          challenge.
        </p>
        {firebaseReady ? (
          <button
            className="button google-signin-button"
            type="button"
            disabled={busy}
            onClick={onGoogleSignIn}
          >
            <GoogleMark />
            {busy ? "Connecting…" : "Continue with Google"}
          </button>
        ) : (
          <div className="google-config-note">
            <strong>Firebase sign-in setup</strong>
            <span>
              Add your Firebase web app configuration to <code>.env</code> to
              enable Google authentication and persistent accounts.
            </span>
          </div>
        )}
        {authError && (
          <p className="form-error" role="alert">
            {authError}
          </p>
        )}
        <div className="modal-divider">
          <span>or</span>
        </div>
        <button
          className="button button-secondary demo-button"
          type="button"
          onClick={onDemo}
        >
          Explore the demo <Icon name="arrow" size={18} />
        </button>
        <p className="signin-terms">
          By continuing, you agree to make a positive impact. 🌱
        </p>
      </section>
    </div>
  );
}

function LandingPage({ onSignIn }) {
  return (
    <main className="landing-page" id="home">
      <div className="landing-glow landing-glow-one" />
      <div className="landing-glow landing-glow-two" />
      <Header onSignIn={onSignIn} />
      <section className="hero container">
        <div className="hero-copy">
          <div className="hero-label">
            <span className="pulse-dot" /> GOOD HABITS. REAL IMPACT.
          </div>
          <h1>
            Small steps.
            <br />A <span>greener</span> world.
          </h1>
          <p className="hero-description">
            Turn everyday sustainable choices into a game worth playing. Join
            your people, take on a challenge, and see how far a little good can
            go.
          </p>
          <div className="hero-actions">
            <button
              className="button button-primary"
              type="button"
              onClick={onSignIn}
            >
              Start your journey <Icon name="arrow" size={18} />
            </button>
            <a className="text-link" href="#how-it-works">
              See how it works <span>↓</span>
            </a>
          </div>
          <div className="hero-social-proof">
            <div className="avatar-stack">
              <span className="mini-avatar avatar-peach">J</span>
              <span className="mini-avatar avatar-lilac">A</span>
              <span className="mini-avatar avatar-green">M</span>
              <span className="mini-avatar avatar-blue">S</span>
            </div>
            <div>
              <strong>Growing together</strong>
              <span>Good things are better as a group.</span>
            </div>
          </div>
        </div>
        <div className="hero-art" aria-label="GreenGoals challenge preview">
          <div className="sun-disc" />
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="plant-art">
            <div className="plant-stem" />
            <span className="plant-leaf leaf-one" />
            <span className="plant-leaf leaf-two" />
            <span className="plant-leaf leaf-three" />
            <span className="plant-leaf leaf-four" />
            <div className="plant-pot">
              <span />
            </div>
          </div>
          <div className="floating-badge badge-streak">
            <span className="badge-emoji">🔥</span>
            <span>
              <b>7 day streak</b>
              <small>You’re on a roll!</small>
            </span>
          </div>
          <div className="floating-badge badge-points">
            <span className="points-icon">
              <Icon name="leaf" size={19} />
            </span>
            <span>
              <b>+120 points</b>
              <small>One good choice</small>
            </span>
          </div>
          <div className="art-note">
            <span className="note-spark">✳</span> YOUR IMPACT, IN BLOOM
          </div>
        </div>
      </section>
      <section className="impact-strip container" id="community">
        <div className="impact-intro">
          <span className="tiny-leaf">✳</span>
          <span>GOOD IS GROWING</span>
        </div>
        <div className="impact-stat">
          <strong>
            2,400<span>+</span>
          </strong>
          <span>good humans</span>
        </div>
        <div className="impact-stat">
          <strong>18k</strong>
          <span>challenges completed</span>
        </div>
        <div className="impact-stat">
          <strong>
            42<span>t</span>
          </strong>
          <span>CO₂ saved together</span>
        </div>
        <div className="impact-note">
          Every little thing
          <br />
          adds up <span>↗</span>
        </div>
      </section>
      <section className="how-section container" id="how-it-works">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SUSTAINABILITY, MADE SOCIAL</p>
            <h2>
              Good habits, meet
              <br />
              your competitive side.
            </h2>
          </div>
          <p>
            Make a difference in a way that feels less like a chore and more
            like a reason to show up.
          </p>
        </div>
        <div className="how-grid">
          <article className="how-card">
            <span className="how-icon how-icon-sun">
              <Icon name="users" />
            </span>
            <span className="how-number">01 / FIND YOUR PEOPLE</span>
            <h3>Better, together.</h3>
            <p>
              Join a group of friends, teammates, or fellow planet-lovers. The
              best motivation is each other.
            </p>
          </article>
          <article className="how-card">
            <span className="how-icon how-icon-sparkle">
              <Icon name="sparkle" />
            </span>
            <span className="how-number">02 / TAKE A CHALLENGE</span>
            <h3>Make good a game.</h3>
            <p>
              Pick bite-sized sustainability challenges made for your life, not
              a perfect planet.
            </p>
          </article>
          <article className="how-card">
            <span className="how-icon how-icon-leaf">
              <Icon name="trophy" />
            </span>
            <span className="how-number">03 / WATCH IT GROW</span>
            <h3>Every point counts.</h3>
            <p>
              Stack points, celebrate progress, and see your good habits add up
              together.
            </p>
          </article>
        </div>
      </section>
      <footer className="landing-footer container">
        <Brand />
        <span>Rooted in small things. Growing into big change.</span>
        <span>© 2025 GreenGoals</span>
      </footer>
    </main>
  );
}

function ChallengeCard({ challenge, completed, onComplete }) {
  return (
    <article
      className={`challenge-card${completed ? " challenge-completed" : ""}`}
    >
      <div className={`challenge-icon challenge-icon-${challenge.color}`}>
        <Icon name={challenge.icon} size={23} />
      </div>
      <div className="challenge-main">
        <span className="challenge-category">{challenge.category}</span>
        <h3>{challenge.title}</h3>
        <p>{challenge.description}</p>
        <div className="challenge-meta">
          <span>
            <Icon name="clock" size={15} /> {challenge.duration}
          </span>
          <span className="challenge-reward">
            <Icon name="leaf" size={15} /> {challenge.points} pts
          </span>
        </div>
      </div>
      <button
        className={`challenge-action${completed ? " completed-button" : ""}`}
        type="button"
        onClick={() => onComplete(challenge.id)}
        aria-label={
          completed
            ? `${challenge.title} completed`
            : `Complete ${challenge.title}`
        }
      >
        {completed ? (
          <>
            <Icon name="check" size={16} /> Done
          </>
        ) : (
          <>
            <span>Take it on</span>
            <Icon name="arrow" size={16} />
          </>
        )}
      </button>
    </article>
  );
}

function LeaderboardRows({ full = false, points, profile, entries = null }) {
  const source =
    entries === null
      ? leaderboard
      : entries.map((entry, index) => ({
          rank: index + 1,
          name:
            entry.uid === profile?.uid
              ? "You"
              : entry.name || "GreenGoals member",
          handle:
            entry.uid === profile?.uid
              ? "@you"
              : entry.email
              ? `@${entry.email.split("@")[0]}`
              : "@greengoals",
          points: entry.points || 0,
          initials:
            entry.name
              ?.split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "GG",
          color: [
            "avatar-lilac",
            "avatar-peach",
            "avatar-green",
            "avatar-yellow",
          ][index % 4],
          you: entry.uid === profile?.uid,
        }));
  const rows = source.map((row) =>
    row.you
      ? {
          ...row,
          name: profile?.name || "You",
          initials: profile?.name
            ? profile.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : "YO",
          points,
        }
      : row,
  );
  return (
    <div className="leaderboard-rows">
      {(full ? rows : rows.slice(0, 3)).map((row) => (
        <div
          className={`leaderboard-row${row.you ? " leaderboard-you" : ""}`}
          key={row.rank}
        >
          <span className={`rank-number${row.rank <= 3 ? " rank-top" : ""}`}>
            {String(row.rank).padStart(2, "0")}
          </span>
          <span className={`user-avatar ${row.color}`}>{row.initials}</span>
          <span className="leader-name">
            <strong>{row.name}</strong>
            <span>{row.handle}</span>
          </span>
          <strong className="leader-points">
            {row.points.toLocaleString()} <span>pts</span>
          </strong>
        </div>
      ))}
    </div>
  );
}

function LoadingState({ busy, onRetry }) {
  return (
    <div className="loading-state">
      <span className="loading-sprout">🌱</span>
      <p>
        {busy
          ? "Growing your fresh challenges…"
          : "Your next good thing is waiting."}
      </p>
      {!busy && (
        <button type="button" className="stat-inline-link" onClick={onRetry}>
          Try again <Icon name="arrow" size={14} />
        </button>
      )}
    </div>
  );
}

function Dashboard({ profile, isDemo, onSignOut, dataState, setDataState }) {
  const [activePage, setActivePage] = useState("overview");
  const [todayLabel] = useState(() =>
    new Intl.DateTimeFormat("en", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
      .format(new Date())
      .toUpperCase(),
  );
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const localChallenges = initialChallenges;
  const [completedIds, setCompletedIds] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoGroupName, setDemoGroupName] = useState("");
  const [demoGroupType, setDemoGroupType] = useState("Friends");
  const [groupTypeInput, setGroupTypeInput] = useState("Friends");
  const [groupInput, setGroupInput] = useState("");
  const challenges = isDemo ? localChallenges : dataState.challenges;
  const demoContribution = localChallenges
    .filter((challenge) => completedIds.includes(challenge.id))
    .reduce((total, challenge) => total + challenge.points, 0);
  const points = isDemo ? 1840 + demoContribution : dataState.user?.points || 0;
  const totalGroupPoints = isDemo
    ? 18420 + demoContribution
    : dataState.group?.points ??
      dataState.leaderboard.reduce(
        (total, member) => total + (member.points || 0),
        0,
      );
  const displayName = profile?.name?.split(" ")[0] || "Taylor";
  const fullName = profile?.name || "Taylor Green";
  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "TG";
  const photo = profile?.picture;
  const completedCount = completedIds.length;
  const currentStreak = isDemo ? 7 : dataState.user?.streakDays || 0;
  const completedTotal = isDemo
    ? completedCount + 12
    : dataState.user?.completedCount || 0;
  const ownRank = isDemo
    ? leaderboard.findIndex((entry) => entry.you) + 1
    : dataState.leaderboard.findIndex((entry) => entry.uid === profile?.uid) +
      1;
  const leaderboardEntries = isDemo ? null : dataState.leaderboard;
  const leaderboardCount = isDemo
    ? leaderboard.length
    : dataState.leaderboard.length;
  const completeChallenge = async (id) => {
    if (isDemo) {
      setCompletedIds((current) =>
        current.includes(id) ? current : [...current, id],
      );
      return;
    }
    setDataState((state) => ({ ...state, busyAction: true, error: "" }));
    try {
      const result = await completeChallengeRequest(id);
      setDataState((state) => ({
        ...state,
        busyAction: false,
        user: {
          ...state.user,
          points: (state.user?.points || 0) + result.pointsEarned,
          completedCount: (state.user?.completedCount || 0) + 1,
        },
        challenges: state.challenges.map((challenge) =>
          challenge.id === id ? { ...challenge, completed: true } : challenge,
        ),
      }));
    } catch (error) {
      setDataState((state) => ({
        ...state,
        busyAction: false,
        error: error.message || "Could not complete this challenge.",
      }));
    }
  };
  const refreshChallenges = async () => {
    setDataState((state) => ({ ...state, busyAction: true, error: "" }));
    try {
      const result = await generateChallenges({ forceRefresh: true });
      setDataState((state) => ({
        ...state,
        busyAction: false,
        challenges: result.challenges,
      }));
    } catch (error) {
      setDataState((state) => ({
        ...state,
        busyAction: false,
        error: error.message || "Could not generate challenges.",
      }));
    }
  };
  const createGroup = async () => {
    if (isDemo) {
      if (groupInput.trim().length < 3) return;
      setDemoGroupName(groupInput.trim());
      setDemoGroupType(groupTypeInput);
      setGroupInput("");
      return;
    }
    setDataState((state) => ({ ...state, busyAction: true, error: "" }));
    try {
      const result = await createGroupRequest(groupInput, groupTypeInput);
      setDataState((state) => ({
        ...state,
        busyAction: false,
        user: {
          ...state.user,
          groupId: result.groupId,
          groupName: result.name,
          joinCode: result.joinCode,
        },
      }));
    } catch (error) {
      setDataState((state) => ({
        ...state,
        busyAction: false,
        error: error.message || "Could not create your group.",
      }));
    }
  };
  const joinGroup = async () => {
    if (isDemo) {
      if (groupInput.trim().length !== 8) return;
      setDemoGroupName("The Sunday Sprouts");
      setDemoGroupType("Friends");
      setGroupInput("");
      return;
    }
    setDataState((state) => ({ ...state, busyAction: true, error: "" }));
    try {
      const result = await joinGroupRequest(groupInput);
      setDataState((state) => ({
        ...state,
        busyAction: false,
        user: {
          ...state.user,
          groupId: result.groupId,
          groupName: result.name,
        },
      }));
    } catch (error) {
      setDataState((state) => ({
        ...state,
        busyAction: false,
        error: error.message || "Could not join the group.",
      }));
    }
  };
  const displayedChallenges = challenges.length
    ? challenges
    : isDemo
    ? localChallenges
    : [];
  const groupName =
    dataState.user?.groupName ||
    demoGroupName ||
    (isDemo ? "The Sunday Sprouts" : "Find your people");
  const currentGroupType =
    dataState.group?.type ||
    (isDemo ? demoGroupType : dataState.user?.groupId ? "Friends" : "");
  const groupContribution = isDemo
    ? demoContribution
    : dataState.groupContribution || 0;

  const pageTitle = {
    overview: "Your little corner of good.",
    challenges: "Find your next good thing.",
    leaderboard: "Good is better together.",
    groups: "Find your kind of people.",
    profile: "The good you’re growing.",
  }[activePage];

  useEffect(() => {
    if (!accountMenuOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!accountMenuRef.current?.contains(event.target))
        setAccountMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setAccountMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountMenuOpen]);

  const renderOverview = () => (
    <>
      <section className="welcome-banner">
        <div className="welcome-copy">
          <span className="welcome-kicker">
            MONDAY, MAY 19 <span>✳</span> YOUR WEEKLY CHECK-IN
          </span>
          <h2>
            Hey, {displayName}.<br />
            Look at you, <em>growing.</em>
          </h2>
          <p>
            You’re making a difference one small thing at a time. Ready for your
            next one?
          </p>
          <button
            className="button button-primary"
            type="button"
            onClick={() => setActivePage("challenges")}
          >
            Find a challenge <Icon name="arrow" size={17} />
          </button>
        </div>
        <div className="welcome-illustration">
          <div className="welcome-disc" />
          <div className="welcome-plant">
            <span className="welcome-stem" />
            <i className="welcome-leaf wl-one" />
            <i className="welcome-leaf wl-two" />
            <i className="welcome-leaf wl-three" />
            <i className="welcome-leaf wl-four" />
            <div className="welcome-pot" />
          </div>
          <span className="welcome-star star-left">✳</span>
          <span className="welcome-star star-right">✺</span>
          <div className="banner-floating">
            <Icon name="leaf" size={16} /> growing steadily
          </div>
        </div>
      </section>
      <section className="stats-grid" aria-label="Your impact so far">
        <article className="stat-card stat-featured">
          <div className="stat-card-top">
            <span className="stat-label">YOUR GREEN POINTS</span>
            <span className="stat-icon">
              <Icon name="leaf" size={18} />
            </span>
          </div>
          <strong className="stat-value">{points.toLocaleString()}</strong>
          <div className="stat-foot">
            <span className="positive-change">
              <Icon name="arrowUp" size={13} />{" "}
              {isDemo
                ? completedIds.reduce(
                    (total, id) =>
                      total +
                      (localChallenges.find((challenge) => challenge.id === id)
                        ?.points || 0),
                    0,
                  )
                : dataState.user?.points || 0}
            </span>
            <span>all time</span>
            <span className="stat-foot-label">Keep it up!</span>
          </div>
          <div className="stat-sparkline">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </article>
        <article className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">YOUR STREAK</span>
            <span className="stat-icon stat-icon-peach">🔥</span>
          </div>
          <strong className="stat-value">
            {currentStreak} <small>days</small>
          </strong>
          <p className="stat-caption">
            {currentStreak
              ? "A little good, day after day."
              : "Complete a challenge to start."}
          </p>
          <div className="week-dots">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
              <span
                className={
                  index < Math.min(currentStreak, 7)
                    ? "week-day week-done"
                    : "week-day"
                }
                key={`${day}-${index}`}
              >
                {index < Math.min(currentStreak, 7) ? (
                  <Icon name="check" size={12} />
                ) : (
                  day
                )}
              </span>
            ))}
          </div>
        </article>
        <article className="stat-card stat-rank-card">
          <div className="stat-card-top">
            <span className="stat-label">GROUP RANK</span>
            <span className="stat-icon stat-icon-yellow">
              <Icon name="trophy" size={18} />
            </span>
          </div>
          <strong className="stat-value">
            {ownRank ? `#${ownRank}` : "—"}{" "}
            <small>
              {leaderboardCount ? `of ${leaderboardCount}` : "join a group"}
            </small>
          </strong>
          <p className="stat-caption">
            {ownRank
              ? "Your group is cheering you on."
              : "Find your people to compete."}
          </p>
          <button
            type="button"
            className="stat-inline-link"
            onClick={() =>
              setActivePage(dataState.user?.groupId ? "leaderboard" : "groups")
            }
          >
            {ownRank ? "View leaderboard" : "Find a group"}{" "}
            <Icon name="arrow" size={14} />
          </button>
        </article>
      </section>
      <div className="dashboard-columns">
        <section className="content-panel challenges-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">A GOOD PLACE TO START</p>
              <h2>Made for your day.</h2>
            </div>
            <button
              className="view-all"
              type="button"
              onClick={() => setActivePage("challenges")}
            >
              All challenges <Icon name="arrow" size={15} />
            </button>
          </div>
          {displayedChallenges.length ? (
            <div className="challenge-list">
              {displayedChallenges.slice(0, 2).map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  completed={
                    isDemo
                      ? completedIds.includes(challenge.id)
                      : challenge.completed
                  }
                  onComplete={completeChallenge}
                />
              ))}
            </div>
          ) : (
            <LoadingState
              busy={dataState.busyAction}
              onRetry={refreshChallenges}
            />
          )}
        </section>
        <section className="content-panel leaderboard-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">FRIENDLY COMPETITION</p>
              <h2>Your group.</h2>
            </div>
            <button
              className="icon-button"
              type="button"
              aria-label="View full leaderboard"
              onClick={() => setActivePage("leaderboard")}
            >
              <Icon name="arrowUp" size={17} />
            </button>
          </div>
          <div className="group-context">
            <span className="group-avatar">🌿</span>
            <span>
              <strong>{groupName}</strong>
              <small>
                {currentGroupType ? `${currentGroupType} · ` : ""}
                {isDemo
                  ? 24
                  : dataState.group?.memberCount ||
                    dataState.leaderboard.length}{" "}
                good humans
              </small>
            </span>
            <span className="group-live">
              <i /> LIVE
            </span>
          </div>
          <LeaderboardRows
            points={points}
            profile={profile}
            entries={leaderboardEntries}
          />
          <button
            className="leaderboard-footer-link"
            type="button"
            onClick={() => setActivePage("leaderboard")}
          >
            See the whole leaderboard <Icon name="arrow" size={15} />
          </button>
        </section>
      </div>
      <section className="group-banner">
        <div className="group-banner-icon">🌱</div>
        <div className="group-banner-copy">
          <span className="eyebrow">GOOD THINGS HAPPEN IN GROUPS</span>
          <h3>Find your people. Grow together.</h3>
          <p>
            Friends, coworkers, neighbors — there’s a group for your kind of
            good.
          </p>
        </div>
        <button
          className="button button-outline"
          type="button"
          onClick={() => setActivePage("groups")}
        >
          Explore groups <Icon name="arrow" size={16} />
        </button>
      </section>
    </>
  );

  const renderChallenges = () => (
    <section className="content-panel full-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">A LITTLE GOOD, EVERY DAY</p>
          <h2>Pick your next challenge.</h2>
          <p className="panel-description">
            Small actions, real impact. Choose one that feels right for you.
          </p>
        </div>
        <div className="challenge-counter">
          <strong>
            {isDemo
              ? completedCount
              : challenges.filter((challenge) => challenge.completed).length}
            /{challenges.length}
          </strong>
          <span>completed</span>
        </div>
      </div>
      {challenges.length ? (
        <div className="challenge-list full-challenge-list">
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              completed={
                isDemo
                  ? completedIds.includes(challenge.id)
                  : challenge.completed
              }
              onComplete={completeChallenge}
            />
          ))}
        </div>
      ) : (
        <LoadingState busy={dataState.busyAction} onRetry={refreshChallenges} />
      )}
      <div className="ai-note">
        <span className="ai-note-icon">
          <Icon name="sparkle" size={19} />
        </span>
        <span>
          <strong>Fresh challenges, just for today.</strong>
          <small>
            Generated for real life — practical, safe, and good for the planet.
          </small>
        </span>
        {!isDemo && (
          <button
            className="button button-outline refresh-challenges"
            disabled={dataState.busyAction}
            type="button"
            onClick={refreshChallenges}
          >
            {dataState.busyAction ? "Generating" : "Suggest new challenges"}
          </button>
        )}
      </div>
    </section>
  );

  const renderLeaderboard = () => (
    <div className="dashboard-columns leaderboard-page-grid">
      <section className="content-panel full-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">{groupName.toUpperCase()}</p>
            <h2>The good is adding up.</h2>
            <p className="panel-description">
              A little friendly competition. A lot of shared impact.
            </p>
          </div>
          <span className="leaderboard-week-pill">🌿 &nbsp; All time</span>
        </div>
        <div className="leaderboard-summary">
          <div>
            <span className="eyebrow">GROUP POINTS</span>
            <strong>{totalGroupPoints.toLocaleString()}</strong>
            <span>points grown together</span>
          </div>
          <div className="summary-avatars">
            <span>🌱</span>
            <span>🌼</span>
            <span>🌻</span>
            <span>🍀</span>
            <small>
              +
              {Math.max(
                0,
                (isDemo ? leaderboard.length : dataState.leaderboard.length) -
                  4,
              )}
            </small>
          </div>
        </div>
        {isDemo || dataState.leaderboard.length ? (
          <div className="full-leader-list">
            <LeaderboardRows
              full
              points={points}
              profile={profile}
              entries={leaderboardEntries}
            />
          </div>
        ) : (
          <p className="panel-description">
            Join a group to see its leaderboard here.
          </p>
        )}
        <button
          type="button"
          className="button button-outline invite-button"
          onClick={() => setActivePage("groups")}
        >
          <Icon name="plus" size={16} /> Invite a friend to your group
        </button>
      </section>
      <section className="content-panel your-standing">
        <span className="standing-icon">🏅</span>
        <p className="eyebrow">YOUR CURRENT STANDING</p>
        <strong>{ownRank ? `#${ownRank}` : "—"}</strong>
        <span className="standing-of">
          out of {isDemo ? leaderboard.length : dataState.leaderboard.length}{" "}
          good humans
        </span>
        <div className="standing-progress">
          <span
            style={{
              width: ownRank
                ? `${Math.max(
                    10,
                    100 -
                      ((ownRank - 1) /
                        Math.max(
                          isDemo
                            ? leaderboard.length
                            : dataState.leaderboard.length,
                          1,
                        )) *
                        100,
                  )}%`
                : "0%",
            }}
          />
        </div>
        <p>
          Your group’s small steps are adding up. Take on another challenge and
          keep growing!
        </p>
        <button
          className="stat-inline-link"
          type="button"
          onClick={() => setActivePage("challenges")}
        >
          Find your next challenge <Icon name="arrow" size={14} />
        </button>
        <div className="standing-doodle">✳</div>
      </section>
    </div>
  );

  const renderGroups = () => (
    <div className="group-explore">
      <section className="content-panel groups-featured">
        <span className="group-featured-emoji">🌻</span>
        <p className="eyebrow">YOUR PEOPLE, YOUR PLANET</p>
        <h2>
          Find your kind
          <br />
          of good.
        </h2>
        <p>
          Big change starts with a few people who care. Find your crew, start a
          friendly challenge, and make good a shared thing.
        </p>
      </section>
      <section className="content-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">YOUR CIRCLE</p>
            <h2>{groupName}.</h2>
          </div>
          <span className="group-live">
            <i />{" "}
            {dataState.user?.groupId || (isDemo && demoGroupName)
              ? "ACTIVE"
              : "READY"}
          </span>
        </div>
        {dataState.user?.groupId || (isDemo && demoGroupName) ? (
          <div className="group-card-large">
            <div className="group-avatar-large">🌿</div>
            <h3>{groupName}</h3>
            <p>
              {currentGroupType || "Group"} · Little changes. Big growing
              energy.
            </p>
            <div className="group-member-stack">
              {dataState.leaderboard.slice(0, 4).map((member, index) => (
                <span
                  className={`mini-avatar ${
                    [
                      "avatar-peach",
                      "avatar-lilac",
                      "avatar-green",
                      "avatar-blue",
                    ][index]
                  }`}
                  key={member.uid}
                >
                  {member.name?.[0] || "G"}
                </span>
              ))}
              <span className="member-count">
                {isDemo
                  ? 24
                  : dataState.group?.memberCount ||
                    dataState.leaderboard.length}{" "}
                good humans
              </span>
            </div>
            <div className="group-card-stats">
              <span>
                <strong>{totalGroupPoints.toLocaleString()}</strong> group
                points
              </span>
              <span>
                <strong>{groupContribution.toLocaleString()}</strong> your
                contribution
              </span>
              <span>
                <strong>
                  {dataState.group?.joinCode ||
                    dataState.user?.joinCode ||
                    (isDemo ? "DEMO-GROUP" : "••••••••")}
                </strong>{" "}
                invite code
              </span>
            </div>
            <button
              className="button button-outline"
              type="button"
              onClick={() => setActivePage("leaderboard")}
            >
              Visit leaderboard <Icon name="arrow" size={15} />
            </button>
          </div>
        ) : (
          <div className="group-form">
            <label htmlFor="group-value">Create a group or join one</label>
            <input
              id="group-value"
              value={groupInput}
              onChange={(event) => setGroupInput(event.target.value)}
              placeholder="Group name or 8-character code"
              maxLength={40}
            />
            <label htmlFor="group-type">Group type</label>
            <select
              id="group-type"
              value={groupTypeInput}
              onChange={(event) => setGroupTypeInput(event.target.value)}
            >
              <option>Class</option>
              <option>Club</option>
              <option>Friends</option>
              <option>Organization</option>
              <option>Neighborhood</option>
            </select>
            <div className="group-form-actions">
              <button
                className="button button-primary"
                disabled={dataState.busyAction || groupInput.trim().length < 3}
                type="button"
                onClick={createGroup}
              >
                <Icon name="plus" size={15} /> Create group
              </button>
              <button
                className="button button-outline"
                disabled={
                  dataState.busyAction || groupInput.trim().length !== 8
                }
                type="button"
                onClick={joinGroup}
              >
                Join with code <Icon name="arrow" size={15} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );

  const renderProfile = () => (
    <div className="profile-grid">
      <section className="content-panel profile-card">
        <div className="profile-cover">
          <span className="cover-leaf">✳</span>
          <span className="cover-flower">✿</span>
        </div>
        <div className="profile-identity">
          {photo ? (
            <img className="profile-avatar" src={photo} alt="" />
          ) : (
            <span className="profile-avatar profile-avatar-fallback">
              {initials}
            </span>
          )}
          <span className="profile-rank">🌱 &nbsp; Growing every day</span>
          <h2>{fullName}</h2>
          <p>{profile?.email || "A good human making a difference."}</p>
          <span className="profile-location">🌿 &nbsp; {groupName}</span>
        </div>
        <div className="profile-stats">
          <div>
            <strong>{points.toLocaleString()}</strong>
            <span>green points</span>
          </div>
          <div>
            <strong>{currentStreak}</strong>
            <span>day streak</span>
          </div>
          <div>
            <strong>{completedTotal}</strong>
            <span>challenges</span>
          </div>
        </div>
      </section>
      <section className="content-panel profile-impact">
        <p className="eyebrow">YOUR GOOD, SO FAR</p>
        <h2>Look at all that growing.</h2>
        <p>
          Every challenge is a small vote for the kind of world you want to live
          in. Keep going.
        </p>
        <div className="impact-breakdown">
          <span>
            <i className="breakdown-dot breakdown-green" /> Challenges completed{" "}
            <strong>{completedTotal.toString().padStart(2, "0")}</strong>
          </span>
          <span>
            <i className="breakdown-dot breakdown-peach" /> Points collected{" "}
            <strong>{points.toLocaleString()}</strong>
          </span>
          <span>
            <i className="breakdown-dot breakdown-blue" /> Group contribution{" "}
            <strong>
              {dataState.user?.groupId || (isDemo && demoGroupName)
                ? groupContribution.toLocaleString()
                : "—"}
            </strong>
          </span>
          <span>
            <i className="breakdown-dot breakdown-blue" /> Group standing{" "}
            <strong>{ownRank ? `#${ownRank}` : "—"}</strong>
          </span>
        </div>
        <button
          className="button button-outline profile-signout"
          type="button"
          onClick={onSignOut}
        >
          <Icon name="logout" size={16} /> Sign out
        </button>
      </section>
    </div>
  );

  const pageContent = {
    overview: renderOverview,
    challenges: renderChallenges,
    leaderboard: renderLeaderboard,
    groups: renderGroups,
    profile: renderProfile,
  }[activePage]();

  return (
    <main className="app-shell">
      {mobileMenuOpen && (
        <button
          className="sidebar-dismiss"
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <aside
        className={`sidebar${mobileMenuOpen ? " sidebar-mobile-open" : ""}`}
      >
        <div className="sidebar-brand">
          <Brand
            onClick={() => {
              setActivePage("overview");
              setMobileMenuOpen(false);
            }}
          />
        </div>
        <div className="sidebar-group-label">YOUR LITTLE WORLD</div>
        <nav className="sidebar-nav" aria-label="Dashboard navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-link${
                activePage === item.id ? " sidebar-link-active" : ""
              }`}
              type="button"
              onClick={() => {
                setActivePage(item.id);
                setMobileMenuOpen(false);
              }}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {item.id === "challenges" && (
                <span className="nav-count">
                  {challenges.length - completedCount}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-group-label group-label-spaced">YOUR GROUP</div>
        <button
          className="sidebar-group-card"
          type="button"
          onClick={() => {
            setActivePage(dataState.user?.groupId ? "leaderboard" : "groups");
            setMobileMenuOpen(false);
          }}
        >
          <span className="sidebar-group-icon">🌿</span>
          <span>
            <strong>{groupName}</strong>
            <small>
              {dataState.user?.groupId
                ? `${dataState.leaderboard.length} good humans`
                : "Find your people"}
            </small>
          </span>
          <Icon name="chevron" size={15} />
        </button>
        <div className="sidebar-bottom">
          <div className="side-tip">
            <span className="tip-star">✳</span>
            <p>A little good adds up to a lot.</p>
            <small>You’re doing great. Keep going.</small>
          </div>
          <button
            className="profile-menu"
            type="button"
            onClick={() => {
              setActivePage("profile");
              setMobileMenuOpen(false);
            }}
          >
            {photo ? (
              <img className="user-avatar" src={photo} alt="" />
            ) : (
              <span className="user-avatar avatar-green">{initials}</span>
            )}
            <span>
              <strong>{fullName}</strong>
              <small>{isDemo ? "Demo account" : "GreenGoals member"}</small>
            </span>
            <Icon name="settings" size={18} />
          </button>
        </div>
      </aside>
      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <button
            className="mobile-menu-trigger"
            type="button"
            aria-label="Open navigation menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Icon name="menu" />
          </button>
          <div className="breadcrumb">
            <span>Your garden</span>
            <Icon name="chevron" size={14} />
            <strong>
              {navItems.find((item) => item.id === activePage)?.label ||
                "My profile"}
            </strong>
          </div>
          <div className="topbar-right">
            {isDemo && (
              <span className="demo-indicator">
                <span /> DEMO MODE
              </span>
            )}
            {dataState.error && (
              <span className="demo-indicator" role="status">
                Action needs attention
              </span>
            )}
            <button
              className="topbar-icon"
              aria-label="Notifications"
              type="button"
            >
              <Icon name="bell" size={19} />
              <i />
            </button>
            <span className="topbar-divider" />
            <div className="account-menu" ref={accountMenuRef}>
              <button
                className="account-trigger"
                type="button"
                aria-label="Open account menu"
                aria-haspopup="menu"
                aria-expanded={accountMenuOpen}
                onClick={() => setAccountMenuOpen((open) => !open)}
              >
                {photo ? (
                  <img
                    className="user-avatar topbar-avatar"
                    src={photo}
                    alt=""
                  />
                ) : (
                  <span className="user-avatar avatar-green topbar-avatar">
                    {initials}
                  </span>
                )}
                <Icon name="chevron" size={15} />
              </button>
              {accountMenuOpen && (
                <div
                  className="account-popover"
                  role="menu"
                  aria-label="Account menu"
                >
                  <div className="account-popover-profile">
                    {photo ? (
                      <img className="user-avatar" src={photo} alt="" />
                    ) : (
                      <span className="user-avatar avatar-green">
                        {initials}
                      </span>
                    )}
                    <span>
                      <strong>{fullName}</strong>
                      <small>{isDemo ? "Demo account" : profile?.email}</small>
                    </span>
                  </div>
                  <div className="account-popover-points">
                    <span className="account-points-icon">✳</span>
                    <span className="account-points-label">
                      <small>YOUR IMPACT</small>
                      <strong>Points earned</strong>
                    </span>
                    <strong className="account-points-total">
                      {points.toLocaleString()}
                      <span> pts</span>
                    </strong>
                  </div>
                  <div className="account-popover-divider" />
                  <button
                    className={`account-menu-action${
                      isDemo ? " account-menu-action-demo" : ""
                    }`}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      onSignOut();
                    }}
                  >
                    <Icon name={isDemo ? "arrow" : "logout"} size={16} />
                    {isDemo ? "Exit Demo Mode" : "Sign Out"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="dashboard-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">
                {todayLabel} <span>✳</span> YOUR GARDEN IS GROWING
              </p>
              <h1>{pageTitle}</h1>
            </div>
            <div className="heading-flourish">
              ✺ <span>✳</span>
            </div>
          </div>
          {dataState.error && (
            <p className="backend-error" role="alert">
              {dataState.error}
            </p>
          )}
          {pageContent}
          <footer className="dashboard-footer">
            <Brand
              onClick={() => {
                setActivePage("overview");
                setMobileMenuOpen(false);
              }}
            />
            <span>One small good thing at a time.</span>
            <span>
              GROWING TOGETHER <span className="footer-heart">♥</span>
            </span>
          </footer>
        </div>
      </section>
    </main>
  );
}

function App() {
  const [profile, setProfile] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(firebaseReady);
  const [authError, setAuthError] = useState("");
  const [dataState, setDataState] = useState({
    user: null,
    group: null,
    groupContribution: 0,
    challenges: [],
    leaderboard: [],
    busyAction: false,
    error: "",
  });
  const generationRequested = useRef("");

  useEffect(() => {
    if (!firebaseReady) return undefined;
    let active = true;
    let stopAuth = () => {};
    let stopUser = () => {};
    let stopChallenges = () => {};
    let stopGroup = () => {};
    let stopMembers = () => {};
    let stopContribution = () => {};

    authServices
      .then((authService) => {
        if (!active || !authService) return;
        const { auth, authModule } = authService;
        stopAuth = authModule.onAuthStateChanged(auth, async (user) => {
          stopUser();
          stopChallenges();
          stopGroup();
          stopMembers();
          stopContribution();
          if (!active) return;
          setAuthLoading(false);
          setAuthError("");
          generationRequested.current = "";
          if (!user) {
            setProfile(null);
            setIsDemo(false);
            setDataState({
              user: null,
              group: null,
              groupContribution: 0,
              challenges: [],
              leaderboard: [],
              busyAction: false,
              error: "",
            });
            return;
          }
          setProfile({
            uid: user.uid,
            name: user.displayName || "GreenGoals member",
            email: user.email || "",
            picture: user.photoURL || "",
          });
          setIsDemo(false);
          setDataState({
            user: null,
            group: null,
            groupContribution: 0,
            challenges: [],
            leaderboard: [],
            busyAction: true,
            error: "",
          });
          let firebase;
          try {
            firebase = await loadDataServices();
            if (!active) return;
            await initializeUser();
          } catch (error) {
            if (active)
              setDataState((state) => ({
                ...state,
                busyAction: false,
                error: error.message || "Could not load your account.",
              }));
            return;
          }
          if (!active) return;
          const { db, firestoreModule } = firebase;

          stopUser = firestoreModule.onSnapshot(
            firestoreModule.doc(db, "users", user.uid),
            (snapshot) => {
              if (!snapshot.exists()) {
                setDataState((state) => ({
                  ...state,
                  busyAction: false,
                  error: "Your profile could not be loaded.",
                }));
                return;
              }
              const userData = { uid: user.uid, ...snapshot.data() };
              setDataState((state) => ({
                ...state,
                user: userData,
                busyAction: false,
              }));
              stopGroup();
              stopMembers();
              stopContribution();
              if (userData.groupId) {
                stopGroup = firestoreModule.onSnapshot(
                  firestoreModule.doc(db, "groups", userData.groupId),
                  (groupSnapshot) => {
                    setDataState((state) => ({
                      ...state,
                      group: groupSnapshot.exists()
                        ? { id: groupSnapshot.id, ...groupSnapshot.data() }
                        : null,
                    }));
                  },
                  (error) =>
                    setDataState((state) => ({
                      ...state,
                      error: error.message,
                    })),
                );
                const membersQuery = firestoreModule.query(
                  firestoreModule.collection(
                    db,
                    "groups",
                    userData.groupId,
                    "members",
                  ),
                  firestoreModule.orderBy("points", "desc"),
                  firestoreModule.limit(25),
                );
                stopMembers = firestoreModule.onSnapshot(
                  membersQuery,
                  (membersSnapshot) => {
                    setDataState((state) => ({
                      ...state,
                      leaderboard: membersSnapshot.docs.map((member) => ({
                        uid: member.id,
                        ...member.data(),
                      })),
                    }));
                  },
                  (error) =>
                    setDataState((state) => ({
                      ...state,
                      error: error.message,
                    })),
                );
                stopContribution = firestoreModule.onSnapshot(
                  firestoreModule.doc(
                    db,
                    "groups",
                    userData.groupId,
                    "members",
                    user.uid,
                  ),
                  (memberSnapshot) =>
                    setDataState((state) => ({
                      ...state,
                      groupContribution: memberSnapshot.exists()
                        ? memberSnapshot.data().points || 0
                        : 0,
                    })),
                  (error) =>
                    setDataState((state) => ({
                      ...state,
                      error: error.message,
                    })),
                );
              } else {
                setDataState((state) => ({
                  ...state,
                  group: null,
                  groupContribution: 0,
                  leaderboard: [],
                }));
              }
            },
            (error) =>
              setDataState((state) => ({
                ...state,
                busyAction: false,
                error: error.message,
              })),
          );

          const challengesQuery = firestoreModule.query(
            firestoreModule.collection(db, "users", user.uid, "challenges"),
            firestoreModule.orderBy("createdAt", "desc"),
            firestoreModule.limit(3),
          );
          stopChallenges = firestoreModule.onSnapshot(
            challengesQuery,
            (snapshot) => {
              const today = new Date().toISOString().slice(0, 10);
              const challenges = snapshot.docs
                .map((challenge) => ({ id: challenge.id, ...challenge.data() }))
                .filter((challenge) => challenge.day === today);
              setDataState((state) => ({
                ...state,
                challenges,
                busyAction: challenges.length ? false : state.busyAction,
              }));
              if (
                !challenges.length &&
                generationRequested.current !== user.uid
              ) {
                generationRequested.current = user.uid;
                setDataState((state) => ({
                  ...state,
                  busyAction: true,
                  error: "",
                }));
                generateChallenges().catch((error) => {
                  generationRequested.current = "";
                  setDataState((state) => ({
                    ...state,
                    busyAction: false,
                    error: error.message || "Could not generate challenges.",
                  }));
                });
              }
            },
            (error) =>
              setDataState((state) => ({
                ...state,
                busyAction: false,
                error: error.message,
              })),
          );
        });
      })
      .catch((error) => {
        if (active) {
          setAuthLoading(false);
          setAuthError(error.message || "Could not load Firebase services.");
        }
      });

    return () => {
      active = false;
      stopAuth();
      stopUser();
      stopChallenges();
      stopGroup();
      stopMembers();
      stopContribution();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthError("");
    try {
      const firebase = await authServices;
      if (!firebase)
        throw new Error(
          "Firebase is not configured. Add the Firebase settings to your .env file.",
        );
      await firebase.authModule.signInWithPopup(
        firebase.auth,
        firebase.googleProvider,
      );
      setIsSignInOpen(false);
    } catch (error) {
      setAuthError(error.message || "Google sign-in failed. Please try again.");
    }
  };

  const handleDemoSignIn = () => {
    setProfile({ name: "Taylor Green", email: "taylor@example.com" });
    setIsDemo(true);
    setIsSignInOpen(false);
  };

  const handleSignOut = async () => {
    try {
      const firebase = await authServices;
      if (firebase) await firebase.authModule.signOut(firebase.auth);
    } catch (error) {
      setDataState((state) => ({
        ...state,
        error: error.message || "Could not sign out.",
      }));
      return;
    }
    setProfile(null);
    setIsDemo(false);
    setDataState({
      user: null,
      group: null,
      groupContribution: 0,
      challenges: [],
      leaderboard: [],
      busyAction: false,
      error: "",
    });
  };

  return profile ? (
    <Dashboard
      profile={profile}
      isDemo={isDemo}
      onSignOut={handleSignOut}
      dataState={dataState}
      setDataState={setDataState}
    />
  ) : (
    <>
      <LandingPage
        onSignIn={() => {
          setAuthError("");
          setIsSignInOpen(true);
        }}
      />
      {isSignInOpen && (
        <SignInModal
          onClose={() => setIsSignInOpen(false)}
          onDemo={handleDemoSignIn}
          onGoogleSignIn={handleGoogleSignIn}
          busy={authLoading}
          authError={authError}
        />
      )}
    </>
  );
}

export default App;
