import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { SignInPrompt } from "../src/components";
import styles from "./about.module.css";
import {
  MdWork,
  MdSchool,
  MdCode,
  MdFileDownload,
  MdLightbulb,
} from "react-icons/md";

export default function About() {
  const { currentUser } = useSelector((s) => s.user);
  const [downloading, setDownloading] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [avatar, setAvatar] = useState(
    "https://avatars.githubusercontent.com/u/116921628?v=4"
  );

  // Set page title for SEO and accessibility
  useEffect(() => {
    const prev = document.title;
    document.title = "About • Aniket Agrawal";
    return () => {
      document.title = prev;
    };
  }, []);

  // Fetch latest GitHub profile image dynamically
  useEffect(() => {
    fetch("https://api.github.com/users/aniketagra")
      .then((res) => res.json())
      .then((data) => {
        if (data.avatar_url) setAvatar(data.avatar_url);
      })
      .catch(() => {
        // fallback remains default
      });
  }, []);

  // Timeline data
  const timelineItems = useMemo(
    () => [
      {
        role: "Software Engineer Intern at Bluestock Fintech",
        period: "May 2024 - Aug 2024",
        Icon: MdWork,
      },
      {
        role: "Project: Family First — Scalable Real-time Family Network App",
        period: "Aug 2024 - Dec 2024",
        Icon: MdLightbulb,
      },
      {
        role: "Runner-up • Web3Connect Buildathon (Bhopal DAO)",
        period: "Oct 2024",
        Icon: MdWork,
      },
      {
        role: "Reimagine Hackathon (Team Lead - Frontend Redesign Challenge)",
        period: "Sept 2024",
        Icon: MdWork,
      },
      {
        role: "Project: Lexora — Legal Support Platform for Undertrial Prisoners",
        period: "Jul 2024 - Present",
        Icon: MdLightbulb,
      },
      {
        role: "Web Development Mentorship (Weboin x Teachnook)",
        period: "Sept 2023 - Oct 2023",
        Icon: MdSchool,
      },
      {
        role: "B.Tech in Computer Science and Engineering",
        period: "2022 - 2026 (LNCT Group of Colleges, Bhopal)",
        Icon: MdSchool,
      },
    ],
    []
  );

  // Resume download handler
  const handleResumeDownload = async () => {
    if (!currentUser) {
      setShowSignInPrompt(true);
      return;
    }

    try {
      setDownloading(true);
      const res = await fetch("/api/resume/download", {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401) {
        setShowSignInPrompt(true);
        return;
      }

      if (!res.ok) {
        const msg =
          (await res.json().catch(() => ({})))?.error?.message ||
          "Failed to download resume";
        alert(msg);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Aniket_Agrawal_Resume.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download resume");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className={`bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200 ${styles.page}`}
    >
      {/* Background gradients */}
      <div className={`${styles.bgWrap} ${styles.bgBlobs}`} />

      <div className={`flex flex-col ${styles.content}`}>
        <main className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20 space-y-12 md:space-y-16">
          {/* Intro Section */}
          <section className="flex flex-col items-center text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
              About Me
            </h1>
            <p className="mt-3 md:mt-4 max-w-2xl text-lg text-gray-500 dark:text-gray-400 mb-8">
              Passionate about building impactful digital experiences — I love
              combining creativity, logic, and innovation to solve real-world
              problems through code.
            </p>
          </section>

          {/* Profile Card */}
          <section className={`p-6 md:p-8 ${styles.glass}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <div className="flex justify-center md:justify-start">
                <img
                  alt="Aniket Agrawal"
                  className="h-40 w-40 md:h-48 md:w-48 rounded-full object-cover shadow-lg"
                  src={avatar}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://avatars.githubusercontent.com/u/116921628?v=4";
                  }}
                />
              </div>

              <div className="col-span-2 space-y-3 md:space-y-4 text-left md:text-left">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    Aniket Agrawal
                  </h2>
                  <p className="mt-1 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-xl font-semibold text-transparent">
                    Full Stack Developer • Cybersecurity Enthusiast
                  </p>
                  <p className="mt-1 text-base text-gray-500 dark:text-gray-400">
                    Based in Bhopal, India
                  </p>
                </div>

                <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
                  I&apos;m a <b>B.Tech CSE</b> student (Batch 2026) with hands-on
                  experience in full-stack development, system design, and
                  cybersecurity. I&apos;ve worked on impactful projects like{" "}
                  <b>Family First</b> and <b>Lexora</b>, contributing to
                  scalable backend architectures, efficient APIs, and smooth
                  user interfaces.
                  <br />
                  I&apos;ve also explored distributed systems (Kafka, microservices,
                  load balancers) during my internship at Bluestock. I&apos;m driven
                  by curiosity, problem-solving, and the thrill of learning new
                  technologies.
                </p>
              </div>
            </div>
          </section>

          {/* Timeline */}
          <section>
            <h2 className="mt-7 mb-6 md:mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white">
              My Journey
            </h2>
            <div className={`relative ${styles.timeline}`}>
              <div className={styles.timelineLine}></div>

              <div className="space-y-10 md:space-y-14">
                {timelineItems.map((item, idx) => (
                  <div key={idx} className="relative mb-7 md:mb-10">
                    {/* Mobile layout */}
                    <div className="pl-16 pr-2 md:hidden">
                      <div
                        className={`rounded-lg border border-white/10 p-5 shadow-lg ${styles.glass}`}
                      >
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {item.role}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.period}
                        </p>
                      </div>
                    </div>

                    {/* Timeline icon */}
                    <div className={`${styles.iconPos}`}>
                      <div
                        className={`z-10 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-background-light dark:bg-background-dark ${styles.iconHalo}`}
                      >
                        <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-primary text-white">
                          <item.Icon size={20} />
                        </div>
                      </div>
                    </div>

                    {/* Desktop alternating layout */}
                    <div className="hidden md:flex items-center min-h-[112px]">
                      {idx % 2 === 0 ? (
                        <div className="hidden md:flex w-1/2 justify-end pr-4 lg:pr-6 text-right">
                          <div
                            className={`border border-white/10 shadow-lg ${styles.glass} ${styles.timelineCard} ${styles.timelineCardLeft}`}
                          >
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {item.role}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {item.period}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-1/2" />
                      )}

                      {idx % 2 === 0 ? (
                        <div className="w-1/2" />
                      ) : (
                        <div className="hidden w-1/2 pl-4 lg:pl-6 md:flex">
                          <div
                            className={`border border-white/10 shadow-lg ${styles.glass} ${styles.timelineCard} ${styles.timelineCardRight}`}
                          >
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {item.role}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {item.period}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Resume Download */}
          <section className={`text-center ${styles.downloadWrap}`}>
            <button
              onClick={handleResumeDownload}
              disabled={downloading}
              className={`inline-flex min-w-[84px] items-center justify-center gap-2 rounded-lg px-7 py-3.5 text-base font-bold shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 dark:focus:ring-offset-background-dark disabled:opacity-60 ${styles.downloadBtn}`}
            >
              <MdFileDownload size={18} />
              <span className="truncate">
                {downloading ? "Downloading…" : "Download Resume"}
              </span>
            </button>

            {showSignInPrompt && !currentUser && (
              <div className="mt-4">
                <SignInPrompt
                  onClose={() => setShowSignInPrompt(false)}
                  message="Please sign in to download your resume."
                />
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
