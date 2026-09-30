export type UserRole = "owner" | "admin";

export type AdminSocials = {
  whatsapp?: string;
  github?: string;
  telegram?: string;
  tiktok?: string;
  website?: string;
};

export type NimzzUser = {
  uid: string;
  email?: string;
  displayName: string;
  username: string;
  photoURL: string;
  bio: string;
  banner: string;
  role: UserRole;
  verified: boolean;
  socials: AdminSocials;
  createdAt: string;
  updatedAt: string;
};

export type Code = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  language: string;
  thumbnail: string;
  code: string;
  authorId: string;
  authorUsername: string;
  authorName: string;
  authorAvatar: string;
  views: number;
  createdAt: string;
  updatedAt: string;
};

export type CodeRequest = {
  id: string;
  authorId?: string;
  authorName: string;
  codeName: string;
  description: string;
  status: "new" | "in-progress" | "done" | "rejected";
  createdAt: string;
};

export type SiteSettings = {
  siteName: string;
  tagline: string;
  categories: string[];
  maintenanceMode: boolean;
};

export const DEFAULT_CATEGORIES = [
  "Tools", "Bot", "Web", "Script",
];

export const SUPPORTED_LANGUAGES = [
  "javascript", "typescript", "python", "java", "go", "rust",
  "php", "html", "css", "json", "bash", "shell", "cpp", "c",
  "csharp", "kotlin", "swift", "ruby", "sql", "yaml", "toml",
  "markdown", "dockerfile", "xml", "graphql", "r", "dart",
  "elixir", "haskell", "lua", "perl", "scala", "terraform",
  "vue", "jsx", "tsx", "sass", "scss", "less", "nginx",
];

export const LANG_EXTENSIONS: Record<string, string> = {
  javascript: "js", typescript: "ts", python: "py", java: "java",
  go: "go", rust: "rs", php: "php", html: "html", css: "css",
  json: "json", bash: "sh", shell: "sh", cpp: "cpp", c: "c",
  csharp: "cs", kotlin: "kt", swift: "swift", ruby: "rb",
  sql: "sql", yaml: "yml", toml: "toml", markdown: "md",
  dockerfile: "dockerfile", xml: "xml", graphql: "graphql",
  r: "r", dart: "dart", elixir: "ex", haskell: "hs",
  lua: "lua", perl: "pl", scala: "scala", vue: "vue",
  jsx: "jsx", tsx: "tsx", sass: "sass", scss: "scss",
};
