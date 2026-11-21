/**
 * Everything the site says about Jonathan lives here. The page sections render
 * it and the assistant's system prompt is generated from it, so the two can
 * never drift apart. Only add facts that are true — the assistant treats this
 * file as the full extent of what it knows.
 */

export type LayerId = "interface" | "api" | "data" | "cloud" | "linux" | "network";

export interface StackLayer {
  id: LayerId;
  /** Depth index, 0 = closest to the user, 5 = closest to the wire. */
  depth: number;
  label: string;
  summary: string;
  tools: string[];
}

export interface Project {
  slug: string;
  title: string;
  /** One-line positioning shown on the card. */
  tagline: string;
  /** Short bullets. Empty when the public profile gives no further detail. */
  details: string[];
  stack: string[];
  layers: LayerId[];
  kind: "Client & product work" | "Own product";
}

export interface Capability {
  title: string;
  body: string;
  layers: LayerId[];
}

export interface Role {
  title: string;
  org: string;
  period: string;
  current: boolean;
  summary: string;
  points: string[];
  /** Where the work physically happens, for roles run on the ground. */
  site?: string;
}

export interface ProfileLinks {
  upwork: string;
  /** Optional. Leave these empty to keep Upwork as the only contact route. */
  email: string;
  github: string;
  linkedin: string;
}

const links: ProfileLinks = {
  upwork: "https://www.upwork.com/freelancers/~017634c3fa882d1fd1",
  email: "",
  github: "",
  linkedin: "",
};

export const profile = {
  name: "Jonathan Madjus",
  shortName: "Jonathan",
  initials: "JM",
  title: "Backend & Full-Stack Engineer",
  focus: ["Python", "Next.js", "AWS", "Fintech & SaaS"],
  headline:
    "I build production backends and the infrastructure under them.",
  /** The stretch of the headline set in the accent colour. Must appear in it verbatim. */
  headlineEmphasis: "the infrastructure under them",
  subhead:
    "APIs, databases, cloud deployments, and the Linux/network layer most web developers avoid.",
  summary:
    "3+ years shipping full-stack products professionally — currently Mid-level Software Engineer at Boxedflows — plus my own SaaS and embedded-Linux products running in the field.",
  location: {
    city: "Kawit",
    region: "Calabarzon",
    country: "Philippines",
    timezone: "UTC+08:00",
  },
  availability: {
    status: "Open to new work",
    hours: "More than 30 hrs/week",
    capacity: "Full-time",
    overlap: "Comfortable working async across US time zones",
  },
  languages: [
    { name: "English", level: "Fluent" },
    { name: "Tagalog", level: "Native" },
  ],
  links,
  verification: "Identity verified on Upwork",
} as const;

export const stackLayers: StackLayer[] = [
  {
    id: "interface",
    depth: 0,
    label: "Interface",
    summary: "Web and mobile front ends, PWAs",
    tools: ["Next.js", "React", "React Native (Expo)", "Tailwind CSS", "TypeScript"],
  },
  {
    id: "api",
    depth: 1,
    label: "API",
    summary: "REST design, auth, background jobs, cron workers",
    tools: ["FastAPI", "Go", "Node / Express", "Python"],
  },
  {
    id: "data",
    depth: 2,
    label: "Data",
    summary: "Schema design, RLS, migrations, edge functions",
    tools: ["PostgreSQL", "Supabase"],
  },
  {
    id: "cloud",
    depth: 3,
    label: "Cloud",
    summary: "Serverless, deployments, CI/CD",
    tools: ["Modal", "AWS EC2", "S3", "Elastic Beanstalk", "Docker", "GitHub Actions"],
  },
  {
    id: "linux",
    depth: 4,
    label: "Linux",
    summary: "Embedded builds and system administration",
    tools: ["Armbian", "Orange Pi", "dnsmasq", "iptables", "C"],
  },
  {
    id: "network",
    depth: 5,
    label: "Network",
    summary: "Routing, segmentation, failover in the field",
    tools: ["MikroTik RouterOS", "VLANs", "Dual-ISP failover", "Fiber backhaul"],
  },
];

/** The layer index where, per the profile, most web developers stop. */
export const typicalStackFloor: LayerId = "cloud";

/** How the figures word that floor; kept beside it so they change together with the subhead. */
export const stackFloorCopy = {
  /** Caption on the line drawn under the floor layer. */
  marker: "most web developers stop here",
  /** Describes the layers below the floor, completing "…are Linux and Network, …". */
  beyond: "the layers most web developers avoid",
} as const;

export const projects: Project[] = [
  {
    slug: "quant-trading-platform",
    title: "AI Quant Trading & Backtesting Platform",
    tagline:
      "Strategy backtesting, live strategy monitoring, and multi-asset portfolio P&L.",
    details: [
      "Strategy backtesting engine built on VectorBT",
      "Live strategy monitoring",
      "Multi-asset portfolio P&L",
      "Compute runs serverless on Modal",
    ],
    stack: ["Next.js", "FastAPI", "VectorBT", "Modal", "Supabase", "Python"],
    layers: ["interface", "api", "data", "cloud"],
    kind: "Client & product work",
  },
  {
    slug: "options-probability-app",
    title: "Options Probability & Prediction App",
    tagline:
      "Web + iOS/Android app with a Monte Carlo and Black-Scholes pricing engine.",
    details: [
      "Monte Carlo + Black-Scholes engine",
      "Implied-volatility modeling",
      "One backend serving web, iOS and Android",
    ],
    stack: ["FastAPI", "React Native", "Next.js", "Supabase", "Python"],
    layers: ["interface", "api", "data"],
    kind: "Client & product work",
  },
  {
    slug: "gov-contract-discovery",
    title: "Government Contract Discovery SaaS",
    tagline: "Federal and local procurement opportunities in one searchable product.",
    details: [],
    stack: ["Next.js", "Supabase", "FastAPI", "PostgreSQL", "Python"],
    layers: ["interface", "api", "data"],
    kind: "Client & product work",
  },
  {
    slug: "regulatory-intelligence-api",
    title: "Regulatory Intelligence API",
    tagline:
      "Regulatory alerts, change tracking, and AI document analysis for compliance teams.",
    details: [
      "Regulatory alerts",
      "Change tracking",
      "AI document analysis",
    ],
    stack: ["Python", "Serverless", "REST API"],
    layers: ["api", "cloud"],
    kind: "Client & product work",
  },
  {
    slug: "seat-reservation-saas",
    title: "Seat Reservation SaaS for Van Operators",
    tagline:
      "B2B PWA for provincial van transport operators, with SMS and web push.",
    details: [
      "Installable progressive web app",
      "SMS notifications",
      "Web push notifications",
    ],
    stack: ["Next.js", "Supabase", "PostgreSQL", "TypeScript", "PWA"],
    layers: ["interface", "api", "data"],
    kind: "Own product",
  },
  {
    slug: "piso-wifi-vending",
    title: "Piso Wi-Fi Vending Software",
    tagline:
      "Coin-operated captive portal for Orange Pi, running on real hardware in the field.",
    details: [
      "Coin-operated captive portal",
      "Time-based sessions",
      "Sub-vendo support",
      "Offline hardware-bound licensing",
    ],
    stack: ["Embedded Linux", "Armbian", "C", "dnsmasq / iptables", "Orange Pi"],
    layers: ["linux", "network"],
    kind: "Own product",
  },
];

export const capabilities: Capability[] = [
  {
    title: "Backend APIs",
    body: "FastAPI, Go, Node/Express. REST design, auth, background jobs, cron workers.",
    layers: ["api"],
  },
  {
    title: "Serverless & cloud",
    body: "Modal, AWS (EC2, S3, Elastic Beanstalk), CI/CD with GitHub Actions.",
    layers: ["cloud"],
  },
  {
    title: "Postgres / Supabase",
    body: "Schema design, RLS, migrations, edge functions.",
    layers: ["data"],
  },
  {
    title: "Full-stack web & mobile",
    body: "Next.js, React, React Native (Expo), Tailwind, PWAs.",
    layers: ["interface"],
  },
  {
    title: "Fintech & data",
    body: "Backtesting engines, options pricing (Black-Scholes, Greeks, IV), Monte Carlo modeling, market data APIs.",
    layers: ["api", "data"],
  },
  {
    title: "Linux & networking",
    body: "Armbian/embedded builds, MikroTik RouterOS, VLANs, dnsmasq/iptables.",
    layers: ["linux", "network"],
  },
];

export const skills: string[] = [
  "Next.js",
  "React",
  "React Native",
  "Tailwind CSS",
  "Supabase",
  "FastAPI",
  "PostgreSQL",
  "ExpressJS",
  "Python",
  "Amazon Web Services",
  "Docker",
  "API Development",
  "DevOps",
  "Linux System Administration",
  "Golang",
  "TypeScript",
  "Serverless Computing",
  "MikroTik",
  "CI/CD",
  "Amazon Elastic Beanstalk",
];

export const roles: Role[] = [
  {
    title: "Mid-level Software Engineer",
    org: "Boxedflows",
    period: "Current",
    current: true,
    summary: "Shipping full-stack products professionally.",
    points: [],
  },
  {
    title: "Full Stack Developer",
    org: "Codebility",
    period: "Previous",
    current: false,
    summary: "Full-stack product development.",
    points: [],
  },
  {
    title: "Owner & Network Engineer",
    org: "Multi-site Piso Wi-Fi Network",
    period: "Ongoing",
    current: true,
    summary:
      "I design, deploy, and operate my own multi-site coin-operated Wi-Fi network in rural Northern Samar, Philippines.",
    points: [
      "MikroTik RouterOS routing with VLAN segmentation across sites and fiber backhaul",
      "Main vendo + sub-vendo units running my own Orange Pi vending software (captive portal, time-based sessions)",
      "Dual-ISP setup with failover, bandwidth management, and remote monitoring",
      "Hands-on field work: hardware, cabling, and keeping the network up through typhoon season",
    ],
    site: "Northern Samar, Philippines",
  },
];

/**
 * Labels for the drawing of the field network on the experience section.
 * It summarises the field role's points above, so edit the two together.
 */
export const fieldNetworkDiagram = {
  uplinks: [
    { label: "ISP 1", role: "primary" },
    { label: "ISP 2", role: "failover" },
  ],
  core: { label: "MikroTik", detail: "RouterOS · VLANs" },
  backhaul: "fiber backhaul to sites",
  sites: [
    { label: "Main vendo", detail: "Orange Pi" },
    { label: "Sub-vendo", detail: "captive portal" },
    { label: "Sub-vendo", detail: "timed sessions" },
  ],
  caption: "Simplified view of the network: dual-ISP failover, segmented sites, vendo units.",
} as const;

export const education = {
  degree: "Bachelor of Science, Computer Engineering",
  school: "Samar State University",
  period: "2012 – 2017",
} as const;

export const workingStyle: { title: string; body: string }[] = [
  { title: "Clean, documented code", body: "Written to be read and maintained by the next engineer." },
  { title: "Daily updates", body: "You always know where the work stands." },
  { title: "Spec to deployment", body: "I own the outcome end to end, not just the ticket." },
  { title: "Async-friendly", body: "Comfortable working across US time zones from UTC+8." },
];

export const closingLine =
  "Tell me what you're building and I'll reply with a concrete plan.";

/** Starter questions offered in the assistant so nobody faces an empty box. */
export const suggestedQuestions: string[] = [
  "What has Jonathan built in fintech?",
  "How deep does his infrastructure experience go?",
  "Is he available full-time, and in which time zones?",
  "Which project best shows his backend skills?",
];
