/**
 * Everything shown on the About Me page.
 * Edit this one file to make the site yours.
 */

export const PROFILE = {
  name: 'GARV JAIN',
  role: 'Engineering Student · Full-Stack & Embedded Developer',
  location: 'India',
  email: 'garvjain72005@gmail.com',
  photo: '', // Drop a URL or an imported image here; initials show otherwise.
  bio: "I build things that sit between hardware and the web — ESP32 nodes that talk to React dashboards, robots that follow lines, and the occasional allocator written just to understand what malloc is doing. ProjectVault is where I keep the videos that explain how each one works.",

  github: 'https://github.com/',
  linkedin: 'https://www.linkedin.com/',
  portfolio: 'https://example.com',
  resume: '', // Put your resume PDF in /public and point to it, e.g. '/resume.pdf'

  skills: [
    { group: 'Languages', items: ['JavaScript', 'C++', 'Python', 'TypeScript', 'SQL'] },
    { group: 'Frontend', items: ['React', 'Tailwind CSS', 'Vite', 'Framer Motion', 'Redux'] },
    { group: 'Backend', items: ['Node.js', 'Express', 'MongoDB', 'Firebase', 'REST APIs'] },
    { group: 'Embedded & IoT', items: ['Arduino', 'ESP32', 'MQTT', 'PID Control', 'I²C / SPI'] },
    { group: 'Tools', items: ['Git', 'Docker', 'Linux', 'Figma', 'Fusion 360'] },
  ],

  education: [
    {
      id: 'edu_1',
      degree: 'B.Tech, Computer Science & Engineering',
      institution: 'Your University',
      period: '2023 — 2027',
      detail: 'Coursework in data structures, operating systems, embedded systems and machine learning.',
    },
    {
      id: 'edu_2',
      degree: 'Senior Secondary (PCM + Computer Science)',
      institution: 'Your School',
      period: '2021 — 2023',
      detail: 'Graduated with distinction in mathematics and computer science.',
    },
  ],

  highlights: [
    { label: 'Projects shipped', value: '20+' },
    { label: 'Hackathons', value: '6' },
    { label: 'Open-source PRs', value: '30+' },
  ],
};
