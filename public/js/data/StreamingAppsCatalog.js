export class StreamingAppsCatalog {
  static #APPS = [
    ["netflix", "Netflix", "film"],
    ["prime-video", "Prime Video", "play"],
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
      .map(([id, label, iconKind]) => ({
        id,
        label,
        category: "streaming",
        iconKind,
        command: "OPEN_APP",
        visible: true
      }));
  }
}
