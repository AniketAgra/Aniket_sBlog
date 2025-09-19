export default function About(){
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
            <div className="max-w-5xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-6xl font-extrabold">About Me</h1>
                    <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
                        A passionate software engineer with a focus on creating innovative solutions and a love for continuous learning.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white/5 backdrop-blur rounded-2xl p-6 md:p-8 shadow-xl border border-white/10 flex flex-col md:flex-row gap-6 md:gap-8">
                    <div className="md:w-40 md:h-40 w-28 h-28 shrink-0 rounded-full overflow-hidden ring-2 ring-purple-400/50 mx-auto md:mx-0">
                        <img
                            src="https://avatars.githubusercontent.com/u/9919?s=200&v=4"
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl md:text-3xl font-bold">Sophia Carter</h2>
                        <p className="text-purple-400 font-medium">Software Engineer</p>
                        <p className="text-sm text-gray-300 mt-1">Based in San Francisco, CA</p>
                        <p className="text-gray-200 mt-4 leading-relaxed">
                            I'm a software engineer with over 5 years of experience in developing and implementing scalable and efficient software
                            solutions. My expertise lies in full-stack development, with a strong focus on front-end technologies and user experience.
                            I'm passionate about creating innovative products that solve real-world problems and continuously improve my skills through
                            learning and collaboration.
                        </p>
                    </div>
                </div>

                {/* Timeline */}
                <div className="mt-14">
                    <h3 className="text-3xl font-bold text-center mb-10">My Journey</h3>
                    <div className="relative max-w-3xl mx-auto">
                        {/* vertical line */}
                        <div className="absolute left-1/2 -translate-x-1/2 h-full w-1 bg-purple-600/40 rounded"></div>

                        <ul className="space-y-10">
                            {[
                                { title: 'Software Engineer at Innovatech Solutions', time: '2020 - Present', icon: '💼' },
                                { title: "Master's in Computer Science", time: '2018 - 2020', icon: '🎓' },
                                { title: "Bachelor's in Computer Science", time: '2014 - 2018', icon: '🎓' },
                                { title: 'Freelance Web Developer', time: '2016 - 2018', icon: '💻' },
                            ].map((item, idx) => (
                                <li key={idx} className="relative">
                                    <div className="flex items-center gap-4 md:gap-8">
                                        <div className="hidden md:block w-1/2 text-right text-gray-300">{item.time}</div>
                                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-lg border border-white/20">
                                            <span className="text-lg">{item.icon}</span>
                                        </div>
                                        <div className="w-1/2 text-left text-gray-200 font-medium">{item.title}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-12 flex justify-center">
                    <a
                        href="#"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition text-white shadow-lg"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-16.5 0V7.5A2.25 2.25 0 016.75 5.25h10.5A2.25 2.25 0 0119.5 7.5v9m-16.5 0h16.5M3 16.5l4.5-4.5m0 0l3 3 6-6 3 3" />
                        </svg>
                        Download Resume
                    </a>
                </div>
            </div>
        </div>
    );
}
