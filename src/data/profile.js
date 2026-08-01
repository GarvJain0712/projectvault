/**
 * Everything shown on the About Me page.
 * Edit this one file to make the site yours.
 */

export const PROFILE = {
  name: 'GARV JAIN',
  role: 'Engineering Student · Full-Stack Developer',
  location: 'India',
  email: 'garvjain72005@gmail.com',
  photo: '', // Drop a URL or an imported image here; initials show otherwise.
 bio: "I'm a Computer Science undergraduate at LNMIIT with a passion for building impactful software and intelligent embedded systems. I enjoy working across the full stack, solving algorithmic problems, and turning ideas into real-world applications. Whether it's developing web applications, experimenting with AI, or building robotics projects with ESP32 and Arduino, I love learning by creating.",

  github: 'https://github.com/GarvJain0712',
  linkedin: 'https://www.linkedin.com/in/garv-jain-1a6752321/',
  portfolio: 'https://projectvault-lovat.vercel.app',
  resume: '', // Put your resume PDF in /public and point to it, e.g. '/resume.pdf'

 skills: [
  {
    group: 'Languages',
    items: [
      'C++',
      'JavaScript',
      'TypeScript',
      'Python',
      'SQL',
      'HTML',
      'CSS',
    ],
  },

  {
    group: 'Frontend',
    items: [
      'React',
      'Vite',
      'Tailwind CSS',
      'Redux',
      'Framer Motion',
    ],
  },

  {
    group: 'Backend',
    items: [
      'Node.js',
      'Express.js',
      'MongoDB',
      'Firebase',
      'REST APIs',
      'JWT Authentication',
    ],
  },

  {
    group: 'Embedded & IoT',
    items: [
      'ESP32',
      'ESP8266',
      'Arduino',
      'I2C',
      'Serial Communication',
    ],
  },

  {
    group: 'Developer Tools',
    items: [
      'Git',
      'GitHub',
      'Postman',
      'VS Code',
      'Linux',
      'Docker',
      'Vercel',
      'Render',
    ],
  },

  {
    group: 'Currently Learning',
    items: [
      'Data Structures & Algorithms',
      'Generative AI',
      'Agentic AI',
      'System Design',
      'MERN Stack',
    ],
  },
],

  education: [
  
    {
      id: 'edu_2',
      degree: 'Senior Secondary (PCM + Computer Science)',
      institution: 'MSS PUBLIC SCHOOL',
      period: '2021 — 2023',
      detail: 'Graduated with distinction in mathematics and computer science.',
    },
      {
      id: 'edu_1',
      degree: 'B.Tech, Computer Science & Engineering',
      institution: 'LNMIIT',
      period: '2024 — 2028',
      detail: 'Coursework in data structures, operating systems, computer Networks , DBMS , Computer System And Architecture',
    },
    {
    id: 'exp_1',
    degree: 'PHOENIX Member',
    institution: 'Phoenix Robotics Club, LNMIIT',
    period: '2025 — Present',
    detail:
      'Organizing robotics events, mentoring club members, and developing robotics and embedded systems projects.',
  },
    
  ],

  highlights: [
    { label: 'Projects shipped', value: '20+' },
    { label: 'Hackathons', value: '6' },
    { label: 'Open-source PRs', value: '30+' },
  ],
  interests: [
  'Robotics',
  'Artificial Intelligence',
  'Competitive Programming',
  'Open Source',
  'System Design',
  'Automation',
],
};
