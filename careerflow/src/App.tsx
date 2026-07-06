import { useEffect, useMemo, useState, type FormEvent } from "react";
import { api } from "./api";
import type {
  Analytics,
  Job,
  JobDraft,
  JobStatus,
  MatchResult
} from "./types";

const STATUS_META: Record<
  JobStatus,
  { label: string; color: string; dot: string }
> = {
  wishlist: { label: "心愿清单", color: "violet", dot: "#8b7cf6" },
  applied: { label: "已投递", color: "blue", dot: "#5b8def" },
  interview: { label: "面试中", color: "amber", dot: "#f2a93b" },
  offer: { label: "已录用", color: "green", dot: "#40b89c" },
  rejected: { label: "已结束", color: "gray", dot: "#9aa3b2" }
};

const PIPELINE: JobStatus[] = ["wishlist", "applied", "interview", "offer"];

const EMPTY_JOB: JobDraft = {
  company: "",
  role: "",
  status: "wishlist",
  location: "",
  workMode: "远程",
  salaryMin: null,
  salaryMax: null,
  source: "",
  appliedAt: null,
  nextStep: "",
  nextStepAt: null,
  description: ""
};

const SAMPLE_RESUME =
  "全栈开发工程师，使用 React、TypeScript 与 Node.js 构建业务产品。负责设计 REST API 和 SQL 数据模型，将页面加载速度提升 42%，通过 Docker 和 CI/CD 将发布耗时降低 60%。";

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`logo ${compact ? "compact" : ""}`}>
      <span className="logo-mark">
        <i />
        <i />
        <i />
      </span>
      {!compact && <span>CareerFlow</span>}
    </div>
  );
}

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="3" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z" />
        <path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14ZM5 13l.8 2.2L8 16l-2.2.8L5 19l-.8-2.2L2 16l2.2-.8L5 13Z" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </>
    ),
    arrow: <path d="M5 12h14M14 7l5 5-5 5" />,
    edit: (
      <>
        <path d="m4 16-1 5 5-1L19 9l-4-4L4 16Z" />
        <path d="m13 7 4 4" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" />
      </>
    ),
    logout: (
      <>
        <path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />
  };
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function Login({ onLogin }: { onLogin: (name: string) => void }) {
  const [email, setEmail] = useState("demo@careerflow.dev");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { user } = await api.login(email, password);
      onLogin(user.name);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-story">
        <Logo />
        <div className="story-copy">
          <span className="eyebrow light">你的求职指挥中心</span>
          <h1>
            把每一次机会，
            <br />
            变成下一步行动。
          </h1>
          <p>集中管理投递进度、面试节点与岗位匹配度，告别散落的表格和便签。</p>
        </div>
        <div className="story-preview">
          <div className="preview-row">
            <span>本周进展</span>
            <strong>8 个活跃机会</strong>
          </div>
          <div className="preview-bars">
            {[42, 64, 38, 78, 56, 92, 72].map((height, index) => (
              <i key={index} style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
        <small>为认真对待职业选择的人而设计</small>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <span className="mobile-logo">
            <Logo />
          </span>
          <span className="eyebrow">欢迎回来</span>
          <h2>继续推进你的机会</h2>
          <p className="subtle">演示账号已为你填好，直接登录即可体验。</p>
          <form onSubmit={submit}>
            <label>
              邮箱
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </label>
            <label>
              密码
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </label>
            {error && <p className="form-error">{error}</p>}
            <button className="primary wide" disabled={loading}>
              {loading ? "正在登录…" : "进入 CareerFlow"}
              {!loading && <Icon name="arrow" />}
            </button>
          </form>
          <div className="demo-hint">
            <span>DEMO</span>
            <p>
              <strong>demo@careerflow.dev</strong>
              <small>密码：demo123</small>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
  note,
  tone,
  icon
}: {
  label: string;
  value: string | number;
  note: string;
  tone: string;
  icon: string;
}) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${tone}`}>
        <Icon name={icon} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  );
}

function JobCard({
  job,
  onEdit,
  onDragStart
}: {
  job: Job;
  onEdit: (job: Job) => void;
  onDragStart: (job: Job) => void;
}) {
  const initials = job.company.slice(0, 2).toUpperCase();
  return (
    <article
      className="job-card"
      draggable
      onDragStart={() => onDragStart(job)}
      onClick={() => onEdit(job)}
    >
      <header>
        <span className={`company-mark mark-${job.company.length % 5}`}>
          {initials}
        </span>
        <button
          className="icon-button"
          aria-label="编辑职位"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(job);
          }}
        >
          <Icon name="edit" />
        </button>
      </header>
      <h4>{job.role}</h4>
      <p>{job.company}</p>
      <div className="job-meta">
        <span>{job.location || "地点待定"}</span>
        <i />
        <span>{job.workMode}</span>
      </div>
      {job.nextStep && (
        <div className="next-step">
          <span>{job.nextStep}</span>
          {job.nextStepAt && (
            <small>
              {new Date(job.nextStepAt).toLocaleDateString("zh-CN", {
                month: "numeric",
                day: "numeric"
              })}
            </small>
          )}
        </div>
      )}
    </article>
  );
}

function Dashboard({
  jobs,
  analytics,
  onEdit,
  onMove
}: {
  jobs: Job[];
  analytics: Analytics;
  onEdit: (job: Job) => void;
  onMove: (job: Job, status: JobStatus) => void;
}) {
  const [dragged, setDragged] = useState<Job | null>(null);
  const upcoming = jobs
    .filter((job) => job.nextStepAt && new Date(job.nextStepAt) > new Date())
    .sort(
      (a, b) =>
        new Date(a.nextStepAt!).getTime() - new Date(b.nextStepAt!).getTime()
    )
    .slice(0, 3);

  return (
    <>
      <section className="metrics">
        <MetricCard
          label="全部机会"
          value={analytics.total}
          note="持续拓展中"
          tone="violet"
          icon="briefcase"
        />
        <MetricCard
          label="活跃进程"
          value={analytics.active}
          note="需要你的关注"
          tone="blue"
          icon="grid"
        />
        <MetricCard
          label="面试转化"
          value={`${analytics.interviewRate}%`}
          note="投递 → 面试"
          tone="amber"
          icon="sparkles"
        />
        <MetricCard
          label="收到 Offer"
          value={analytics.offers}
          note={`面试转化 ${analytics.offerRate}%`}
          tone="green"
          icon="calendar"
        />
      </section>

      <section className="dashboard-grid">
        <div className="pipeline-shell">
          <div className="section-title">
            <div>
              <span className="eyebrow">申请管道</span>
              <h3>机会进展</h3>
            </div>
            <span className="drag-hint">拖动卡片即可更新状态</span>
          </div>
          <div className="pipeline">
            {PIPELINE.map((status) => {
              const statusJobs = jobs.filter((job) => job.status === status);
              return (
                <div
                  className="pipeline-column"
                  key={status}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (dragged && dragged.status !== status) {
                      onMove(dragged, status);
                    }
                    setDragged(null);
                  }}
                >
                  <header>
                    <span
                      className="status-dot"
                      style={{ background: STATUS_META[status].dot }}
                    />
                    <strong>{STATUS_META[status].label}</strong>
                    <small>{statusJobs.length}</small>
                  </header>
                  <div className="column-content">
                    {statusJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onEdit={onEdit}
                        onDragStart={setDragged}
                      />
                    ))}
                    {statusJobs.length === 0 && (
                      <div className="empty-column">拖到这里</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="upcoming-card">
          <div className="section-title">
            <div>
              <span className="eyebrow">行动提醒</span>
              <h3>接下来</h3>
            </div>
            <span className="calendar-icon">
              <Icon name="calendar" />
            </span>
          </div>
          <div className="upcoming-list">
            {upcoming.length === 0 && (
              <p className="empty-note">暂时没有即将到来的安排。</p>
            )}
            {upcoming.map((job, index) => {
              const date = new Date(job.nextStepAt!);
              return (
                <button key={job.id} onClick={() => onEdit(job)}>
                  <span className={`date-tile tone-${index}`}>
                    <strong>{date.getDate()}</strong>
                    <small>{date.toLocaleDateString("zh-CN", { month: "short" })}</small>
                  </span>
                  <span>
                    <strong>{job.nextStep}</strong>
                    <small>{job.company} · {job.role}</small>
                  </span>
                  <Icon name="chevron" />
                </button>
              );
            })}
          </div>
          <div className="focus-note">
            <span>今日建议</span>
            <p>优先准备最近一场面试，把岗位要求映射到 3 个项目故事。</p>
          </div>
        </aside>
      </section>
    </>
  );
}

function JobsView({
  jobs,
  onEdit
}: {
  jobs: Job[];
  onEdit: (job: Job) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<JobStatus | "all">("all");
  const filtered = jobs.filter(
    (job) =>
      (status === "all" || job.status === status) &&
      `${job.company} ${job.role} ${job.location}`
        .toLowerCase()
        .includes(query.toLowerCase())
  );

  return (
    <section className="list-view">
      <div className="list-toolbar">
        <div className="search-box">
          <Icon name="search" />
          <input
            placeholder="搜索公司、职位或城市"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as JobStatus | "all")}
        >
          <option value="all">全部状态</option>
          {Object.entries(STATUS_META).map(([value, meta]) => (
            <option key={value} value={value}>
              {meta.label}
            </option>
          ))}
        </select>
      </div>
      <div className="jobs-table">
        <div className="table-row table-head">
          <span>公司与职位</span>
          <span>状态</span>
          <span>地点</span>
          <span>薪资范围</span>
          <span>下一步</span>
          <span />
        </div>
        {filtered.map((job) => (
          <button className="table-row" key={job.id} onClick={() => onEdit(job)}>
            <span className="table-company">
              <i className={`company-mark mark-${job.company.length % 5}`}>
                {job.company.slice(0, 2).toUpperCase()}
              </i>
              <span>
                <strong>{job.role}</strong>
                <small>{job.company}</small>
              </span>
            </span>
            <span>
              <i className={`status-pill ${STATUS_META[job.status].color}`}>
                {STATUS_META[job.status].label}
              </i>
            </span>
            <span>{job.location || "—"}</span>
            <span>
              {job.salaryMin && job.salaryMax
                ? `${job.salaryMin}k – ${job.salaryMax}k`
                : "面议"}
            </span>
            <span>{job.nextStep || "待规划"}</span>
            <span className="row-arrow">
              <Icon name="chevron" />
            </span>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="list-empty">没有找到符合条件的机会</div>
        )}
      </div>
    </section>
  );
}

function Analyzer({ jobs }: { jobs: Job[] }) {
  const analyzableJobs = jobs.filter((job) => job.description);
  const [jobId, setJobId] = useState(analyzableJobs[0]?.id ?? "");
  const [resume, setResume] = useState(SAMPLE_RESUME);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const selected = jobs.find((job) => job.id === jobId);

  async function analyze() {
    if (!selected) return;
    setLoading(true);
    setError("");
    try {
      const response = await api.analyze(resume, selected.description);
      setResult(response.result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "分析失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="analyzer-view">
      <div className="analyzer-intro">
        <span className="sparkle-badge">
          <Icon name="sparkles" />
        </span>
        <div>
          <span className="eyebrow">可解释匹配分析</span>
          <h3>让每次投递更有把握</h3>
          <p>识别简历与岗位描述中的技能证据，得到清晰、可执行的优化建议。</p>
        </div>
      </div>
      <div className="analyzer-grid">
        <div className="analyzer-inputs">
          <label>
            选择目标岗位
            <select value={jobId} onChange={(event) => setJobId(event.target.value)}>
              {analyzableJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.company} · {job.role}
                </option>
              ))}
            </select>
          </label>
          <label>
            简历文本
            <textarea
              value={resume}
              onChange={(event) => setResume(event.target.value)}
              rows={9}
            />
          </label>
          {selected && (
            <div className="job-description">
              <span>岗位要求</span>
              <p>{selected.description}</p>
            </div>
          )}
          {error && <p className="form-error">{error}</p>}
          <button className="primary" onClick={analyze} disabled={loading || !selected}>
            <Icon name="sparkles" />
            {loading ? "正在分析…" : "开始匹配分析"}
          </button>
        </div>
        <div className={`analysis-result ${result ? "has-result" : ""}`}>
          {!result ? (
            <div className="result-placeholder">
              <span>
                <Icon name="sparkles" />
              </span>
              <h4>等待分析</h4>
              <p>选择岗位并粘贴简历文本，这里会展示匹配分数与改进方向。</p>
            </div>
          ) : (
            <>
              <div className="score-ring" style={{ "--score": result.score } as React.CSSProperties}>
                <div>
                  <strong>{result.score}</strong>
                  <small>匹配分</small>
                </div>
              </div>
              <h4>{result.summary}</h4>
              <div className="skill-group">
                <span>已匹配技能</span>
                <div>
                  {result.matchedSkills.length ? (
                    result.matchedSkills.map((skill) => (
                      <i className="skill matched" key={skill}>
                        {skill}
                      </i>
                    ))
                  ) : (
                    <small>暂未识别到</small>
                  )}
                </div>
              </div>
              <div className="skill-group">
                <span>待补充证据</span>
                <div>
                  {result.missingSkills.length ? (
                    result.missingSkills.map((skill) => (
                      <i className="skill missing" key={skill}>
                        {skill}
                      </i>
                    ))
                  ) : (
                    <small>核心技能已覆盖</small>
                  )}
                </div>
              </div>
              <div className="suggestions">
                <span>优化建议</span>
                {result.suggestions.map((suggestion, index) => (
                  <p key={suggestion}>
                    <i>{index + 1}</i>
                    {suggestion}
                  </p>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function JobModal({
  job,
  onClose,
  onSave,
  onDelete
}: {
  job: Job | null;
  onClose: () => void;
  onSave: (draft: JobDraft) => Promise<void>;
  onDelete: (() => Promise<void>) | null;
}) {
  const [draft, setDraft] = useState<JobDraft>(
    job
      ? {
          company: job.company,
          role: job.role,
          status: job.status,
          location: job.location,
          workMode: job.workMode,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          source: job.source,
          appliedAt: job.appliedAt,
          nextStep: job.nextStep,
          nextStepAt: job.nextStepAt,
          description: job.description
        }
      : EMPTY_JOB
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof JobDraft>(key: K, value: JobDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave(draft);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "保存失败");
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form
        className="job-modal"
        onSubmit={submit}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <span className="eyebrow">{job ? "更新机会" : "新增机会"}</span>
            <h3>{job ? "编辑职位信息" : "记录一个新机会"}</h3>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="form-grid">
          <label>
            公司名称 *
            <input
              required
              value={draft.company}
              onChange={(event) => update("company", event.target.value)}
              placeholder="例如：OpenAI"
            />
          </label>
          <label>
            职位名称 *
            <input
              required
              value={draft.role}
              onChange={(event) => update("role", event.target.value)}
              placeholder="例如：Product Engineer"
            />
          </label>
          <label>
            当前状态
            <select
              value={draft.status}
              onChange={(event) => update("status", event.target.value as JobStatus)}
            >
              {Object.entries(STATUS_META).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            工作地点
            <input
              value={draft.location}
              onChange={(event) => update("location", event.target.value)}
              placeholder="上海 / 远程"
            />
          </label>
          <label>
            办公方式
            <select
              value={draft.workMode}
              onChange={(event) => update("workMode", event.target.value)}
            >
              <option>远程</option>
              <option>混合办公</option>
              <option>现场</option>
            </select>
          </label>
          <label>
            信息来源
            <input
              value={draft.source}
              onChange={(event) => update("source", event.target.value)}
              placeholder="官网 / 内推"
            />
          </label>
          <label>
            最低月薪（k）
            <input
              type="number"
              min="0"
              value={draft.salaryMin ?? ""}
              onChange={(event) =>
                update("salaryMin", event.target.value ? Number(event.target.value) : null)
              }
            />
          </label>
          <label>
            最高月薪（k）
            <input
              type="number"
              min="0"
              value={draft.salaryMax ?? ""}
              onChange={(event) =>
                update("salaryMax", event.target.value ? Number(event.target.value) : null)
              }
            />
          </label>
          <label>
            下一步行动
            <input
              value={draft.nextStep}
              onChange={(event) => update("nextStep", event.target.value)}
              placeholder="例如：准备技术二面"
            />
          </label>
          <label>
            提醒时间
            <input
              type="datetime-local"
              value={draft.nextStepAt ?? ""}
              onChange={(event) => update("nextStepAt", event.target.value || null)}
            />
          </label>
          <label className="full">
            岗位描述
            <textarea
              rows={4}
              value={draft.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="粘贴岗位要求，用于匹配分析"
            />
          </label>
        </div>
        {error && <p className="form-error">{error}</p>}
        <footer>
          {onDelete && (
            <button
              type="button"
              className="danger-button"
              onClick={() => {
                if (window.confirm("确认删除这个职位吗？")) onDelete();
              }}
            >
              <Icon name="trash" />
              删除
            </button>
          )}
          <span />
          <button type="button" className="secondary" onClick={onClose}>
            取消
          </button>
          <button className="primary" disabled={saving}>
            {saving ? "保存中…" : "保存职位"}
          </button>
        </footer>
      </form>
    </div>
  );
}

export default function App() {
  const [authState, setAuthState] = useState<"checking" | "guest" | "ready">(
    "checking"
  );
  const [userName, setUserName] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    total: 0,
    active: 0,
    interviews: 0,
    offers: 0,
    interviewRate: 0,
    offerRate: 0
  });
  const [view, setView] = useState<"dashboard" | "jobs" | "analyzer">(
    "dashboard"
  );
  const [modal, setModal] = useState<{ open: boolean; job: Job | null }>({
    open: false,
    job: null
  });
  const [loading, setLoading] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [{ jobs: nextJobs }, { analytics: nextAnalytics }] =
        await Promise.all([api.jobs(), api.analytics()]);
      setJobs(nextJobs);
      setAnalytics(nextAnalytics);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    api
      .me()
      .then(({ user }) => {
        setUserName(user.name);
        setAuthState("ready");
        return loadData();
      })
      .catch(() => setAuthState("guest"));
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 11 ? "早上好" : hour < 18 ? "下午好" : "晚上好";
  }, []);

  if (authState === "checking") {
    return (
      <div className="app-loading">
        <Logo />
        <span />
      </div>
    );
  }

  if (authState === "guest") {
    return (
      <Login
        onLogin={(name) => {
          setUserName(name);
          setAuthState("ready");
          loadData();
        }}
      />
    );
  }

  const title =
    view === "dashboard" ? `${greeting}，${userName}` : view === "jobs" ? "全部机会" : "岗位匹配分析";
  const subtitle =
    view === "dashboard"
      ? "这是你今天的求职进展，继续保持节奏。"
      : view === "jobs"
        ? "集中查看、筛选和维护所有求职机会。"
        : "用岗位要求校准简历表达，把经验变成证据。";

  async function saveJob(draft: JobDraft) {
    if (modal.job) {
      await api.updateJob(modal.job.id, draft);
    } else {
      await api.createJob(draft);
    }
    setModal({ open: false, job: null });
    await loadData();
  }

  async function deleteJob() {
    if (!modal.job) return;
    await api.deleteJob(modal.job.id);
    setModal({ open: false, job: null });
    await loadData();
  }

  async function moveJob(job: Job, status: JobStatus) {
    setJobs((current) =>
      current.map((item) => (item.id === job.id ? { ...item, status } : item))
    );
    try {
      await api.updateJob(job.id, { status });
      await loadData();
    } catch {
      await loadData();
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo />
        <nav>
          <button
            className={view === "dashboard" ? "active" : ""}
            onClick={() => setView("dashboard")}
          >
            <Icon name="grid" />
            总览
          </button>
          <button
            className={view === "jobs" ? "active" : ""}
            onClick={() => setView("jobs")}
          >
            <Icon name="briefcase" />
            全部机会
            <small>{jobs.length}</small>
          </button>
          <button
            className={view === "analyzer" ? "active" : ""}
            onClick={() => setView("analyzer")}
          >
            <Icon name="sparkles" />
            匹配分析
          </button>
        </nav>
        <div className="sidebar-tip">
          <span>
            <Icon name="sparkles" />
          </span>
          <strong>让进展可见</strong>
          <p>每周复盘一次数据，找到真正有效的求职渠道。</p>
        </div>
        <div className="profile">
          <span>LM</span>
          <div>
            <strong>{userName}</strong>
            <small>全栈开发者</small>
          </div>
          <button
            aria-label="退出登录"
            onClick={async () => {
              await api.logout();
              setAuthState("guest");
            }}
          >
            <Icon name="logout" />
          </button>
        </div>
      </aside>
      <main className="workspace">
        <header className="topbar">
          <div>
            <span className="mobile-mark"><Logo compact /></span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="top-actions">
            <span className="today">
              <Icon name="calendar" />
              {new Date().toLocaleDateString("zh-CN", {
                month: "long",
                day: "numeric",
                weekday: "short"
              })}
            </span>
            <button
              className="primary"
              onClick={() => setModal({ open: true, job: null })}
            >
              <Icon name="plus" />
              新增机会
            </button>
          </div>
        </header>
        <div className={`content ${loading ? "is-loading" : ""}`}>
          {view === "dashboard" && (
            <Dashboard
              jobs={jobs}
              analytics={analytics}
              onEdit={(job) => setModal({ open: true, job })}
              onMove={moveJob}
            />
          )}
          {view === "jobs" && (
            <JobsView
              jobs={jobs}
              onEdit={(job) => setModal({ open: true, job })}
            />
          )}
          {view === "analyzer" && <Analyzer jobs={jobs} />}
        </div>
      </main>
      {modal.open && (
        <JobModal
          job={modal.job}
          onClose={() => setModal({ open: false, job: null })}
          onSave={saveJob}
          onDelete={modal.job ? deleteJob : null}
        />
      )}
    </div>
  );
}
