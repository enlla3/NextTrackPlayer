import { useRef, useState } from "react";
import NavBar from "../components/NavBar";
import Spinner from "../components/Spinner";
import TrackForm from "../components/TrackForm";
import YouTubePlayer from "../components/YouTubePlayer";

export default function App() {
    // persisted query and preferences
    const [query, setQuery] = useState(() => {
        const saved = sessionStorage.getItem("nt-query");
        return saved ? JSON.parse(saved) : null;
    });
    const [recs, setRecs] = useState([]);           // all recommended tracks
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);   // initial fetch spinner
    const [prefetching, setPrefetching] = useState(false); // dynamic loading
    const prefsRef = useRef(query?.preferences || {});

    // reset everything
    const handleReset = () => {
        sessionStorage.removeItem("nt-query");
        setQuery(null);
        setRecs([]);
        setCurrentIndex(0);
        prefsRef.current = {};
        setPrefetching(false);
    };

    // initial recommendation fetch
    const handleSubmit = async (newQuery) => {
        sessionStorage.setItem("nt-query", JSON.stringify(newQuery));
        setQuery(newQuery);
        prefsRef.current = newQuery.preferences || {};

        setLoading(true);
        try {
            const resp = await fetch("/api/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newQuery),
            });
            if (!resp.ok) throw new Error(`Status ${resp.status}`);
            const { recommended_tracks } = await resp.json();
            setRecs(recommended_tracks);
            setCurrentIndex(0);
            startPrefetchLoop(recommended_tracks);
        } catch (err) {
            console.error("Initial fetch error:", err);
            alert("Failed to fetch recommendations.");
        } finally {
            setLoading(false);
        }
    };

    // keep fetching more based on last 3 tracks
    const startPrefetchLoop = (batch) => {
        setPrefetching(true);
        (async function loop(lastBatch) {
            const seeds = lastBatch.slice(-3).map((t) => ({
                title: t.title,
                artist: t.artist,
            }));
            if (seeds.length === 0) {
                setPrefetching(false);
                return;
            }

            const payload = { track_ids: seeds, preferences: prefsRef.current };
            try {
                const resp = await fetch("/api/recommend", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!resp.ok) throw new Error(`Status ${resp.status}`);
                const { recommended_tracks: nextBatch } = await resp.json();
                if (!Array.isArray(nextBatch) || nextBatch.length === 0) {
                    setPrefetching(false);
                    return;
                }
                setRecs((old) => [...old, ...nextBatch]);
                await loop(nextBatch);
            } catch (err) {
                console.error("Prefetch loop error:", err);
                setPrefetching(false);
            }
        })(batch);
    };

    const handleNext = () => {
        if (currentIndex < recs.length - 1) setCurrentIndex((i) => i + 1);
    };
    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex((i) => i - 1);
    };

    return (
        <div className="flex flex-col min-h-screen bg-amber-50">
            <NavBar onReset={handleReset} />

            <div className="flex flex-1 flex-col lg:flex-row gap-y-6 lg:gap-x-6 overflow-hidden">
                {/* Main player/view area */}
                <main className="flex-1 p-6 overflow-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Spinner size={12} />
                        </div>
                    ) : !query ? (
                        <TrackForm onSubmit={handleSubmit} />
                    ) : (
                        <>
                            <div className="w-full aspect-video relative">
                                <YouTubePlayer
                                    artist={recs[currentIndex]?.artist}
                                    title={recs[currentIndex]?.title}
                                    onEnded={handleNext}
                                />
                            </div>

                            <div className="flex justify-center space-x-4 mt-4">
                                <button
                                    onClick={handlePrev}
                                    disabled={currentIndex === 0}
                                    className={`w-32 h-10 flex items-center justify-center rounded ${
                                        currentIndex === 0
                                            ? "bg-stone-300 cursor-not-allowed"
                                            : "bg-amber-900 text-white hover:bg-amber-800"
                                    }`}
                                >
                                    ◀ Previous
                                </button>

                                <button
                                    onClick={handleNext}
                                    disabled={
                                        !recs.length ||
                                        (currentIndex >= recs.length - 1 && prefetching)
                                    }
                                    className={`w-32 h-10 flex items-center justify-center rounded ${
                                        currentIndex >= recs.length - 1 && prefetching
                                            ? "bg-stone-300 cursor-not-allowed"
                                            : "bg-amber-900 text-white hover:bg-amber-800"
                                    }`}
                                >
                                    {currentIndex >= recs.length - 1 && prefetching ? (
                                        <Spinner size={4} color="text-white" />
                                    ) : (
                                        "Next ▶"
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </main>

                {/* Sidebar with full list */}
                <aside className="w-full lg:w-80 bg-white shadow-inner p-4 overflow-y-auto">
                    <h2 className="text-xl font-semibold mb-3 text-amber-900">
                        All Recommendations
                    </h2>
                    <ul className="space-y-2">
                        {recs.map((r, i) => (
                            <li
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className={`p-2 rounded cursor-pointer transition ${
                                    i === currentIndex
                                        ? "bg-amber-100 font-bold"
                                        : "hover:bg-amber-50"
                                }`}
                            >
                                {r.title}{" "}
                                <span className="text-stone-600 text-sm">— {r.artist}</span>
                            </li>
                        ))}
                    </ul>

                    {prefetching && (
                        <div className="flex items-center justify-center mt-4 space-x-2">
                            <Spinner size={4} />
                            <span className="text-stone-700 text-sm">Loading more…</span>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}
