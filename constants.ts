
import { UserRole, type Celebrity, type PublicUser, type Post, type Notification, type Comment, PostCategory } from './types';

export const MOCK_API_KEY = 'YOUR_GEMINI_API_KEY_ENV_VAR'; // Placeholder, not used in this version
export const MOCK_TOKEN_EXPIRY_MS = 1000 * 60 * 60 * 24; // 24 hours for mock token

export const POST_CATEGORIES: PostCategory[] = [
  PostCategory.GENERAL,
  PostCategory.MUSIC,
  PostCategory.SPORTS,
  PostCategory.LIFESTYLE,
  PostCategory.TECH,
  PostCategory.FOOD,
  PostCategory.ART,
  PostCategory.TRAVEL,
];

export const INITIAL_CELEBRITIES: Celebrity[] = [
  {
    id: 'celeb1',
    username: 'GlamStar Alice',
    role: UserRole.CELEBRITY,
    profilePictureUrl: 'https://picsum.photos/seed/alice/200/200',
    bio: 'Shining bright and sharing my world! ✨ Fashion, lifestyle, and positive vibes.',
    followers: ['public1', 'public2'],
  },
  {
    id: 'celeb2',
    username: 'TechGuru Bob',
    role: UserRole.CELEBRITY,
    profilePictureUrl: 'https://picsum.photos/seed/bob/200/200',
    bio: 'Innovating the future, one line of code at a time. AI & Web3 enthusiast.',
    followers: ['public1'],
  },
  {
    id: 'celeb3',
    username: 'Chef Leo',
    role: UserRole.CELEBRITY,
    profilePictureUrl: 'https://picsum.photos/seed/leo/200/200',
    bio: 'Creating culinary masterpieces and sharing delicious recipes. Food is love!',
    followers: [],
  }
];

export const INITIAL_PUBLIC_USERS: PublicUser[] = [
  {
    id: 'public1',
    username: 'CuriousCharlie',
    role: UserRole.PUBLIC,
    profilePictureUrl: 'https://picsum.photos/seed/charlie/200/200',
    following: ['celeb1', 'celeb2'],
  },
  {
    id: 'public2',
    username: 'ExplorerEve',
    role: UserRole.PUBLIC,
    profilePictureUrl: 'https://picsum.photos/seed/eve/200/200',
    following: ['celeb1'],
  },
  {
    id: 'public3',
    username: 'CasualUserMax',
    role: UserRole.PUBLIC,
    profilePictureUrl: 'https://picsum.photos/seed/max/200/200',
    following: ['celeb3'],
  }
];

const LOREM_IPSUM_SHORT = [
  "Just had an amazing photoshoot! ✨ Can't wait to share the results. #blessed #fashion",
  "Working on a new revolutionary app. Stay tuned for updates! #tech #innovation",
  "Enjoying a beautiful sunset. Nature is truly inspiring. 🌅 #peaceful #naturelover",
  "My new vlog is up! Check it out and let me know your thoughts. #youtube #creator",
  "Cooking up a storm in the kitchen today! 🍝 Who wants the recipe? #foodie #homecooking",
  "Exploring the city's hidden gems. So much to discover! #travel #adventure",
  "Deep in thought about the next big project. The creative process is fascinating. 🤔 #ideas",
  "Just finished a great workout session! Feeling energized. 💪 #fitness #healthylifestyle",
  "Reading a captivating book by the fireplace. Perfect cozy evening. 📚 #reading #relax",
  "Behind the scenes of my latest music video! Coming soon. 🎶 #music #bts"
];

const CELEB_IDS = INITIAL_CELEBRITIES.map(c => c.id);
const CELEB_DETAILS = INITIAL_CELEBRITIES.reduce((acc, celeb) => {
  acc[celeb.id] = { username: celeb.username, profilePictureUrl: celeb.profilePictureUrl };
  return acc;
}, {} as Record<string, { username: string, profilePictureUrl?: string }>);

const SAMPLE_COMMENTS_POST1: Comment[] = [
    {
        id: 'comment1_post1',
        postId: 'post1',
        userId: 'public1',
        username: 'CuriousCharlie',
        userProfilePictureUrl: INITIAL_PUBLIC_USERS.find(u => u.id === 'public1')?.profilePictureUrl?.replace('200/200', '32/32'),
        content: "Wow, Alice! This looks stunning! Can't wait for the full set. 😍",
        timestamp: Date.now() - 1000 * 60 * 30, // 30 mins ago
    },
    {
        id: 'comment2_post1',
        postId: 'post1',
        userId: 'celeb2', // TechGuru Bob commenting
        username: 'TechGuru Bob',
        userProfilePictureUrl: INITIAL_CELEBRITIES.find(u => u.id === 'celeb2')?.profilePictureUrl?.replace('200/200', '32/32'),
        content: "Great shot, Alice! The lighting is perfect.",
        timestamp: Date.now() - 1000 * 60 * 15, // 15 mins ago
    }
];

const SAMPLE_COMMENTS_POST2: Comment[] = [
     {
        id: 'comment1_post2',
        postId: 'post2',
        userId: 'public2',
        username: 'ExplorerEve',
        userProfilePictureUrl: INITIAL_PUBLIC_USERS.find(u => u.id === 'public2')?.profilePictureUrl?.replace('200/200', '32/32'),
        content: "This sounds exciting, Bob! Looking forward to the big reveal. #FutureTech",
        timestamp: Date.now() - 1000 * 60 * 60 * 1, // 1 hour ago
    }
];


export const INITIAL_POSTS: Post[] = [
  {
    id: 'post1',
    userId: 'celeb1',
    username: 'GlamStar Alice',
    userProfilePictureUrl: 'https://picsum.photos/seed/alice/50/50',
    content: LOREM_IPSUM_SHORT[0],
    imageUrls: ['https://picsum.photos/seed/photoshoot1/600/400', 'https://picsum.photos/seed/photoshoot2/600/400', 'https://picsum.photos/seed/photoshoot3/600/400'],
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    likes: 152,
    commentCount: SAMPLE_COMMENTS_POST1.length,
    latestComments: SAMPLE_COMMENTS_POST1.slice(-2).sort((a,b) => b.timestamp - a.timestamp),
    shareCount: 23,
    category: PostCategory.LIFESTYLE,
  },
  {
    id: 'post2',
    userId: 'celeb2',
    username: 'TechGuru Bob',
    userProfilePictureUrl: 'https://picsum.photos/seed/bob/50/50',
    content: LOREM_IPSUM_SHORT[1],
    imageUrls: ['https://picsum.photos/seed/techapp/600/350'],
    timestamp: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
    likes: 230,
    commentCount: SAMPLE_COMMENTS_POST2.length,
    latestComments: SAMPLE_COMMENTS_POST2.slice(-2).sort((a,b) => b.timestamp - a.timestamp),
    shareCount: 45,
    category: PostCategory.TECH,
  },
  {
    id: 'post3',
    userId: 'celeb1',
    username: 'GlamStar Alice',
    userProfilePictureUrl: 'https://picsum.photos/seed/alice/50/50',
    content: LOREM_IPSUM_SHORT[2],
    imageUrls: ['https://picsum.photos/seed/sunset/600/400'],
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 1, // 1 day ago
    likes: 310,
    commentCount: 0,
    latestComments: [],
    shareCount: 12,
    category: PostCategory.TRAVEL,
  },
  {
    id: 'post4',
    userId: 'celeb3',
    username: 'Chef Leo',
    userProfilePictureUrl: 'https://picsum.photos/seed/leo/50/50',
    content: "Just whipped up this delicious Paella! Recipe coming soon. Who wants a bite? 🥘🇪🇸 #paella #spanishfood #cheflife",
    imageUrls: ['https://picsum.photos/seed/paella1/600/450', 'https://picsum.photos/seed/paella2/600/450'],
    timestamp: Date.now() - 1000 * 60 * 60 * 8, // 8 hours ago
    likes: 180,
    commentCount: 0,
    latestComments: [],
    shareCount: 30,
    category: PostCategory.FOOD,
  },
  // Add more posts for infinite scroll testing
  ...Array.from({ length: 36 }, (_, i) => {
    const celebId = CELEB_IDS[i % CELEB_IDS.length];
    const celebInfo = CELEB_DETAILS[celebId];
    const categoryIndex = i % POST_CATEGORIES.length;
    return {
      id: `post_extra_${i + 5}`,
      userId: celebId,
      username: celebInfo.username,
      userProfilePictureUrl: celebInfo.profilePictureUrl?.replace('200/200', '50/50') || `https://picsum.photos/seed/${celebId}/50/50`,
      content: `${LOREM_IPSUM_SHORT[i % LOREM_IPSUM_SHORT.length]} (Post ${i+5}) #randomthoughts #${celebInfo.username.split(' ')[0].toLowerCase()}`,
      imageUrls: i % 3 === 0 ? [`https://picsum.photos/seed/extrapost${i}/600/${300 + (i%5 * 20)}`] : undefined, // Some posts without images
      timestamp: Date.now() - 1000 * 60 * 60 * (12 + i * 3), // Spread out timestamps more
      likes: Math.floor(Math.random() * 200) + 50,
      commentCount: 0,
      latestComments: [],
      shareCount: Math.floor(Math.random() * 30),
      category: POST_CATEGORIES[categoryIndex],
    }
  }),
];

// This is a global store for comments, keyed by postId
export const INITIAL_COMMENTS_DB: Record<string, Comment[]> = {
    'post1': SAMPLE_COMMENTS_POST1,
    'post2': SAMPLE_COMMENTS_POST2,
};


export const POSTS_PER_PAGE = 8;
export const COMMENTS_PREVIEW_COUNT = 2; // Number of comments to show in preview
export const COMMENTS_PER_PAGE = 5; // For "load more comments"
export const TYPING_INDICATOR_TIMEOUT = 2000; // ms
