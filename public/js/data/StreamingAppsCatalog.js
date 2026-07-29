export class StreamingAppsCatalog {
  static #PRIORITY_IDS = new Map([
    ["netflix", 0],
    ["prime-video", 1],
    ["youtube", 2],
    ["disney-plus", 3],
    ["max", 4],
    ["globoplay", 5],
    ["apple-tv", 6],
    ["paramount-plus", 7],
    ["crunchyroll", 8],
    ["spotify", 9]
  ]);

  static #ICON_SLUGS = Object.freeze({
    netflix: "netflix",
    youtube: "youtube",
    max: "max",
    "apple-tv": "appletv",
    "paramount-plus": "paramountplus",
    crunchyroll: "crunchyroll",
    spotify: "spotify",
    "youtube-kids": "youtubekids",
    plex: "plex",
    "samsung-tv-plus": "samsung",
    mubi: "mubi",
    twitch: "twitch",
    dazn: "dazn",
    "google-play-filmes": "googleplay",
    "steam-link": "steam",
    kodi: "kodi",
    deezer: "deezer",
    "apple-music": "applemusic",
    tiktok: "tiktok",
    "facebook-watch": "facebook",
    "red-bull-tv": "redbull",
    now: "now",
    "sky-plus": "sky",
    "rakuten-tv": "rakuten",
    "haystack-news": "haystack",
    ted: "ted",
    vimeo: "vimeo"
  });

  static #ICONS = Object.freeze({
    film: "▣",
    play: "▶",
    spark: "✦",
    max: "M",
    globo: "◉",
    apple: "●",
    mount: "⌁",
    anime: "◈",
    video: "▸",
    kids: "★",
    music: "♫",
    plex: "▷",
    planet: "◌",
    tv: "▣",
    tvp: "S",
    vix: "V",
    eye: "◉",
    mubi: "M",
    live: "●",
    sport: "◐",
    ball: "●",
    star: "★",
    game: "◆",
    media: "◫",
    clip: "♪",
    watch: "◷",
    action: "⚡",
    discover: "⌕",
    clock: "◷",
    br: "BR",
    now: "N",
    sky: "☁",
    cart: "▰",
    globe: "◎",
    store: "▱",
    news: "▤",
    talk: "T"
  });

  static #APPS = [
    ["netflix", "Netflix", "film"],
    ["prime-video", "Amazon Prime Video", "play"],
    ["disney-plus", "Disney+", "spark"],
    ["max", "Max", "max"],
    ["globoplay", "Globoplay", "globo"],
    ["apple-tv", "Apple TV", "apple"],
    ["paramount-plus", "Paramount+", "mount"],
    ["crunchyroll", "Crunchyroll", "anime"],
    ["youtube", "YouTube", "video"],
    ["youtube-kids", "YouTube Kids", "kids"],
    ["spotify", "Spotify", "music"],
    ["plex", "Plex", "plex"],
    ["pluto-tv", "Pluto TV", "planet"],
    ["claro-tv-plus", "Claro TV+", "tv"],
    ["samsung-tv-plus", "Samsung TV Plus", "tvp"],
    ["vix", "Vix", "vix"],
    ["looke", "Looke", "eye"],
    ["telecine", "Telecine", "film"],
    ["mubi", "MUBI", "mubi"],
    ["twitch", "Twitch", "live"],
    ["dazn", "DAZN", "sport"],
    ["nba-app", "NBA App", "ball"],
    ["espn", "ESPN", "sport"],
    ["star-plus", "Star+", "star"],
    ["google-play-filmes", "Google Play Filmes", "film"],
    ["google-play-games", "Google Play Games", "game"],
    ["steam-link", "Steam Link", "game"],
    ["kodi", "Kodi", "media"],
    ["amazon-music", "Amazon Music", "music"],
    ["deezer", "Deezer", "music"],
    ["apple-music", "Apple Music", "music"],
    ["tiktok", "TikTok", "clip"],
    ["facebook-watch", "Facebook Watch", "watch"],
    ["red-bull-tv", "Red Bull TV", "action"],
    ["discovery-plus", "Discovery+", "discover"],
    ["lionsgate-plus", "Lionsgate+", "film"],
    ["runtime-tv", "Runtime TV", "clock"],
    ["sbt-videos", "SBT Videos", "video"],
    ["bandplay", "BandPlay", "play"],
    ["playplus", "PlayPlus", "play"],
    ["canal-brasil-play", "Canal Brasil Play", "br"],
    ["watch-brasil", "Watch Brasil", "watch"],
    ["now", "NOW", "now"],
    ["oi-play", "Oi Play", "play"],
    ["sky-plus", "Sky+", "sky"],
    ["mercado-play", "Mercado Play", "cart"],
    ["universal-plus", "Universal+", "globe"],
    ["amc-plus", "AMC+", "film"],
    ["rakuten-tv", "Rakuten TV", "store"],
    ["haystack-news", "Haystack News", "news"],
    ["ted", "TED", "talk"],
    ["vimeo", "Vimeo", "video"],
    ["vevo", "VEVO", "music"]
  ];

  getVisibleApps(installedAppIds = null) {
    const installed = Array.isArray(installedAppIds) ? new Set(installedAppIds) : null;
    return StreamingAppsCatalog.#APPS
      .filter(([id]) => !installed || installed.has(id))
      .sort(([firstId], [secondId]) => StreamingAppsCatalog.#priority(firstId) - StreamingAppsCatalog.#priority(secondId))
      .map(([id, label, iconKind]) => ({
        id,
        label,
        category: "streaming",
        iconKind,
        icon: StreamingAppsCatalog.#ICONS[iconKind] ?? "●",
        iconUrl: StreamingAppsCatalog.#iconUrl(id),
        command: "OPEN_APP",
        visible: true
      }));
  }

  static #iconUrl(id) {
    const slug = StreamingAppsCatalog.#ICON_SLUGS[id];
    return slug ? `https://cdn.simpleicons.org/${slug}` : null;
  }

  static #priority(id) {
    return StreamingAppsCatalog.#PRIORITY_IDS.get(id) ?? Number.MAX_SAFE_INTEGER;
  }
}
