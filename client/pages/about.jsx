import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { SignInPrompt } from "../src/components";

export default function About() {
  const { currentUser } = useSelector(s => s.user);
  const [downloading, setDownloading] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  // Lead form no longer used; resume download requires login and uses user model data

  // Set the document title for SEO and accessibility
  useEffect(() => {
    const prev = document.title;
    document.title = "About • TechBlog";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200 min-h-screen relative">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute bottom-0 left-0 h-1/2 w-full bg-gradient-to-t from-primary/20 to-transparent"></div>
        <div className="absolute top-0 right-0 h-1/2 w-full bg-gradient-to-b from-blue-500/10 to-transparent"></div>
      </div>

      <div className="relative z-10 flex flex-col">

        {/* Main Content */}
        <main className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20 space-y-12 md:space-y-16">
          {/* Intro */}
          <section className="flex flex-col items-center text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
              About Me
            </h1>
            <p className="mt-3 md:mt-4 max-w-2xl text-lg text-gray-500 dark:text-gray-400">
              A passionate software engineer with a focus on creating innovative
              solutions and a love for continuous learning.
            </p>
          </section>

          {/* Profile Card */}
          <section className="rounded-2xl border border-white/10 p-6 md:p-8 shadow-xl glassmorphism">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <div className="flex justify-center md:justify-start">
                <img
                  alt="Sophia Carter"
                  className="h-40 w-40 md:h-48 md:w-48 rounded-full object-cover shadow-lg"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuACdb-iBJkuD5HtIq21pwdTcn449CSStmlz9JzGfhud-ptEfs7FzLhKgva3tJ2RnQC0SPiSqVi1n6XwB8K8jqiWqA7u-iaPv8KIWkz_bkHFBQTER0v-L3V5n7hUkiqDgxcAMIeBlFQz4uxrlMq58gdhkoaipaHD6LF7zz2OVHdSzgUHrt-TZ2EotaZu-_yGtqu4OO9f2OH42AbtDAUEBT-P5Xppwhbt4jvGRkZSXhw0HMGDYGYbOq7bvtr0kLNuUSmV0Kn2HDP8yps"
                />
              </div>
              <div className="col-span-2 space-y-3 md:space-y-4 text-center md:text-left">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    Sophia Carter
                  </h2>
                  <p className="mt-1 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-xl font-semibold text-transparent">
                    Software Engineer
                  </p>
                  <p className="mt-1 text-base text-gray-500 dark:text-gray-400">
                    Based in San Francisco, CA
                  </p>
                </div>
                <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
                  I&#39;m a software engineer with over 5 years of experience in
                  developing and implementing scalable and efficient software
                  solutions. My expertise lies in full-stack development, with a
                  strong focus on front-end technologies and user experience. I&#39;m
                  passionate about creating innovative products that solve
                  real-world problems and continuously improve my skills through
                  learning and collaboration.
                </p>
              </div>
            </div>
          </section>

          {/* Timeline */}
          <section>
            <h2 className="mb-6 md:mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white">
              My Journey
            </h2>
            <div className="relative">
              <div className="absolute left-1/2 h-full w-0.5 -translate-x-1/2 bg-primary/20"></div>

              <div className="space-y-10 md:space-y-14">
              {[
                {
                  role: "Software Engineer at Innovatech Solutions",
                  period: "2020 - Present",
                  icon: "work",
                },
                {
                  role: "Master's in Computer Science",
                  period: "2018 - 2020",
                  icon: "school",
                },
                {
                  role: "Bachelor's in Computer Science",
                  period: "2014 - 2018",
                  icon: "school",
                },
                {
                  role: "Freelance Web Developer",
                  period: "2016 - 2018",
                  icon: "code",
                },
              ].map((item, idx) => (
                <div key={idx} className="relative flex items-center min-h-[96px] md:min-h-[112px]">
                  {/* Left side for md+ */}
                  {idx % 2 === 0 ? (
                    <div className="hidden md:flex w-1/2 justify-end pr-8 text-right">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {item.role}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.period}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full pr-6 text-right md:w-1/2 md:pr-8">
                      <div className="rounded-lg border border-white/10 p-5 shadow-lg glassmorphism md:hidden">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {item.role}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.period}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Icon */}
                  <div className="absolute left-1/2 -translate-x-1/2">
                    <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-background-light dark:bg-background-dark">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                        <span className="material-symbols-outlined">
                          {item.icon}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side for md+ */}
                  {idx % 2 === 0 ? (
                    <div className="w-full pl-6 md:w-1/2 md:pl-8">
                      <div className="rounded-lg border border-white/10 p-5 shadow-lg glassmorphism md:hidden">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {item.role}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.period}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="hidden w-1/2 pl-8 md:flex">
                      <div>
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
              ))}
              </div>
            </div>
          </section>

          {/* Download Resume */}
          <section className="text-center">
            <button
              onClick={async () => {
                if (!currentUser) {
                  setShowSignInPrompt(true);
                  return;
                }
                try {
                  setDownloading(true);
                  const res = await fetch('/api/resume/download', {
                    method: 'GET',
                    credentials: 'include',
                  });
                  if (res.status === 401) {
                    setShowSignInPrompt(true);
                    return;
                  }
                  if (!res.ok) {
                    const msg = (await res.json().catch(() => ({})))?.error?.message || 'Failed to download resume';
                    alert(msg);
                    return;
                  }
                  const blob = await res.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'resume.pdf';
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  window.URL.revokeObjectURL(url);
                } catch (e) {
                  alert('Failed to download resume');
                } finally {
                  setDownloading(false);
                }
              }}
              disabled={downloading}
              className="inline-flex min-w-[84px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark disabled:opacity-60"
            >
              <span className="truncate">{downloading ? 'Downloading...' : 'Download Resume'}</span>
            </button>
            {showSignInPrompt && !currentUser && (
              <div className="mt-4">
                <SignInPrompt onClose={() => setShowSignInPrompt(false)} message="Please sign in to download your resume." />
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
