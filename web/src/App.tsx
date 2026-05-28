import { useState, useEffect, useCallback } from "react";
import { Shell } from "./components/Shell";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Meme {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
}

type View = "random" | "favorites";

// ─── Storage helpers ──────────────────────────────────────────────────────────
const STORAGE_KEY = "lolapp_favorites";

function loadFavorites(): Meme[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveFavorites(memes: Meme[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memes));
}

// ─── Fallback memes (used when offline) ──────────────────────────────────────
const FALLBACK_MEMES: Meme[] = [
  { id: "181913649", name: "Drake Hotline Bling", url: "https://i.imgflip.com/30b1gx.jpg", width: 1200, height: 1200 },
  { id: "87743020",  name: "Two Buttons",         url: "https://i.imgflip.com/1g8my4.jpg", width: 600,  height: 908  },
  { id: "112126428", name: "Distracted Boyfriend", url: "https://i.imgflip.com/1ur9b0.jpg", width: 1200, height: 800 },
  { id: "131087935", name: "Running Away Balloon", url: "https://i.imgflip.com/261o3j.jpg", width: 761,  height: 1024 },
  { id: "61579",     name: "One Does Not Simply",  url: "https://i.imgflip.com/1bij.jpg",   width: 568,  height: 335  },
  { id: "438680",    name: "Batman Slapping Robin", url: "https://i.imgflip.com/9ehk.jpg",  width: 400,  height: 400  },
  { id: "4087833",   name: "Waiting Skeleton",      url: "https://i.imgflip.com/2fm6x.jpg", width: 500,  height: 623  },
  { id: "217743513", name: "UNO Draw 25 Cards",     url: "https://i.imgflip.com/3lmzyx.jpg", width: 500, height: 946 },
  { id: "124822590", name: "Left Exit 12 Off Ramp", url: "https://i.imgflip.com/22bdq6.jpg", width: 804, height: 767 },
  { id: "101470",    name: "Ancient Aliens",        url: "https://i.imgflip.com/xgq7.jpg",   width: 500, height: 375 },
  { id: "93895088",  name: "Expanding Brain",       url: "https://i.imgflip.com/1jwhww.jpg", width: 857, height: 1202 },
  { id: "97984",     name: "Disaster Girl",         url: "https://i.imgflip.com/23ls.jpg",   width: 500, height: 375 },
];

// ─── Reaction emojis ──────────────────────────────────────────────────────────
const REACTIONS = ["😂", "🤣", "💀", "😭", "🔥", "👌", "😆", "🤦"];

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<View>("random");
  const [memes, setMemes] = useState<Meme[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<Meme[]>(loadFavorites);
  const [loading, setLoading] = useState(true);
  const [reaction, setReaction] = useState<string | null>(null);
  const [reactionAnim, setReactionAnim] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [offline, setOffline] = useState(false);

  // Fetch memes from imgflip
  const fetchMemes = useCallback(async () => {
    setLoading(true);
    setImgLoaded(false);
    try {
      const res = await fetch("https://api.imgflip.com/get_memes");
      const data = await res.json();
      if (data.success) {
        const shuffled = [...data.data.memes].sort(() => Math.random() - 0.5);
        setMemes(shuffled);
        setCurrentIndex(0);
        setOffline(false);
      } else {
        throw new Error("API failed");
      }
    } catch {
      setMemes(FALLBACK_MEMES.sort(() => Math.random() - 0.5));
      setCurrentIndex(0);
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemes();
  }, [fetchMemes]);

  const currentMeme = memes[currentIndex] ?? null;

  const isFavorited = (meme: Meme) => favorites.some((f) => f.id === meme.id);

  const toggleFavorite = (meme: Meme) => {
    const updated = isFavorited(meme)
      ? favorites.filter((f) => f.id !== meme.id)
      : [meme, ...favorites];
    setFavorites(updated);
    saveFavorites(updated);
  };

  const nextMeme = () => {
    setImgLoaded(false);
    setCurrentIndex((i) => (i + 1) % memes.length);
  };

  const prevMeme = () => {
    setImgLoaded(false);
    setCurrentIndex((i) => (i - 1 + memes.length) % memes.length);
  };

  const react = (emoji: string) => {
    setReaction(emoji);
    setReactionAnim(true);
    setTimeout(() => setReactionAnim(false), 600);
    setTimeout(() => setReaction(null), 1200);
  };

  const removeFavorite = (id: string) => {
    const updated = favorites.filter((f) => f.id !== id);
    setFavorites(updated);
    saveFavorites(updated);
  };

  const navItems = [
    { icon: "🎲", label: "Random", onClick: () => setView("random"), active: view === "random" },
    { icon: "❤️", label: "Favorites", onClick: () => setView("favorites"), active: view === "favorites" },
  ];

  return (
    <Shell navItems={navItems}>
      {view === "random" ? (
        <RandomView
          meme={currentMeme}
          loading={loading}
          offline={offline}
          imgLoaded={imgLoaded}
          setImgLoaded={setImgLoaded}
          isFavorited={currentMeme ? isFavorited(currentMeme) : false}
          onToggleFavorite={() => currentMeme && toggleFavorite(currentMeme)}
          onNext={nextMeme}
          onPrev={prevMeme}
          onReact={react}
          onRefresh={fetchMemes}
          reaction={reaction}
          reactionAnim={reactionAnim}
          total={memes.length}
          index={currentIndex}
        />
      ) : (
        <FavoritesView favorites={favorites} onRemove={removeFavorite} onGoRandom={() => setView("random")} />
      )}
    </Shell>
  );
}

// ─── Random View ──────────────────────────────────────────────────────────────
interface RandomViewProps {
  meme: Meme | null;
  loading: boolean;
  offline: boolean;
  imgLoaded: boolean;
  setImgLoaded: (v: boolean) => void;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReact: (e: string) => void;
  onRefresh: () => void;
  reaction: string | null;
  reactionAnim: boolean;
  total: number;
  index: number;
}

function RandomView({
  meme, loading, offline, imgLoaded, setImgLoaded,
  isFavorited, onToggleFavorite, onNext, onPrev,
  onReact, onRefresh, reaction, reactionAnim, total, index,
}: RandomViewProps) {
  return (
    <div className="flex flex-col items-center justify-start min-h-full p-4 md:p-8 gap-6">
      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
            Today's Memes 🤣
          </h1>
          {offline && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--panel)", color: "var(--muted)" }}>
              ⚡ Offline mode
            </span>
          )}
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
          style={{ background: "var(--panel)", color: "var(--ink)", border: "1px solid var(--line)" }}
          title="Shuffle memes"
        >
          🔀 Shuffle
        </button>
      </div>

      {/* Meme card */}
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden relative"
        style={{ background: "var(--panel)", border: "1px solid var(--line)", minHeight: "20rem" }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 gap-3">
            <div className="text-5xl animate-bounce">😂</div>
            <p style={{ color: "var(--muted)" }}>Loading funny memes…</p>
          </div>
        ) : meme ? (
          <>
            {/* Skeleton while image loads */}
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: "var(--panel)" }}>
                <div className="text-4xl animate-pulse">🖼️</div>
              </div>
            )}
            <img
              key={meme.url}
              src={meme.url}
              alt={meme.name}
              onLoad={() => setImgLoaded(true)}
              className="w-full object-contain transition-opacity duration-300"
              style={{ maxHeight: "28rem", opacity: imgLoaded ? 1 : 0 }}
            />
            {/* Reaction float */}
            {reaction && (
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ fontSize: "6rem", transition: "all 0.3s", opacity: reactionAnim ? 1 : 0, transform: reactionAnim ? "scale(1.2)" : "scale(0.5)" }}
              >
                {reaction}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-80">
            <p style={{ color: "var(--muted)" }}>No memes found 😢</p>
          </div>
        )}
      </div>

      {/* Meme name + counter */}
      {meme && !loading && (
        <div className="w-full max-w-lg text-center">
          <p className="font-semibold text-lg">{meme.name}</p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>{index + 1} of {total}</p>
        </div>
      )}

      {/* Controls */}
      {!loading && meme && (
        <div className="w-full max-w-lg flex items-center justify-between gap-3">
          <button
            onClick={onPrev}
            className="flex-1 py-3 rounded-xl font-semibold transition-all hover:opacity-80"
            style={{ background: "var(--panel)", border: "1px solid var(--line)", color: "var(--ink)" }}
          >
            ← Prev
          </button>
          <button
            onClick={onToggleFavorite}
            className="py-3 px-5 rounded-xl font-semibold text-xl transition-all hover:scale-110"
            style={{
              background: isFavorited ? "#fee2e2" : "var(--panel)",
              border: "1px solid var(--line)",
              color: isFavorited ? "#ef4444" : "var(--ink)",
            }}
            title={isFavorited ? "Remove from favorites" : "Save to favorites"}
          >
            {isFavorited ? "❤️" : "🤍"}
          </button>
          <button
            onClick={onNext}
            className="flex-1 py-3 rounded-xl font-semibold transition-all hover:opacity-80"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            Next →
          </button>
        </div>
      )}

      {/* Reaction bar */}
      {!loading && meme && (
        <div className="w-full max-w-lg">
          <p className="text-sm font-medium mb-2 text-center" style={{ color: "var(--muted)" }}>React to this meme!</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onReact(emoji)}
                className="text-2xl p-2 rounded-xl transition-all hover:scale-125 hover:bg-opacity-80"
                style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Favorites View ───────────────────────────────────────────────────────────
interface FavoritesViewProps {
  favorites: Meme[];
  onRemove: (id: string) => void;
  onGoRandom: () => void;
}

function FavoritesView({ favorites, onRemove, onGoRandom }: FavoritesViewProps) {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6" style={{ fontFamily: "Fraunces, serif" }}>
        ❤️ Your Favorites
      </h1>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="text-6xl">😢</div>
          <p className="text-lg font-semibold">No favorites yet!</p>
          <p style={{ color: "var(--muted)" }}>Tap ❤️ on memes you love to save them here.</p>
          <button
            onClick={onGoRandom}
            className="mt-4 px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-80"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            Browse Memes 🎲
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((meme) => (
            <div
              key={meme.id}
              className="rounded-2xl overflow-hidden relative group"
              style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
            >
              <img
                src={meme.url}
                alt={meme.name}
                className="w-full object-contain"
                style={{ maxHeight: "16rem" }}
              />
              <div className="p-3 flex items-center justify-between">
                <p className="text-sm font-medium truncate flex-1">{meme.name}</p>
                <button
                  onClick={() => onRemove(meme.id)}
                  className="ml-2 text-lg transition-all hover:scale-125"
                  title="Remove from favorites"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
