/* 
  =========================================
  TRIBUTE WEBSITE CUSTOMIZATION CONFIG FILE
  =========================================
  
  Edit this file to customize names, dates, quotes, photos, 
  vault passcodes, letters, and achievements!
*/

import bestieImg from './assets/bestie.png';
import girlImg from './assets/girl_dreaming.png';
import scrapbookImg from './assets/scrapbook.png';
import starryTreeImg from './assets/starry_tree.png';

// Fallback images (Vite bundled assets)
export const FALLBACKS = {
  bestie: bestieImg,
  girlDreaming: girlImg,
  scrapbook: scrapbookImg,
  starryTree: starryTreeImg
};

// Global image load fallback handler (prevents broken image links)
export const handleImageFallback = (e, fallbackType = 'bestie') => {
  e.target.onerror = null; // prevents infinite loop fallback
  if (fallbackType === 'girl') {
    e.target.src = FALLBACKS.girlDreaming;
  } else if (fallbackType === 'scrapbook') {
    e.target.src = FALLBACKS.scrapbook;
  } else if (fallbackType === 'starry') {
    e.target.src = FALLBACKS.starryTree;
  } else {
    e.target.src = FALLBACKS.bestie;
  }
};

// Global configurations
export const CONFIG = {
  HER_NAME: "Siya", 
  BIRTHDAY_MONTH: "June", 
  BIRTHDAY_DAY: 23, 
  
  // Surprise Vault Config
  VAULT_PASSCODE: "0623", 
  VAULT_HINT: "Your birthday in MMDD format (e.g. June 23rd is 0623)",

  // Main Home Page Settings
  HERO_HEADING: "A Website Dedicated To Someone Truly Special ✨",
  HERO_SUBHEADING: "Not because you're famous, but because you make people around you happier.",
  
  // Rotating words for typing animation
  TYPEWRITER_WORDS: [
    "Best Friend 🧸",
    "Siya 🎓",
    "Like a Sister 🌸",
    "Chaos Generator ⚡",
    "Star Athlete 🏐",
    "Dreamer ✨",
    "Volleyball Champ 🏆"
  ]
};

// IMAGE MAPPINGS
export const IMAGES = {
  // Your shared photo together (supports us.jpeg or fallback to us.jpg)
  us: "/photos/us.jpeg", 
  
  // Custom categories fallbacks
  bestie: FALLBACKS.bestie, 
  girlDreaming: FALLBACKS.girlDreaming, 
  scrapbook: FALLBACKS.scrapbook, 
  starryTree: FALLBACKS.starryTree 
};

// About Her sections details
export const ABOUT_HER = {
  INTRO_SUBTITLE: "A little glimpse into the personality, strengths, and quirks of my favorite person. Click any card to reveal details!",
  CARDS: [
    {
      title: "Who She Is",
      type: "user",
      content: "Currently in Grade 10, she is an incredible combination of dedication, athletic spirit, and warmth. More than a junior, she is a sister by bond and my absolute best friend.",
      color: "var(--accent-color)"
    },
    {
      title: "Things That Make Her Unique",
      type: "sparkles",
      content: "Her laugh is contagious, her sports drives are unstoppable, and she has this amazing ability to light up any room. She is completely authentic, funny, and has a unique sense of humor.",
      color: "var(--pink-color)"
    },
    {
      title: "Her Strengths",
      type: "trophy",
      content: "A resilient student and a powerhouse on the court. She manages to balance high school academics with her volleyball passion and outstanding athletic performance.",
      color: "var(--blue-color)"
    },
    {
      title: "What Everyone Loves",
      type: "heart",
      content: "Her kindness, her loyalty, and her chaotic banter. She is the first person to stand up for her friends and can lift your mood with just a simple, witty text message.",
      color: "var(--pink-color)"
    },
    {
      title: "Favorite Quotes",
      type: "quote",
      content: '"Live in the moment, play hard on the court, and eat lots of snacks." She represents the philosophy of spreading joy without taking life too seriously.',
      color: "var(--accent-color)"
    },
    {
      title: "Hobbies",
      type: "compass",
      content: "Playing volleyball, exploring Pinterest, taking random photographs, reading, curating aesthetics, and mastering the fine art of professional procrastination.",
      color: "var(--blue-color)"
    },
    {
      title: "Her Dreams",
      type: "sparkles",
      content: "To lead her volleyball team to championships, travel to cozy cities, achieve top grades in high school and college, and continue making her circle smile.",
      color: "var(--accent-color)"
    },
    {
      title: "Random Fact",
      type: "question",
      content: "Can survive on an alarming amount of chocolate, gets easily excited by cute stationery, and has a folder of volleyball highlights and memes.",
      color: "var(--pink-color)"
    }
  ]
};

// Interactive Memory Timeline details (Updated to .jpeg)
export const TIMELINE_EVENTS = [
  {
    id: 1,
    date: "Childhood Days",
    title: "Tiny Spark of Joy 🧸",
    type: "smile",
    image: "/photos/kid1.jpeg",
    caption: "Early childhood shenanigans.",
    description: "Looking back at the childhood memories. Even as a kid, her bright smile and boundless energy were already lighting up everyone's world.",
    tag: "Childhood"
  },
  {
    id: 2,
    date: "First Meeting",
    title: "How It All Began ☕",
    type: "coffee",
    image: IMAGES.us, // Shared photo together
    caption: "The start of something special.",
    description: "A simple introduction that turned into a lifetime friendship. We started chatting about school, homework, and inside jokes. Little did I know that this junior would become my closest friend and younger sister.",
    tag: "Beginning"
  },
  {
    id: 3,
    date: "Sports Achievements",
    title: "Powerhouse Athlete 🏐",
    type: "award",
    image: "/photos/ath.mp4",
    caption: "Dominating the volleyball court.",
    description: "Watching her train and win matches. She is a dedicated and extremely talented athlete who leaves everything on the court. Her energy during games is unmatched!",
    tag: "Sports"
  },
  {
    id: 4,
    date: "Dance Milestones",
    title: "Graceful Dancer 💃",
    type: "star",
    image: "/photos/dance.mp4",
    caption: "Expressing rhythm and elegance.",
    description: "She is a phenomenal and passionate dancer. Whenever she dances, she commands the stage with grace and confidence. Here is a highlight clip of her moving to the beat!",
    tag: "Dance"
  },
  {
    id: 5,
    date: "Funny Moments",
    title: "Banter & Inside Jokes 😜",
    type: "smile",
    image: "/photos/pic21.jpeg",
    caption: "Unmatched synchronization.",
    description: "Our inside jokes are so specific that other people think we're speaking a foreign language. Laughing uncontrollably until our stomachs hurt. You truly are the keeper of all my secrets and chaotic memories.",
    tag: "Humor"
  }
];

// Pinterest Gallery pictures details (Updated to .jpeg)
export const GALLERY_ITEMS = [
  // Special shared pic (First slot)
  { id: 0, category: 'friends', img: IMAGES.us, title: "Double the Dimples 👭💖", caption: "A super cute selfie of us laughing and smiling together. Unreplaceable bond!" },
  
  // Sports Photos
  { id: 101, category: 'sports', img: "/photos/sp1.jpeg", title: "Volleyball Spikes 🏐", caption: "Incredible serve caught in action." },
  { id: 102, category: 'sports', img: "/photos/sp2.jpeg", title: "Athletic Pride 🏆", caption: "Volleyball championship match highlight." },
  
  // Childhood Photos
  { id: 201, category: 'childhood', img: "/photos/kid1.jpeg", title: "Fish Ring Archway 🐠💍", caption: "A sweet childhood memory of Siya and her brother sitting inside the kissing-fish sculpture." },
  { id: 202, category: 'childhood', img: "/photos/kid2.jpeg", title: "Teal Rugby Tee 🏉💚", caption: "Throwback photo of her posing in a teal rugby t-shirt with her beautiful curly hair." },
  
  // Dance Photos
  { id: 301, category: 'favorites', img: "/photos/dance.mp4", title: "Dance Highlights 💃", caption: "Volleyball star and graceful dancer." },

  // Individual photos analyzed and custom captioned
  { id: 1, category: 'selfies', img: "/photos/pic1.jpeg", title: "Sports Jersey Smile ⚽✨", caption: "Sun-kissed selfie wearing her white football jersey. Always shining!" },
  { id: 2, category: 'friends', img: "/photos/pic2.jpeg", title: "Floral & Forest Vibes 🌸🌲", caption: "Posing with her floral dress against a beautiful scenic green backdrop." },
  { id: 3, category: 'random', img: "/photos/pic3.jpeg", title: "Cloudy Hills & Striped Dress ⛰️☁️", caption: "Strolling along the green slopes on a beautiful cloudy afternoon." },
  { id: 4, category: 'funny', img: "/photos/pic4.jpeg", title: "Swirling in Pink ✨👗", caption: "Looking absolutely graceful while twirling in her beautiful ethnic gown." },
  { id: 5, category: 'events', img: "/photos/pic5.jpeg", title: "Cherryish This Moment 🍒", caption: "Rocking the cherry graphic tee and sparkly pink skirt with a lovely smile." },
  { id: 6, category: 'favorites', img: "/photos/pic6.jpeg", title: "Balancing Act 🌿✈️", caption: "Striking a fun balancing pose on a log in the middle of a lush green estate." },
  { id: 7, category: 'selfies', img: "/photos/pic7.jpeg", title: "Cozy Sweater Weather ❄️🧶", caption: "Keeping it warm and cozy in a stylish cable-knit sweater and blue denim." },
  { id: 8, category: 'friends', img: "/photos/pic8.jpeg", title: "Cinematic Glances 🎬✨", caption: "Looking back with a sweet smile, enjoying a chilly outdoor view." },
  { id: 9, category: 'random', img: "/photos/pic9.jpeg", title: "Balcony Smiles 💫", caption: "Leaning on the balcony, flashing her signature sweet smile in her favorite polo shirt." },
  { id: 10, category: 'funny', img: "/photos/pic10.jpeg", title: "Shadow Play & Blue Wall 💙🔮", caption: "Striking a pose in front of a blue wall wearing a black hoodie and purple skirt." },
  { id: 11, category: 'events', img: "/photos/pic11.jpeg", title: "Strolling the Mountain Roads 🛣️⛰️", caption: "Walking down the hilly roads wearing a beautiful traditional blue printed dress." },
  { id: 12, category: 'favorites', img: "/photos/pic12.jpeg", title: "Cool & Casual 😎🚗", caption: "Chill weekend vibes wearing a car graphic tee with sunglasses resting on her hair." },
  { id: 13, category: 'selfies', img: "/photos/pic13.jpeg", title: "Traditional Elegance 🦚✨", caption: "Standing gracefully by an ornate wooden temple door in a lovely purple ethnic dress." },
  { id: 14, category: 'friends', img: "/photos/pic14.jpeg", title: "Blue Jersey Vibe ⚽💙", caption: "Posing in her blue football jersey. A true sports enthusiast!" },
  { id: 15, category: 'random', img: "/photos/pic15.jpeg", title: "Mustache & Stars 🥸🇺🇸", caption: "Funny selfie with a mustache filter and a patriotic cap. Peak comedy!" },
  { id: 16, category: 'funny', img: "/photos/pic16.jpeg", title: "Rooftop Overlook 🌴☁️", caption: "Enjoying the misty mountain view from the terrace in a palm tree tee." },
  { id: 17, category: 'events', img: "/photos/pic17.jpeg", title: "Bougainvillea Backdrop 🌸🌺", caption: "Standing by a wall of blooming flowers with a charming smile." },
  { id: 18, category: 'favorites', img: "/photos/pic18.jpeg", title: "Tea Plantation Slopes 🍃🏡", caption: "Smiling on the slopes of a tea estate under the beautiful clear blue sky." },
  { id: 19, category: 'selfies', img: "/photos/pic19.jpeg", title: "Sunny Temple Days ☀️🪷", caption: "Dressed up in a beautiful traditional skirt and crop top with statement earrings." },
  { id: 20, category: 'friends', img: "/photos/pic20.jpeg", title: "Liverpool Fan! ⚽🔴", caption: "Posing on the rooftop in her Liverpool FC jersey. True football enthusiast!" }
];

// Achievements timeline details
export const ACHIEVEMENTS_LIST = [
  {
    title: "Star Volleyball Athlete",
    subtitle: "Athletic Excellence",
    date: "Ongoing",
    description: "Exhibiting high dedication on the volleyball court. Her coordination, high-speed spikes, and competitive spirit make her a key player and a star team asset.",
    type: "target",
    color: "var(--accent-color)"
  },
  {
    title: "School Competitions & Medals",
    subtitle: "Sports Performance",
    date: "2025 - 2026",
    description: "Participating in local tournaments, displaying high athletic skills and representing her team with outstanding performance under pressure.",
    type: "award",
    color: "var(--pink-color)"
  },
  {
    title: "Talents & Creativity",
    subtitle: "Artistic Expression & Design",
    date: "Active",
    description: "Possessing an incredible eye for aesthetics, curated designs, photography, and creative listing. Her artistic touch is present in everything she works on.",
    type: "medal",
    color: "var(--blue-color)"
  },
  {
    title: "Special Quality: Infinite Empathy",
    subtitle: "Personal Strengths",
    date: "Lifetime",
    description: "Always listening, supporting friends, and keeping people together with her warm heart. Her emotional intelligence is her biggest superpower.",
    type: "heart",
    color: "var(--pink-color)"
  },
  {
    title: "Ambition for the Future",
    subtitle: "Looking Ahead",
    date: "Next Milestones",
    description: "Determined to crack upcoming tournaments, secure athletic achievements, and gain admission to top colleges. The path is set and she's ready to fly!",
    type: "target",
    color: "var(--accent-color)"
  }
];

// Funny Quotes & Confetti triggers list
export const FUNNY_QUOTES = [
  "Today's chaos level: 98%. Proceed with snacks.",
  "Certified professional troublemaker. Grade 10 division.",
  "Powered entirely by noodles, volleyball spikes, and last-minute panic.",
  "Can communicate in inside jokes and memes. Translators unavailable.",
  "Decides to study for 5 minutes. Spends 2 hours planning a volleyball drill.",
  "Drama level: Shakespeare. Banter capability: Infinite.",
  "Officially matching: 1% studying, 99% practicing spikes."
];

// Funny Polaroids Banter Speech Bubbles (Updated to .jpeg)
export const FUNNY_POLAROIDS = [
  {
    img: IMAGES.us, 
    angle: '-8deg',
    left: '12%',
    caption: "Me explaining a math problem. Her: 'Wait, why are we doing alphabets in math?'",
    bubble: "I thought math only had numbers? 🧐"
  },
  {
    img: "/photos/sp1.jpeg",
    angle: '5deg',
    right: '10%',
    caption: "Volleyball training drills vs Study hours. Volleyball wins easily.",
    bubble: "Time for spikes! 🏐⚡"
  },
  {
    img: "/photos/sp2.jpeg",
    angle: '-3deg',
    left: '25%',
    top: '55%',
    caption: "When we finish a long training session and our legs are completely dead.",
    bubble: "Energy has exited the court. 🔋🔌"
  }
];

// Dream / Vision Board elements
export const DREAM_BOARD = {
  CARDS: [
    {
      title: "Star Athlete & Volleyball 🏐🏆",
      type: "compass",
      items: [
        "Become an outstanding star athlete on the court, leading with confidence",
        "Master advanced volleyball setups, high-speed spikes, and coordination",
        "Bring unstoppable energy, competitive spirit, and win championships"
      ],
      color: "#60a5fa",
      bgGrad: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(168, 85, 247, 0.05) 100%)"
    },
    {
      title: "Never Leave Your Dance Passion 💃✨",
      type: "heart",
      items: [
        "Keep dancing, expressing rhythm and elegance on every stage",
        "Never let go of the passion that brings grace and commands confidence",
        "Explore new moves and sync to express raw creative freedom"
      ],
      color: "#f472b6",
      bgGrad: "linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)"
    },
    {
      title: "School First, Darling! 📚🎓",
      type: "book",
      items: [
        "Always remember: school first is important, darling!",
        "Balance volleyball training and dance with solid academic dedication",
        "Crack Grade 10 exams with outstanding focus and study schedules"
      ],
      color: "#c084fc",
      bgGrad: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(168, 85, 247, 0.05) 100%)"
    }
  ],
  AFFIRMATIONS: [
    "You are capable of doing amazing things! ✨",
    "Don't worry about being perfect, just keep growing. 🌱",
    "Your dreams are valid, work hard and make them real! 🚀",
    "You are surrounded by people who support and love you. 💖",
    "Volleyball court or exam hall - you always shine! 🏐🌟",
    "Keep smiling, your happiness is infectious! 😊",
    "Remember: progress over perfection. 🌸"
  ]
};

// Envelope Messages
export const LETTERS = [
  {
    id: 1,
    title: "Thank you for existing",
    type: "heart",
    teaser: "A short note of gratitude for your presence in my life.",
    content: "Thank you for being you. In a world full of chaotic days and study stress, having you as a best friend and sister makes everything a hundred times lighter. Your kindness, humor, and pure presence are things I am incredibly grateful for every single day. Never forget that you make the people around you genuinely happier just by being yourself.",
    bg: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
    borderColor: "var(--pink-color)"
  },
  {
    id: 2,
    title: "Why you're special",
    type: "sparkles",
    teaser: "What sets you apart from anyone else.",
    content: "You have a rare authenticity. You don't try to fit into molds; you speak your mind, laugh at the silliest things, play hard on the court, and bring genuine warmth. Your ability to balance high school life with being an exceptional athlete and a hilarious, empathetic friend is what makes you truly one of a kind. You are irreplaceable.",
    bg: "linear-gradient(135deg, #f3e8ff 0%, #fae8ff 100%)",
    borderColor: "var(--accent-color)"
  },
  {
    id: 3,
    title: "Things I admire about you",
    type: "star",
    teaser: "The qualities that inspire me daily.",
    content: "I deeply admire your resilience and creative spirit. When you get overwhelmed, you manage to gather yourself, focus, and push through. I admire how loyal you are to your friends, how you stand up for what's right, and how you bring outstanding athleticism and humor to everything you touch. You inspire me to be a better friend too.",
    bg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    borderColor: "var(--blue-color)"
  },
  {
    id: 4,
    title: "Things I hope you achieve",
    type: "compass",
    teaser: "My wishes for your future and dreams.",
    content: "I hope you conquer your volleyball matches and exams with flying colors. More than grades, I hope you build a life full of creative freedom, visit the cherry blossom parks of Japan, explore cozy coffee shops, design custom stationery, and never lose your spark of curiosity, athleticism, and joy.",
    bg: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
    borderColor: "var(--success-color)"
  },
  {
    id: 5,
    title: "Memories I'll never forget",
    type: "info",
    teaser: "The highlights of our shared path.",
    content: "I will never forget our endless chats, laughing over chaotic exams, sharing food, watching you play volleyball, making custom schedules we never followed, and our hyper-specific inside jokes that make zero sense to anyone else. These memories are stored safely in my heart.",
    bg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    borderColor: "#f59e0b"
  },
  {
    id: 6,
    title: "Life Advice & Banter",
    type: "smile",
    teaser: "A little senior advice & funny warnings.",
    content: "Here is my advice: Eat more chocolate, worry less about being perfect, take lots of pictures, and sleep on time! Don't let court pressure or exam pressure steal your smile. You are already smart, kind, and capable. Oh, and remember that I will always be here to support you. Stay wonderful!",
    bg: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
    borderColor: "var(--pink-color)"
  }
];

// Birthday Compliment Generator list
export const COMPLIMENTS = [
  "You make everyone around you happier just by existing! ✨",
  "You are an incredibly loyal, trustworthy best friend. 💖",
  "Your sense of humor is unmatched and hilarious. 😂",
  "Your dedication to volleyball and your goals is inspiring! 🏐🏆",
  "You have a rare, beautiful eye for art and photography. 🎨",
  "You are like the younger sister I always wanted to support. 🌸",
  "You are completely authentic, never change! 🌟"
  
];

// Memory Leaves for Final Tribute Tree
export const MEMORY_LEAVES = [
  { id: 1, label: "Ramen Study 🍜", text: "That evening we spent 2 hours constructing a flawless study planner, only to abandon it after 10 minutes and eat instant noodles instead." },
  { id: 2, label: "Class Banter 🎒", text: "The silent exam room where we caught each other's eye and had to suppress laughing so hard our stomachs actually hurt." },
  { id: 3, label: "Dream Cafe 🌟", text: "Our deep conversations detailing what our dream design cafes would look like in Tokyo." },
  { id: 4, label: "Sticker Spam ⚡", text: "The morning I woke up to a barrage of 45 chaotic, matching cat memes you sent to make sure I wasn't late." },
  { id: 5, label: "Trophy Moment 🏐🏆", text: "Your reaction when you won your volleyball game and scored the match point. Unforgettable athlete drive." },
  { id: 6, label: "Balloon Day 🎂", text: "Helping inflate a room full of pastel pink balloons for your surprise birthday party." }
];

// Memorable Videos configurations for final circular showcase
export const MEMORABLE_VIDEOS = [
  { id: 1, title: "Special Reel 🎬✨", src: "/photos/reel1.mp4", caption: "A beautiful compilation of special moments and happy memories." },
  { id: 2, title: "Happy Moments 🌸✨", src: "/photos/reel2.mp4", caption: "Capturing her bright smile, warm laughter, and dynamic energy." },
  { id: 3, title: "Precious Memories 🌟✨", src: "/photos/reel3.mp4", caption: "Sweet moments of friendship and laughing together." },
  { id: 4, title: "Sweet Banter 😜✨", src: "/photos/reel4.mp4", caption: "Inside jokes, banter, and chaotic fun that always makes us smile." },
  { id: 5, title: "Milestones Reel 🎓✨", src: "/photos/reel5.mp4", caption: "Celebrating achievements, growth, and the beautiful path ahead." },
  { id: 6, title: "Daily Laughs & Joy 💫✨", src: "/photos/reel6.mp4", caption: "Capturing simple daily happiness and pure vibes." },
  { id: 7, title: "Unforgettable Journeys 🗺️🌸", src: "/photos/reel7.mp4", caption: "Throwback clips from adventures, travels, and lovely outings." },
  { id: 8, title: "Sisterly Bond 👭💖", src: "/photos/reel8.mp4", caption: "A celebration of a beautiful friendship and lifetime sisterly bond." },
  { id: 9, title: "Memorable Reel 9 🎬💫", src: "/photos/reel9.mp4", caption: "Another compilation of dynamic and happy memory snippets." },
  { id: 10, title: "Siya & Mom 👩‍👧💖", src: "/photos/reel10.jpeg", caption: "A beautiful memory of Siya with her mom, sharing warmth and smiles." },
  { id: 11, title: "Family Temple Visit 🏛️❤️", src: "/photos/reel11.jpeg", caption: "A lovely family moment visiting the temple together." },
  { id: 12, title: "Volleyball Spikes 🏐", src: "/photos/ath.mp4", caption: "Dominating the volleyball court with unmatched energy and high-speed spikes!" },
  { id: 13, title: "Dance Performance 💃", src: "/photos/dance.mp4", caption: "Graceful movements, confidence, and capturing the spotlight on stage!" },
  { id: 14, title: "Achievements Highlight 🏆", src: "/photos/ach.mp4", caption: "Volleyball training drills and celebrating athletic excellence!" }
];

