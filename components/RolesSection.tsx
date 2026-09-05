"use client"

import { useEffect, useRef, useState } from "react"
import type { LucideIcon } from "lucide-react"
import Image from "next/image"
import {
    User,
    UserPlus,
    Upload,
    Send,
    DollarSign,
    Check,
    Loader2,
    Smartphone,
    Lock,
    CircleCheck,
    Search,
    Mic,
    X,
    Wifi,
    Signal,
    BatteryFull,
    Sparkles,
    ScanSearch,
    ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

type TeacherStory = "register" | "upload" | "share" | "earn"

type Step = {
    title: string
    detail: string
    Icon: LucideIcon
    wash: string
    ink?: string
    story?: TeacherStory
}

const TEACHER_STEPS: Step[] = [
    {
        title: "Register",
        detail: "Verify once. Then you are in.",
        Icon: User,
        wash: "bg-fold-cash",
        story: "register",
    },
    {
        title: "Upload",
        detail: "Schemes, plans, papers, guides.",
        Icon: Upload,
        wash: "bg-[var(--color-fold-grey)]",
        story: "upload",
    },
    {
        title: "Share",
        detail: "Parents and students find your work.",
        Icon: Send,
        wash: "bg-[var(--color-fold-blue)]",
        story: "share",
    },
    {
        title: "Get paid",
        detail: "M-Pesa when someone buys.",
        Icon: DollarSign,
        wash: "bg-fold-thumb",
        story: "earn",
    },
]

const PARENT_PROGRESS = [
    { title: "Pay", id: "pay" },
    { title: "Processing", id: "processing" },
    { title: "Get materials", id: "done" },
] as const

const PROGRESS_STEP_MS = 2000
const PROGRESS_REST_MS = 2000
const PROGRESS_FADE_MS = 400

function formatProgressTime(date: Date) {
    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(date)
}

const STUDENT_QUERY = "is somovibe real?"
const STUDENT_OVERVIEW =
    "Yes, Somovibe is a real, legitimate digital platform. It operates in Kenya as an online marketplace for the Competency Based Curriculum (CBC). Teachers upload schemes, lesson plans, and notes, keep 75% commission, and get paid on M-Pesa. Students and parents browse those materials and buy with an M-Pesa prompt."
const STUDENT_OVERVIEW_MARK =
    "Yes, Somovibe is a real, legitimate digital platform."
const SOMO_LINKS = [
    {
        crumb: "somovibe.com",
        title: "Somovibe | CBC Learning Platform — Learn, Teach & Earn",
        detail: "Quality CBC learning materials from verified teachers. Students access premium notes and past papers. Teachers earn 75% commission.",
    },
    {
        crumb: "somovibe.com › about",
        title: "About Somovibe | Kenya's CBC Learning Platform",
        detail: "Learn about Somovibe, Kenya's CBC learning platform connecting students with verified teachers and quality educational materials.",
    },
] as const
const QUERY_CHAR_MS = 120
const QUERY_PAUSE_MS = 1000
const OVERVIEW_CHAR_MS = 52
const SEE_MORE_PAUSE_MS = 700
const OVERVIEW_HOLD_MS = 4000

function formatPhoneClock(date: Date) {
    return new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
    }).format(date)
}

const PAY_STEPS = [
    {
        title: "Prompt",
        hint: "M-Pesa lands on your phone.",
        Icon: Smartphone,
        wash: "bg-fold-blue",
    },
    {
        title: "Pin",
        hint: "You confirm. That’s it.",
        Icon: Lock,
        wash: "bg-fold-thumb",
    },
    {
        title: "Success",
        hint: "The material is yours.",
        Icon: CircleCheck,
        wash: "bg-fold-cash",
    },
] as const

const STEP_DWELL_MS = 2500

function IconDisc({
    Icon,
    wash,
    ink = "text-surface",
    story,
    playing = false,
}: {
    Icon: LucideIcon
    wash: string
    ink?: string
    story?: TeacherStory
    playing?: boolean
}) {
    const menu = Boolean(story)
    const weight = menu ? 2.25 : 4

    return (
        <span
            className={cn(
                "role-icon-disc flex shrink-0 items-center justify-center rounded-full",
                menu ? "size-space-7" : "size-[calc(var(--space-7)*0.7*1.1)]",
                story === "share" ? "overflow-visible" : "overflow-hidden",
                ink,
                wash
            )}
        >
            <span
                className={cn(
                    "role-icon-stage",
                    menu && "role-icon-stage-lg",
                    story && `role-story-${story}`,
                    playing && "role-icon-playing"
                )}
            >
                {story === "register" ? (
                    playing ? (
                        <UserPlus
                            className="role-icon-pop"
                            strokeWidth={weight}
                            aria-hidden="true"
                        />
                    ) : (
                        <User strokeWidth={weight} aria-hidden="true" />
                    )
                ) : story === "upload" ? (
                    <Upload
                        className="role-icon-drop"
                        strokeWidth={weight}
                        aria-hidden="true"
                    />
                ) : story === "share" ? (
                    <Send
                        className="role-icon-send"
                        strokeWidth={weight}
                        fill="currentColor"
                        aria-hidden="true"
                    />
                ) : story === "earn" ? (
                    <DollarSign
                        className="role-icon-shake"
                        strokeWidth={weight}
                        fill="currentColor"
                        aria-hidden="true"
                    />
                ) : (
                    <Icon strokeWidth={weight} aria-hidden="true" />
                )}
            </span>
        </span>
    )
}

function StepRow({
    step,
    titleClass,
    detailClass,
    shell,
    playing = false,
    current = false,
}: {
    step: Step
    titleClass: string
    detailClass: string
    shell: string
    playing?: boolean
    current?: boolean
}) {
    return (
        <div
            className={cn(
                "role-step-shell rounded-soft px-space-3 py-space-1",
                shell,
                current && "role-step-live"
            )}
            aria-current={current ? "step" : undefined}
        >
            <div className="flex items-center gap-space-3">
                <IconDisc
                    Icon={step.Icon}
                    wash={step.wash}
                    ink={step.ink}
                    story={step.story}
                    playing={playing}
                />
                <p
                    className={cn(
                        "min-w-0 font-sans text-body font-bold",
                        step.story ? "role-step-title" : titleClass
                    )}
                >
                    {step.title}
                </p>
            </div>
            <p
                className={cn(
                    step.story
                        ? "role-step-detail pl-[calc(var(--space-7)+var(--space-3))] font-sans text-caption"
                        : "pl-[calc(var(--space-7)*0.7*1.1+var(--space-3))] font-sans text-caption",
                    !step.story && detailClass
                )}
            >
                {step.detail}
            </p>
        </div>
    )
}

function TeacherExtract() {
    const rootRef = useRef<HTMLDivElement>(null)
    const [active, setActive] = useState(0)
    const [inView, setInView] = useState(true)
    const [reduced, setReduced] = useState(false)

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        const sync = () => setReduced(mq.matches)
        sync()
        mq.addEventListener("change", sync)
        return () => mq.removeEventListener("change", sync)
    }, [])

    useEffect(() => {
        const node = rootRef.current
        if (!node) return
        const io = new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            { threshold: 0 }
        )
        io.observe(node)
        return () => io.disconnect()
    }, [])

    useEffect(() => {
        if (!inView || reduced) return
        const id = window.setInterval(() => {
            setActive((current) => (current + 1) % TEACHER_STEPS.length)
        }, STEP_DWELL_MS)
        return () => window.clearInterval(id)
    }, [inView, reduced])

    return (
        <div
            ref={rootRef}
            className="role-extract flex w-full flex-col justify-center gap-[2px] rounded-tl-[30px] rounded-tr-soft rounded-br-soft rounded-bl-[30px] bg-accent-hover p-[calc(var(--space-3)*1.2)]"
        >
            {TEACHER_STEPS.map((step, i) => {
                const current = i === active
                return (
                    <StepRow
                        key={step.title}
                        step={step}
                        current={current}
                        playing={current && !reduced}
                        titleClass="text-surface"
                        detailClass="text-surface/75"
                        shell=""
                    />
                )
            })}
        </div>
    )
}

function ParentExtract() {
    const rootRef = useRef<HTMLDivElement>(null)
    const [stage, setStage] = useState(0)
    const [inView, setInView] = useState(true)
    const [reduced, setReduced] = useState(false)
    const [stamps, setStamps] = useState({ pay: "", done: "" })

    useEffect(() => {
        if (stage !== 0) return
        const pay = new Date()
        const done = new Date(pay.getTime() + 60_000)
        setStamps({
            pay: formatProgressTime(pay),
            done: formatProgressTime(done),
        })
    }, [stage])

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        const sync = () => setReduced(mq.matches)
        sync()
        mq.addEventListener("change", sync)
        return () => mq.removeEventListener("change", sync)
    }, [])

    useEffect(() => {
        const node = rootRef.current
        if (!node) return
        const io = new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            { threshold: 0 }
        )
        io.observe(node)
        return () => io.disconnect()
    }, [])

    useEffect(() => {
        if (reduced) {
            setStage(3)
            return
        }
        if (!inView) return
        const delay =
            stage === 0
                ? PROGRESS_REST_MS
                : stage === 4
                  ? PROGRESS_FADE_MS
                  : PROGRESS_STEP_MS
        const id = window.setTimeout(() => {
            setStage((current) => (current >= 4 ? 0 : current + 1))
        }, delay)
        return () => window.clearTimeout(id)
    }, [stage, inView, reduced])

    const live = stage >= 1 && stage <= 3
    const fading = stage === 4
    const filled = live || fading
    const showPayStamp = live
    const showDoneStamp = stage === 3

    return (
        <div className="flex w-full flex-col items-stretch gap-space-5">
            <div
                ref={rootRef}
                className={cn(
                    "role-extract w-full rounded-soft bg-surface p-[calc(var(--space-4)*1.2)]",
                    stage === 0 && "role-progress-ended",
                    fading && "role-progress-fade"
                )}
            >
                <ol
                    className="role-progress-list"
                    data-fill={
                        fading || stage >= 3
                            ? "full"
                            : stage >= 2
                              ? "mid"
                              : "none"
                    }
                >
                    <span className="role-progress-rail" aria-hidden="true">
                        <span className="role-progress-rail-fill" />
                    </span>
                    {PARENT_PROGRESS.map((step, i) => {
                        const last = i === PARENT_PROGRESS.length - 1
                        const payOn = filled && (stage >= 1 || fading)
                        const processingOn = filled && (stage >= 2 || fading)
                        const materialsOn = filled && (stage >= 3 || fading)
                        const processingActive = stage === 2 && !fading
                        const on =
                            (i === 0 && payOn) ||
                            (i === 1 && processingOn) ||
                            (i === 2 && materialsOn)
                        const stamp =
                            step.id === "pay"
                                ? stamps.pay
                                : step.id === "done"
                                  ? stamps.done
                                  : ""
                        const stampOn =
                            (step.id === "pay" && showPayStamp) ||
                            (step.id === "done" && showDoneStamp)

                        return (
                            <li key={step.title} className="role-progress-row">
                                <span
                                    className={cn(
                                        "role-progress-node",
                                        on && "role-progress-node-on"
                                    )}
                                >
                                    {processingActive && i === 1 ? (
                                        <Loader2
                                            className="role-progress-load size-space-3"
                                            strokeWidth={2.5}
                                            aria-hidden="true"
                                        />
                                    ) : on ? (
                                        <Check
                                            className="size-space-3"
                                            strokeWidth={3}
                                            aria-hidden="true"
                                        />
                                    ) : null}
                                </span>
                                <div
                                    className={cn(
                                        "role-progress-copy",
                                        !last && "role-progress-copy-gap",
                                        on
                                            ? "role-progress-label-on"
                                            : "role-progress-label"
                                    )}
                                >
                                    <p className="font-sans text-body font-bold">
                                        {step.title}
                                    </p>
                                    {stamp ? (
                                        <p
                                            className={cn(
                                                "role-progress-stamp shrink-0 font-sans font-bold text-text-muted",
                                                stampOn && "role-progress-stamp-on"
                                            )}
                                        >
                                            {stamp}
                                        </p>
                                    ) : null}
                                </div>
                            </li>
                        )
                    })}
                </ol>
            </div>
            <RoleCaption
                title="Fast"
                lede="The process is as fast as blinking an eye."
                compact
            />
            <PayProcedure />
            <RoleCaption
                title="Parents"
                lede="Pay, processing, get materials."
            />
        </div>
    )
}

function RoleCaption({
    title,
    lede,
    compact = false,
}: {
    title: string
    lede: string
    compact?: boolean
}) {
    return (
        <div>
            <h3
                className={cn(
                    "font-sans font-bold text-text-primary",
                    compact ? "text-body" : "text-title"
                )}
            >
                {title}
            </h3>
            <p className="mt-space-2 font-sans text-body text-text-muted">{lede}</p>
        </div>
    )
}

function PayProcedure() {
    const rootRef = useRef<HTMLDivElement>(null)
    const [index, setIndex] = useState(0)
    const [inView, setInView] = useState(true)
    const [reduced, setReduced] = useState(false)

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        const sync = () => setReduced(mq.matches)
        sync()
        mq.addEventListener("change", sync)
        return () => mq.removeEventListener("change", sync)
    }, [])

    useEffect(() => {
        const node = rootRef.current
        if (!node) return
        const io = new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            { threshold: 0 }
        )
        io.observe(node)
        return () => io.disconnect()
    }, [])

    useEffect(() => {
        if (!inView || reduced) return
        const id = window.setInterval(() => {
            setIndex((current) => (current + 1) % PAY_STEPS.length)
        }, PROGRESS_STEP_MS)
        return () => window.clearInterval(id)
    }, [inView, reduced])

    const current = PAY_STEPS[index]

    return (
        <div
            ref={rootRef}
            className="role-extract role-pay-card w-full rounded-soft bg-surface p-[calc(var(--space-4)*1.2)]"
        >
            <div key={current.title} className="role-pay-copy">
                <p className="font-sans text-body font-bold text-text-primary">
                    {current.title}
                </p>
                <p className="mt-space-1 font-sans text-caption text-text-muted">
                    {current.hint}
                </p>
            </div>
            <div className="role-pay-pill" aria-hidden="true">
                {PAY_STEPS.map((step, i) => {
                    const Icon = step.Icon
                    return (
                        <span key={step.title} className="role-pay-slot">
                            <span
                                className={cn(
                                    "role-pay-dot",
                                    step.wash,
                                    i === index && "role-pay-dot-on"
                                )}
                            >
                                <Icon
                                    className="size-space-3"
                                    strokeWidth={2.25}
                                />
                            </span>
                        </span>
                    )
                })}
            </div>
        </div>
    )
}

function StudentExtract() {
    const rootRef = useRef<HTMLDivElement>(null)
    const [queryChars, setQueryChars] = useState(0)
    const [aiChars, setAiChars] = useState(0)
    const [searched, setSearched] = useState(false)
    const [linked, setLinked] = useState(false)
    const [seeMore, setSeeMore] = useState(false)
    const [inView, setInView] = useState(true)
    const scrollRef = useRef<HTMLDivElement>(null)
    const [reduced, setReduced] = useState(false)
    const [clock, setClock] = useState("")

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        const sync = () => setReduced(mq.matches)
        sync()
        mq.addEventListener("change", sync)
        return () => mq.removeEventListener("change", sync)
    }, [])

    useEffect(() => {
        const node = rootRef.current
        if (!node) return
        const io = new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            { threshold: 0 }
        )
        io.observe(node)
        return () => io.disconnect()
    }, [])

    useEffect(() => {
        const tick = () => setClock(formatPhoneClock(new Date()))
        tick()
        const id = window.setInterval(tick, 15_000)
        return () => window.clearInterval(id)
    }, [])

    useEffect(() => {
        if (reduced) {
            setQueryChars(STUDENT_QUERY.length)
            setAiChars(STUDENT_OVERVIEW.length)
            setSearched(true)
            setSeeMore(true)
            setLinked(true)
            return
        }
        if (!inView) return
        if (queryChars < STUDENT_QUERY.length) {
            const id = window.setTimeout(
                () => setQueryChars((current) => current + 1),
                QUERY_CHAR_MS
            )
            return () => window.clearTimeout(id)
        }
        if (!searched) {
            const id = window.setTimeout(() => setSearched(true), QUERY_PAUSE_MS)
            return () => window.clearTimeout(id)
        }
        if (aiChars < STUDENT_OVERVIEW.length) {
            const id = window.setTimeout(
                () => setAiChars((current) => current + 1),
                OVERVIEW_CHAR_MS
            )
            return () => window.clearTimeout(id)
        }
        if (!seeMore) {
            setSeeMore(true)
            return
        }
        if (!linked) {
            const id = window.setTimeout(() => setLinked(true), SEE_MORE_PAUSE_MS)
            return () => window.clearTimeout(id)
        }
        const id = window.setTimeout(() => {
            setQueryChars(0)
            setAiChars(0)
            setSearched(false)
            setSeeMore(false)
            setLinked(false)
        }, OVERVIEW_HOLD_MS)
        return () => window.clearTimeout(id)
    }, [queryChars, aiChars, searched, seeMore, linked, inView, reduced])

    useEffect(() => {
        const node = scrollRef.current
        if (!node) return
        node.scrollTop = node.scrollHeight
    }, [aiChars, seeMore, linked])

    const typed = STUDENT_QUERY.slice(0, queryChars)
    const overview = STUDENT_OVERVIEW.slice(0, aiChars)
    const markLen = Math.min(aiChars, STUDENT_OVERVIEW_MARK.length)
    const generating = searched && aiChars < STUDENT_OVERVIEW.length

    return (
        <div ref={rootRef} className="relative w-full">
            <div className="role-phone-slot">
            <div
                className="role-phone"
                role="img"
                aria-label="Phone showing a Google search: is somovibe real?"
            >
                <div className="role-phone-screen">
                    <div className="role-phone-status" aria-hidden="true">
                        <span>{clock}</span>
                        <span className="role-phone-status-meta">
                            <Wifi strokeWidth={2.25} />
                            <Signal strokeWidth={2.25} />
                            <span>84%</span>
                            <BatteryFull strokeWidth={2.25} />
                        </span>
                    </div>
                    <div className="role-phone-search">
                        <p className="min-w-0 flex-1 truncate font-sans text-caption">
                            {typed}
                            {!searched ? (
                                <span
                                    className="role-phone-caret"
                                    aria-hidden="true"
                                />
                            ) : null}
                        </p>
                        <span className="role-phone-search-tools" aria-hidden="true">
                            {typed ? <X strokeWidth={2.25} className="size-space-3" /> : null}
                            <Mic strokeWidth={2.25} className="size-space-3" />
                            <ScanSearch strokeWidth={2.25} className="size-space-3" />
                            <Search
                                strokeWidth={2.25}
                                className="role-phone-search-go size-space-3"
                            />
                        </span>
                    </div>
                    {searched ? (
                        <>
                            <div className="role-phone-tabs" aria-hidden="true">
                                <span className="role-phone-tab role-phone-tab-on">
                                    All
                                </span>
                                <span className="role-phone-tab">Images</span>
                                <span className="role-phone-tab">News</span>
                            </div>
                            <div ref={scrollRef} className="role-phone-answer">
                                <p className="role-phone-ai-label font-sans text-caption font-bold">
                                    <Sparkles
                                        className="size-space-3"
                                        strokeWidth={2.25}
                                        aria-hidden="true"
                                    />
                                    AI Overview
                                </p>
                                {overview ? (
                                    <p className="mt-space-3 font-sans text-caption">
                                        {markLen > 0 ? (
                                            <mark className="role-phone-mark">
                                                {STUDENT_OVERVIEW_MARK.slice(
                                                    0,
                                                    markLen
                                                )}
                                            </mark>
                                        ) : null}
                                        {overview.slice(markLen)}
                                        {generating ? (
                                            <span
                                                className="role-phone-caret"
                                                aria-hidden="true"
                                            />
                                        ) : null}
                                    </p>
                                ) : null}
                                {seeMore ? (
                                    <p className="role-phone-more">
                                        See more
                                        <ChevronDown
                                            className="size-space-3"
                                            strokeWidth={2.25}
                                            aria-hidden="true"
                                        />
                                    </p>
                                ) : null}
                                {linked ? (
                                    <div className="role-phone-results">
                                        {SOMO_LINKS.map((link) => (
                                            <div
                                                key={link.crumb}
                                                className="role-phone-result"
                                            >
                                                <div className="flex items-center gap-space-2">
                                                    <Image
                                                        src="/somovibe-favicon.png"
                                                        alt=""
                                                        width={16}
                                                        height={16}
                                                        className="size-space-4 rounded-control"
                                                    />
                                                    <span className="truncate font-sans text-caption text-[var(--color-phone-dim)]">
                                                        {link.crumb}
                                                    </span>
                                                </div>
                                                <p className="role-phone-result-title mt-space-1 font-sans text-caption">
                                                    {link.title}
                                                </p>
                                                <p className="mt-space-1 font-sans text-caption text-[var(--color-phone-dim)]">
                                                    {link.detail}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        </>
                    ) : null}
                </div>
                <img
                    src="/mockups/pixel-8-hazel.svg"
                    alt=""
                    className="role-phone-frame"
                    draggable={false}
                />
            </div>
            </div>
        </div>
    )
}

export function RolesSection() {
    return (
        <section
            id="for-you"
            aria-labelledby="roles-heading"
            className="bg-surface px-space-4 py-space-8"
        >
            <div className="mx-auto flex max-w-[72rem] flex-col gap-space-6">
                <div className="mx-auto max-w-[36ch] text-center">
                    <h2
                        id="roles-heading"
                        className="font-sans text-title font-bold text-text-primary"
                    >
                        Teachers. Parents. Students.
                    </h2>
                    <p className="mt-space-3 font-sans text-body text-text-muted">
                        Three paths. Same materials.
                    </p>
                </div>

                <div className="mx-auto grid w-4/5 grid-cols-1 items-start gap-x-space-5 gap-y-space-6 nav:grid-cols-3">
                    <div className="flex flex-col gap-space-6">
                        <TeacherExtract />
                        <RoleCaption
                            title="Teachers"
                            lede="Register, upload, share, get paid."
                        />
                    </div>
                    <ParentExtract />
                    <StudentExtract />
                </div>
            </div>
        </section>
    )
}
