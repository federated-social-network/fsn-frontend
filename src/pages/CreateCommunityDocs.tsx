import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiMenu, FiX, FiCopy, FiCheck } from "react-icons/fi";

/* ──────────────────────────  SECTION DATA  ────────────────────────── */
const SECTIONS = [
    { id: "overview", label: "Overview" },
    { id: "prerequisites", label: "Prerequisites" },
    { id: "installation", label: "Installation" },
    { id: "environment", label: "Environment Config" },
    { id: "database", label: "Database Setup" },
    { id: "running", label: "Running the Server" },
    { id: "docker", label: "Docker Deployment" },
    { id: "frontend", label: "Frontend Setup" },
    { id: "api", label: "API Reference" },
    { id: "community", label: "Managing Your Community" },
    { id: "federation", label: "Federation" },
    { id: "troubleshooting", label: "Troubleshooting" },
];

/* ──────────────  COPY-BUTTON CODE BLOCK COMPONENT  ────────────── */
function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group my-4">
            <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity z-10 border-none"
                title="Copy to clipboard"
            >
                {copied ? <FiCheck className="text-green-400" /> : <FiCopy />}
            </button>
            <pre className="bg-[#1e1e2e] text-[#cdd6f4] p-4 rounded-xl text-sm leading-relaxed overflow-x-auto border border-gray-700/50 font-mono">
                <code className={`language-${lang}`}>{code}</code>
            </pre>
        </div>
    );
}

/* ─────────────────  ENV TABLE ROW COMPONENT  ─────────────────── */
function EnvRow({ name, required, description, example }: { name: string; required: boolean; description: string; example: string }) {
    return (
        <tr className="border-b border-gray-200/60 hover:bg-gray-50/50 transition-colors">
            <td className="py-3 px-4 font-mono text-sm font-bold text-purple-700 whitespace-nowrap">{name}</td>
            <td className="py-3 px-4 text-center">
                {required ? (
                    <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Required</span>
                ) : (
                    <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Optional</span>
                )}
            </td>
            <td className="py-3 px-4 text-sm text-gray-700">{description}</td>
            <td className="py-3 px-4 font-mono text-xs text-gray-500 max-w-[200px] truncate" title={example}>{example}</td>
        </tr>
    );
}

/* ═══════════════════════  MAIN COMPONENT  ════════════════════════ */
export default function CreateCommunityDocs() {
    const [activeSection, setActiveSection] = useState("overview");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    /* Intersection observer to highlight current section in sidebar */
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                }
            },
            { rootMargin: "-80px 0px -70% 0px", threshold: 0.1 }
        );

        SECTIONS.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        setSidebarOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#fafafa] text-gray-900">
            {/* ── TOP BAR ── */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors font-bold text-sm border-none">
                            <FiArrowLeft /> Back to HeliiX
                        </Link>
                    </div>
                    <h1 className="text-sm sm:text-base font-bold text-gray-900 hidden sm:block">Create Your Own Community</h1>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors border-none"
                    >
                        {sidebarOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto flex relative">
                {/* ── SIDEBAR ── */}
                <aside
                    className={`
            fixed lg:sticky top-[57px] left-0 h-[calc(100vh-57px)] w-64 bg-white border-r border-gray-200/60
            overflow-y-auto z-40 transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            lg:block
          `}
                >
                    <nav className="py-6 px-4">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-3">Documentation</div>
                        <ul className="space-y-0.5">
                            {SECTIONS.map((s) => (
                                <li key={s.id}>
                                    <button
                                        onClick={() => scrollTo(s.id)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all border-none ${activeSection === s.id
                                                ? "bg-black text-white shadow-sm"
                                                : "text-gray-600 hover:text-black hover:bg-gray-100"
                                            }`}
                                    >
                                        {s.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                {/* Mobile overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
                )}

                {/* ── MAIN CONTENT ── */}
                <main className="flex-1 min-w-0 px-4 sm:px-8 lg:px-12 py-10 lg:ml-0">

                    {/* ══════════════  OVERVIEW  ══════════════ */}
                    <section id="overview" className="mb-16 scroll-mt-20">
                        <div className="inline-block bg-purple-100 text-purple-700 font-bold px-4 py-1.5 rounded-full text-sm mb-6">
                            Getting Started
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                            Build &amp; Deploy Your Own HeliiX Community
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mb-6">
                            HeliiX is a decentralized, federated social network. Each community runs its own independent backend
                            instance while still being able to communicate with other communities across the fediverse using the
                            ActivityPub protocol.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            {[
                                { label: "Backend", value: "FastAPI (Python 3.11)" },
                                { label: "Database", value: "PostgreSQL + SQLAlchemy" },
                                { label: "Frontend", value: "React + Vite + Tailwind" },
                            ].map((item) => (
                                <div key={item.label} className="bg-white rounded-xl border border-gray-200/60 p-4 shadow-sm">
                                    <div className="text-xs font-bold text-gray-400 uppercase mb-1">{item.label}</div>
                                    <div className="font-bold text-gray-900">{item.value}</div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-800 leading-relaxed">
                            <strong>What you'll get:</strong> A fully functional social community with user authentication,
                            post creation (text + images), user connections, AI-powered content enhancement, image moderation,
                            password reset via email, and federation with other HeliiX instances and compatible Fediverse platforms.
                        </div>
                    </section>

                    {/* ══════════════  PREREQUISITES  ══════════════ */}
                    <section id="prerequisites" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">1</span>
                            Prerequisites
                        </h2>

                        <div className="space-y-4">
                            {[
                                { name: "Python 3.11+", desc: "The backend is built with FastAPI which requires Python 3.11 or higher." },
                                { name: "PostgreSQL", desc: "For the relational database. You can use a hosted service like Supabase, Neon, or Railway, or run PostgreSQL locally." },
                                { name: "Node.js 18+", desc: "Required for the frontend build tools (Vite, TypeScript)." },
                                { name: "Redis", desc: "Used for caching the timeline feed. You need a running Redis instance accessible from your backend." },
                                { name: "Supabase Account", desc: "Used for file storage (avatars, post images). Create a free project at supabase.com and get your URL and service key." },
                                { name: "Groq API Key", desc: "Powers the AI content enhancement features (post completion & elaboration). Sign up at groq.com." },
                                { name: "Google Cloud Vision (Optional)", desc: "Used for automated image moderation. Requires a Google Cloud project with the Vision API enabled." },
                                { name: "Gmail OAuth2 Credentials (Optional)", desc: "For sending password-reset OTP emails. Alternatively, use any SMTP server." },
                            ].map((item) => (
                                <div key={item.name} className="flex gap-4 items-start bg-white rounded-xl border border-gray-200/60 p-4 shadow-sm">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
                                    <div>
                                        <div className="font-bold text-gray-900 mb-0.5">{item.name}</div>
                                        <div className="text-sm text-gray-600">{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ══════════════  INSTALLATION  ══════════════ */}
                    <section id="installation" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">2</span>
                            Installation
                        </h2>

                        <h3 className="text-lg font-bold mb-3">Clone the Repository</h3>
                        <CodeBlock code={`git clone <your-repo-url>
cd fsn-backend`} />

                        <h3 className="text-lg font-bold mb-3 mt-8">Create a Virtual Environment (Recommended)</h3>
                        <CodeBlock code={`python3 -m venv venv
source venv/bin/activate   # Linux / macOS
# venv\\Scripts\\activate    # Windows`} />

                        <h3 className="text-lg font-bold mb-3 mt-8">Install Dependencies</h3>
                        <p className="text-gray-600 text-sm mb-3">Using the Makefile (Linux / macOS):</p>
                        <CodeBlock code={`make install`} />
                        <p className="text-gray-600 text-sm mb-3 mt-4">Or manually:</p>
                        <CodeBlock code={`pip install -r requirements.txt`} />

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mt-6">
                            <strong>Note:</strong> The <code className="bg-amber-100 px-1 rounded">requirements.txt</code> includes
                            all dependencies: FastAPI, Uvicorn, SQLAlchemy, psycopg2, httpx, Pydantic, passlib (argon2), python-jose,
                            cryptography, Google APIs, Supabase, Alembic, Pillow, groq, redis, and google-cloud-vision.
                        </div>
                    </section>

                    {/* ══════════════  ENVIRONMENT CONFIG  ══════════════ */}
                    <section id="environment" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">3</span>
                            Environment Configuration
                        </h2>

                        <p className="text-gray-600 mb-4">
                            Create a <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm">.env</code> file in the
                            <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm"> fsn-backend/</code> root directory.
                            Below is every variable the backend reads:
                        </p>

                        <div className="overflow-x-auto rounded-xl border border-gray-200/60 bg-white shadow-sm">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="py-3 px-4 text-xs font-bold uppercase text-gray-500">Variable</th>
                                        <th className="py-3 px-4 text-xs font-bold uppercase text-gray-500 text-center">Status</th>
                                        <th className="py-3 px-4 text-xs font-bold uppercase text-gray-500">Description</th>
                                        <th className="py-3 px-4 text-xs font-bold uppercase text-gray-500">Example</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <EnvRow name="INSTANCE_NAME" required description="A unique name for your community instance." example="MyCommunity" />
                                    <EnvRow name="DATABASE_URL" required description="PostgreSQL connection string." example="postgresql://user:pass@host:5432/dbname" />
                                    <EnvRow name="SECRET_KEY" required description="A long random string used for JWT signing." example="super-secret-random-key-here" />
                                    <EnvRow name="ALGORITHM" required={false} description="JWT algorithm. Defaults to HS256." example="HS256" />
                                    <EnvRow name="BASE_URL" required description="The public URL of your backend (used for ActivityPub)." example="https://my-community.example.com" />
                                    <EnvRow name="SEND_TO_OTHER_INSTANCE" required={false} description="Enable cross-instance federation delivery. Defaults to false." example="false" />
                                    <EnvRow name="REMOTE_INBOX_URL" required={false} description="Inbox URL of a paired instance (for bi-directional federation)." example="https://other-instance.com/inbox" />
                                    <EnvRow name="SUPABASE_URL" required description="Your Supabase project URL." example="https://xyz.supabase.co" />
                                    <EnvRow name="SUPABASE_SERVICE_KEY" required description="Your Supabase service role key (for storage)." example="eyJhbGci..." />
                                    <EnvRow name="GROQ_API_KEY" required description="API key for Groq AI (post completion/elaboration)." example="gsk_..." />
                                    <EnvRow name="EMAIL_PROVIDER" required={false} description="Email sending method: 'gmail_oauth' or 'smtp'." example="gmail_oauth" />
                                    <EnvRow name="FROM_EMAIL" required={false} description="Sender email address for OTP emails." example="noreply@example.com" />
                                    <EnvRow name="OTP_EXPIRY_MINUTES" required={false} description="How long OTPs are valid (default: 10 minutes)." example="10" />
                                    <EnvRow name="GMAIL_CLIENT_ID" required={false} description="Google OAuth2 client ID (if using gmail_oauth)." example="123456.apps.googleusercontent.com" />
                                    <EnvRow name="GMAIL_CLIENT_SECRET" required={false} description="Google OAuth2 client secret." example="GOCSPX-..." />
                                    <EnvRow name="GMAIL_REFRESH_TOKEN" required={false} description="Google OAuth2 refresh token." example="1//0..." />
                                    <EnvRow name="SMTP_SERVER" required={false} description="SMTP server (if using SMTP provider)." example="smtp.gmail.com" />
                                    <EnvRow name="SMTP_PORT" required={false} description="SMTP port. Defaults to 587." example="587" />
                                    <EnvRow name="SMTP_USER" required={false} description="SMTP login username." example="you@gmail.com" />
                                    <EnvRow name="SMTP_PASSWORD" required={false} description="SMTP login password or app password." example="your-app-password" />
                                </tbody>
                            </table>
                        </div>

                        <h3 className="text-lg font-bold mt-8 mb-3">Example .env File</h3>
                        <CodeBlock lang="ini" code={`INSTANCE_NAME=MyCommunity
DATABASE_URL=postgresql://user:password@localhost:5432/fsn_db
SECRET_KEY=my-super-secret-key-change-this
ALGORITHM=HS256
BASE_URL=http://localhost:8000
SEND_TO_OTHER_INSTANCE=false
REMOTE_INBOX_URL=

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOi...
GROQ_API_KEY=gsk_...

# Email (Gmail OAuth2)
EMAIL_PROVIDER=gmail_oauth
FROM_EMAIL=you@gmail.com
GMAIL_CLIENT_ID=your-client-id
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token`} />
                    </section>

                    {/* ══════════════  DATABASE  ══════════════ */}
                    <section id="database" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">4</span>
                            Database Setup
                        </h2>

                        <p className="text-gray-600 mb-4">
                            The backend uses SQLAlchemy ORM with PostgreSQL. Tables are created automatically from the model definitions.
                            The database has the following tables: <strong>users</strong>, <strong>posts</strong>, <strong>activities</strong>,{" "}
                            <strong>connections</strong>, <strong>password_resets</strong>, and <strong>likes</strong>.
                        </p>

                        <h3 className="text-lg font-bold mb-3">Create All Tables</h3>
                        <p className="text-gray-600 text-sm mb-3">Using the Makefile:</p>
                        <CodeBlock code={`make migrate`} />
                        <p className="text-gray-600 text-sm mb-3 mt-4">Or manually:</p>
                        <CodeBlock code={`python -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine); print('Database tables created successfully')"`} />

                        <h3 className="text-lg font-bold mb-3 mt-8">Using Alembic for Migrations</h3>
                        <p className="text-gray-600 text-sm mb-3">
                            The project includes Alembic for managing database migrations. To generate a new migration after model changes:
                        </p>
                        <CodeBlock code={`# Generate a new migration
alembic revision --autogenerate -m "describe your changes"

# Apply migrations
alembic upgrade head`} />

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mt-6">
                            <strong>Important:</strong> Update the <code className="bg-amber-100 px-1 rounded">sqlalchemy.url</code> in{" "}
                            <code className="bg-amber-100 px-1 rounded">alembic.ini</code> to match your{" "}
                            <code className="bg-amber-100 px-1 rounded">DATABASE_URL</code> from the <code className="bg-amber-100 px-1 rounded">.env</code> file.
                        </div>

                        <h3 className="text-lg font-bold mb-3 mt-8">Supabase Storage Buckets</h3>
                        <p className="text-gray-600 text-sm mb-3">
                            In your Supabase dashboard, create two storage buckets:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl border border-gray-200/60 p-4 shadow-sm">
                                <div className="font-bold text-gray-900 mb-1">📁 avatars</div>
                                <div className="text-sm text-gray-600">For user profile pictures (max 2MB, JPEG/PNG/WebP).</div>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200/60 p-4 shadow-sm">
                                <div className="font-bold text-gray-900 mb-1">📁 posts</div>
                                <div className="text-sm text-gray-600">For post image attachments.</div>
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm mt-3">Set both buckets to <strong>public</strong> so images are accessible via URL.</p>
                    </section>

                    {/* ══════════════  RUNNING  ══════════════ */}
                    <section id="running" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">5</span>
                            Running the Server
                        </h2>

                        <h3 className="text-lg font-bold mb-3">Development Mode</h3>
                        <p className="text-gray-600 text-sm mb-3">Using the Makefile:</p>
                        <CodeBlock code={`make run`} />
                        <p className="text-gray-600 text-sm mb-3 mt-4">Or manually with Uvicorn:</p>
                        <CodeBlock code={`uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`} />

                        <p className="text-gray-600 text-sm mt-4 mb-6">
                            The server will start on <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm">http://localhost:8000</code>.
                            Visit <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm">http://localhost:8000/docs</code> for the
                            interactive Swagger API documentation.
                        </p>

                        <h3 className="text-lg font-bold mb-3">Production Mode</h3>
                        <p className="text-gray-600 text-sm mb-3">For production, remove <code className="bg-gray-100 px-1 rounded">--reload</code> and set appropriate workers:</p>
                        <CodeBlock code={`uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4`} />

                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800 mt-4">
                            <strong>Tip:</strong> For production deployments, consider using a process manager like{" "}
                            <strong>PM2</strong>, <strong>systemd</strong>, or Docker (see next section). Always run behind
                            a reverse proxy like <strong>Nginx</strong> or <strong>Caddy</strong> with SSL/TLS.
                        </div>
                    </section>

                    {/* ══════════════  DOCKER  ══════════════ */}
                    <section id="docker" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">6</span>
                            Docker Deployment
                        </h2>

                        <p className="text-gray-600 mb-4">
                            The backend ships with a Dockerfile based on <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm">python:3.11-slim</code>.
                        </p>

                        <h3 className="text-lg font-bold mb-3">Build the Docker Image</h3>
                        <CodeBlock code={`make docker-build
# Or manually:
docker build -t fsn-backend .`} />

                        <h3 className="text-lg font-bold mb-3 mt-8">Run the Container</h3>
                        <CodeBlock code={`make docker-run
# Or manually:
docker run -p 8080:8080 --env-file .env fsn-backend`} />

                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 mt-4">
                            <strong>Port:</strong> The Docker container exposes port <strong>8080</strong> by default (set via the{" "}
                            <code className="bg-blue-100 px-1 rounded">PORT</code> environment variable in the Dockerfile).
                            Map it to any host port you prefer.
                        </div>

                        <h3 className="text-lg font-bold mb-3 mt-8">Cloud Deployment</h3>
                        <p className="text-gray-600 text-sm">
                            The Docker image can be deployed to any container platform: <strong>Google Cloud Run</strong>,{" "}
                            <strong>AWS ECS</strong>, <strong>Azure Container Apps</strong>, <strong>Railway</strong>,{" "}
                            <strong>Fly.io</strong>, or <strong>DigitalOcean App Platform</strong>.
                            Just push your image to a container registry and deploy — make sure to set all the environment
                            variables from the config section above.
                        </p>
                    </section>

                    {/* ══════════════  FRONTEND  ══════════════ */}
                    <section id="frontend" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">7</span>
                            Frontend Setup
                        </h2>

                        <h3 className="text-lg font-bold mb-3">Clone &amp; Install</h3>
                        <CodeBlock code={`cd fsn-frontend
npm install`} />

                        <h3 className="text-lg font-bold mb-3 mt-8">Point to Your Backend</h3>
                        <p className="text-gray-600 text-sm mb-3">
                            Open <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm">src/config/instances.ts</code> and
                            update the <code className="bg-gray-100 px-1 rounded">url</code> field of the instances array to point to your deployed
                            backend URL:
                        </p>
                        <CodeBlock lang="typescript" code={`export const INSTANCES = [
  {
    name: "My Community",
    url: "https://your-backend-url.com",
    color: "bg-cyan-100 border-cyan-300",
    description: "Your community description here."
  }
];`} />

                        <h3 className="text-lg font-bold mb-3 mt-8">Run in Development</h3>
                        <CodeBlock code={`npm run dev`} />
                        <p className="text-gray-600 text-sm mt-2">
                            The frontend will start on <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm">http://localhost:5173</code> (Vite default).
                        </p>

                        <h3 className="text-lg font-bold mb-3 mt-8">Build for Production</h3>
                        <CodeBlock code={`npm run build`} />
                        <p className="text-gray-600 text-sm mt-2">
                            The production bundle will be output to the <code className="bg-gray-100 px-1 rounded">dist/</code> folder.
                            Deploy it to any static hosting service (Vercel, Netlify, Cloudflare Pages, GitHub Pages, etc.).
                        </p>
                    </section>

                    {/* ══════════════  API REFERENCE  ══════════════ */}
                    <section id="api" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">8</span>
                            API Reference
                        </h2>

                        <p className="text-gray-600 mb-6">
                            All endpoints are prefixed with your <code className="bg-gray-100 px-1 rounded">BASE_URL</code>.
                            Authentication uses Bearer tokens — include <code className="bg-gray-100 px-1 rounded">Authorization: Bearer &lt;token&gt;</code> in headers.
                            Visit <code className="bg-gray-100 px-1 rounded">/docs</code> on your running instance for interactive Swagger documentation.
                        </p>

                        {/* Auth endpoints */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold mb-4 pb-2 border-b border-gray-200">🔐 Authentication</h3>
                            <div className="space-y-3">
                                {[
                                    { method: "POST", path: "/auth/register", desc: "Register a new user (params: username, password, email)" },
                                    { method: "POST", path: "/auth/login", desc: "Login and receive JWT access token (params: username, password)" },
                                    { method: "POST", path: "/auth/forgot-password", desc: "Request password reset OTP (body: { email })" },
                                    { method: "POST", path: "/auth/verify-otp", desc: "Verify OTP code (body: { email, otp })" },
                                    { method: "POST", path: "/auth/reset-password", desc: "Reset password (body: { reset_token, new_password })" },
                                ].map((ep) => (
                                    <div key={ep.path} className="flex items-start gap-3 bg-white rounded-lg border border-gray-200/60 p-3 shadow-sm">
                                        <span className={`text-xs font-bold px-2 py-1 rounded shrink-0 ${ep.method === "GET" ? "bg-green-100 text-green-700" : ep.method === "DELETE" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{ep.method}</span>
                                        <div>
                                            <code className="text-sm font-mono font-bold text-gray-900">{ep.path}</code>
                                            <p className="text-xs text-gray-500 mt-0.5">{ep.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Posts endpoints */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold mb-4 pb-2 border-b border-gray-200">📝 Posts</h3>
                            <div className="space-y-3">
                                {[
                                    { method: "POST", path: "/posts", desc: "Create a new post (form: content, image?, visibility?)" },
                                    { method: "GET", path: "/get_posts", desc: "Get all posts" },
                                    { method: "GET", path: "/timeline", desc: "Get personalized timeline (public + followers + own)" },
                                    { method: "GET", path: "/timeline_connected_users", desc: "Get posts from connected users only" },
                                    { method: "DELETE", path: "/delete/{post_id}", desc: "Delete a post (must be the author)" },
                                    { method: "POST", path: "/posts/{post_id}/like", desc: "Like a post" },
                                    { method: "DELETE", path: "/posts/{post_id}/like", desc: "Unlike a post" },
                                    { method: "POST", path: "/post/completePost", desc: "AI-powered post completion (form: content)" },
                                    { method: "POST", path: "/post/eloboratePost", desc: "AI-powered post elaboration (form: content)" },
                                ].map((ep) => (
                                    <div key={ep.path + ep.method} className="flex items-start gap-3 bg-white rounded-lg border border-gray-200/60 p-3 shadow-sm">
                                        <span className={`text-xs font-bold px-2 py-1 rounded shrink-0 ${ep.method === "GET" ? "bg-green-100 text-green-700" : ep.method === "DELETE" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{ep.method}</span>
                                        <div>
                                            <code className="text-sm font-mono font-bold text-gray-900">{ep.path}</code>
                                            <p className="text-xs text-gray-500 mt-0.5">{ep.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Users endpoints */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold mb-4 pb-2 border-b border-gray-200">👥 Users &amp; Connections</h3>
                            <div className="space-y-3">
                                {[
                                    { method: "GET", path: "/get_current_user", desc: "Get the authenticated user's info" },
                                    { method: "GET", path: "/get_user/{username}", desc: "Get a user's profile and posts" },
                                    { method: "GET", path: "/search_users?q=...", desc: "Search users (local prefix or remote handle)" },
                                    { method: "GET", path: "/random_users", desc: "Get random user suggestions (excludes connected)" },
                                    { method: "POST", path: "/connect/{username}", desc: "Send a connection request to a local user" },
                                    { method: "POST", path: "/connect/remote?handle=...", desc: "Follow a remote Fediverse user" },
                                    { method: "POST", path: "/connect/accept/{connection_id}", desc: "Accept a pending connection request" },
                                    { method: "GET", path: "/connections/pending", desc: "List pending connection requests" },
                                    { method: "GET", path: "/list_connections", desc: "List all accepted connections" },
                                    { method: "GET", path: "/count_connections", desc: "Get connection count" },
                                    { method: "POST", path: "/remove_connection/{username}", desc: "Remove a connection" },
                                    { method: "POST", path: "/users/avatar", desc: "Upload avatar (form: file)" },
                                    { method: "POST", path: "/update-profile", desc: "Update bio and display_name" },
                                ].map((ep) => (
                                    <div key={ep.path + ep.method} className="flex items-start gap-3 bg-white rounded-lg border border-gray-200/60 p-3 shadow-sm">
                                        <span className={`text-xs font-bold px-2 py-1 rounded shrink-0 ${ep.method === "GET" ? "bg-green-100 text-green-700" : ep.method === "DELETE" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{ep.method}</span>
                                        <div>
                                            <code className="text-sm font-mono font-bold text-gray-900">{ep.path}</code>
                                            <p className="text-xs text-gray-500 mt-0.5">{ep.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Moderation */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold mb-4 pb-2 border-b border-gray-200">🛡️ Moderation</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 bg-white rounded-lg border border-gray-200/60 p-3 shadow-sm">
                                    <span className="text-xs font-bold px-2 py-1 rounded shrink-0 bg-blue-100 text-blue-700">POST</span>
                                    <div>
                                        <code className="text-sm font-mono font-bold text-gray-900">/moderate-image</code>
                                        <p className="text-xs text-gray-500 mt-0.5">Check image for explicit content (adult, violence, racy, medical, spoof) via Google Cloud Vision</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Federation */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 pb-2 border-b border-gray-200">🌐 Federation (ActivityPub)</h3>
                            <div className="space-y-3">
                                {[
                                    { method: "GET", path: "/.well-known/webfinger?resource=acct:user@domain", desc: "WebFinger endpoint for actor discovery" },
                                    { method: "GET", path: "/users/{username}", desc: "ActivityPub Actor profile (JSON-LD)" },
                                    { method: "POST", path: "/inbox", desc: "Shared inbox for receiving federated activities" },
                                    { method: "POST", path: "/users/{username}/inbox", desc: "Per-user inbox" },
                                    { method: "GET", path: "/users/{username}/outbox", desc: "Outbox — returns posts (OrderedCollection)" },
                                    { method: "POST", path: "/users/{username}/outbox", desc: "Post activity to outbox" },
                                    { method: "POST", path: "/sync/remote_posts", desc: "Manually sync posts from followed remote users" },
                                ].map((ep) => (
                                    <div key={ep.path + ep.method} className="flex items-start gap-3 bg-white rounded-lg border border-gray-200/60 p-3 shadow-sm">
                                        <span className={`text-xs font-bold px-2 py-1 rounded shrink-0 ${ep.method === "GET" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{ep.method}</span>
                                        <div>
                                            <code className="text-sm font-mono font-bold text-gray-900">{ep.path}</code>
                                            <p className="text-xs text-gray-500 mt-0.5">{ep.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ══════════════  COMMUNITY  ══════════════ */}
                    <section id="community" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">9</span>
                            Managing Your Community
                        </h2>

                        <div className="space-y-6">
                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold mb-3">👤 User Registration</h3>
                                <p className="text-gray-600 text-sm mb-3">
                                    Users register via the <code className="bg-gray-100 px-1 rounded">/auth/register</code> endpoint.
                                    Each user is assigned an RSA keypair for ActivityPub federation. Usernames must be alphanumeric
                                    (dashes and underscores allowed).
                                </p>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold mb-3">🤝 Connections</h3>
                                <p className="text-gray-600 text-sm mb-3">
                                    Users connect with each other through a <strong>request → accept</strong> flow.
                                    When a connection is accepted, a bidirectional mirror connection is created.
                                    Connected users can see each other's "followers-only" posts.
                                </p>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold mb-3">📷 Image Moderation</h3>
                                <p className="text-gray-600 text-sm mb-3">
                                    The <code className="bg-gray-100 px-1 rounded">/moderate-image</code> endpoint uses Google Cloud Vision
                                    SafeSearch to classify images for adult, violence, racy, medical, and spoof content.
                                    The frontend calls this before uploading to prevent explicit content.
                                </p>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold mb-3">🤖 AI Features</h3>
                                <p className="text-gray-600 text-sm">
                                    Two AI-powered endpoints enhance post creation:
                                </p>
                                <ul className="text-gray-600 text-sm mt-2 space-y-1 list-disc list-inside">
                                    <li><strong>Complete Post</strong> — Rewrites and improves content clarity and engagement</li>
                                    <li><strong>Elaborate Post</strong> — Expands short inputs into richer 45-50 word versions</li>
                                </ul>
                                <p className="text-gray-500 text-xs mt-2">Powered by Groq API (using the gpt-oss-120b model).</p>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold mb-3">📊 Post Visibility</h3>
                                <p className="text-gray-600 text-sm">
                                    Posts support two visibility levels:
                                </p>
                                <ul className="text-gray-600 text-sm mt-2 space-y-1 list-disc list-inside">
                                    <li><strong>public</strong> — Visible to everyone on the instance and federated network</li>
                                    <li><strong>followers</strong> — Only visible to accepted connections and the post author</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* ══════════════  FEDERATION  ══════════════ */}
                    <section id="federation" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">10</span>
                            Federation
                        </h2>

                        <p className="text-gray-600 mb-6">
                            HeliiX implements ActivityPub federation, allowing your community to communicate with other HeliiX instances
                            and compatible Fediverse platforms like Mastodon, Pleroma, and PixelFed.
                        </p>

                        <div className="space-y-6">
                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold mb-3">Enabling Federation</h3>
                                <p className="text-gray-600 text-sm mb-3">Set these environment variables:</p>
                                <CodeBlock lang="ini" code={`SEND_TO_OTHER_INSTANCE=true
REMOTE_INBOX_URL=https://other-instance.example.com/inbox`} />
                                <p className="text-gray-500 text-xs mt-2">
                                    When enabled, new posts are delivered to all remote followers' inboxes using HTTP Signatures (RSA-SHA256).
                                </p>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold mb-3">How It Works</h3>
                                <div className="space-y-3 text-sm text-gray-600">
                                    <div className="flex gap-3">
                                        <span className="font-bold text-black shrink-0">1.</span>
                                        <span><strong>WebFinger Discovery</strong> — Remote instances resolve your users via <code className="bg-gray-100 px-1 rounded">/.well-known/webfinger</code></span>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="font-bold text-black shrink-0">2.</span>
                                        <span><strong>Actor Profiles</strong> — Each user has a JSON-LD actor profile at <code className="bg-gray-100 px-1 rounded">/users/&#123;username&#125;</code> with public key, inbox, outbox</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="font-bold text-black shrink-0">3.</span>
                                        <span><strong>Follow Requests</strong> — Users can follow remote users; signed Follow activities are sent to the remote inbox</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="font-bold text-black shrink-0">4.</span>
                                        <span><strong>Post Delivery</strong> — New posts are wrapped as Create activities and delivered to all remote followers</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="font-bold text-black shrink-0">5.</span>
                                        <span><strong>Incoming Activities</strong> — The shared inbox processes Create, Delete, Follow, Accept, and Undo activities</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold mb-3">HTTP Signatures</h3>
                                <p className="text-gray-600 text-sm">
                                    All outgoing federation requests are signed with the user's RSA private key using HTTP Signatures
                                    (rsa-sha256). RSA keypairs are generated upon user registration and stored in the database.
                                    The public key is exposed in the actor profile for remote servers to verify incoming requests.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* ══════════════  TROUBLESHOOTING  ══════════════ */}
                    <section id="troubleshooting" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">11</span>
                            Troubleshooting
                        </h2>

                        <div className="space-y-4">
                            {[
                                {
                                    q: "ModuleNotFoundError: No module named 'app'",
                                    a: "Make sure you're running the server from the fsn-backend/ root directory, not from inside the app/ folder. The command should be: uvicorn app.main:app --reload"
                                },
                                {
                                    q: "pydantic_settings.errors.MissingSettingsError",
                                    a: "One or more required environment variables are missing. Ensure your .env file is in the fsn-backend/ root and contains all required variables (INSTANCE_NAME, DATABASE_URL, SECRET_KEY, BASE_URL, SUPABASE_URL, SUPABASE_SERVICE_KEY, GROQ_API_KEY)."
                                },
                                {
                                    q: "psycopg2.OperationalError: could not connect to server",
                                    a: "Your DATABASE_URL is incorrect or the PostgreSQL server is not running. Check the host, port, username, password, and database name. If using Supabase, ensure you have the correct connection string with ?sslmode=require."
                                },
                                {
                                    q: "Redis connection refused",
                                    a: "The backend expects Redis at a specific host/port (configured in app/routers/posts.py). Update the Redis connection settings to match your Redis instance. If you don't have Redis, install and start it locally: sudo apt install redis-server && sudo systemctl start redis"
                                },
                                {
                                    q: "CORS errors in the browser",
                                    a: "The backend allows all origins by default (allow_origins=['*']). If you're still getting CORS errors, check that your browser isn't blocking requests or that you're hitting the correct backend URL."
                                },
                                {
                                    q: "JWT token errors (401 Unauthorized)",
                                    a: "Ensure you're sending the token in the Authorization header as 'Bearer <token>'. The token expires after 60 minutes by default. Re-login to get a fresh token."
                                },
                                {
                                    q: "Email sending fails",
                                    a: "If using Gmail OAuth — run 'make create-token' (or python create_refresh_token.py) to generate a refresh token. Ensure GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN are all set. If using SMTP — ensure SMTP_USER and SMTP_PASSWORD are correct (use an App Password for Gmail)."
                                },
                                {
                                    q: "Image upload errors",
                                    a: "Ensure your Supabase buckets ('avatars' and 'posts') exist and are set to public. Check that SUPABASE_URL and SUPABASE_SERVICE_KEY are correct. Avatar uploads are limited to 2MB and JPEG/PNG/WebP formats."
                                },
                            ].map((item, i) => (
                                <details key={i} className="bg-white rounded-xl border border-gray-200/60 shadow-sm group">
                                    <summary className="px-5 py-4 cursor-pointer font-bold text-gray-900 text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors rounded-xl list-none">
                                        <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0">!</span>
                                        {item.q}
                                    </summary>
                                    <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 ml-9">
                                        {item.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </section>

                    {/* ── FOOTER ── */}
                    <div className="border-t border-gray-200/60 pt-8 pb-4 text-center">
                        <p className="text-sm text-gray-400">
                            Built with ❤️ by the HeliiX team. <Link to="/" className="text-gray-600 hover:text-black font-bold border-none">Back to home</Link>
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}
