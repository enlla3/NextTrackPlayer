import { useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import FindSongsForm from "../components/FindSongsForm";
import NavBar from "../components/NavBar";
import RecommendationList from "../components/RecommendationList";
import ResultsList from "../components/ResultsList";
import Spinner from "../components/Spinner";
import TrackForm from "../components/TrackForm";
import YouTubePlayer from "../components/YouTubePlayer";
import { API_BASE_URL } from "../config";

export default function App() {
	// screens: 'home' (two forms), 'player' (player + list)
	const [screen, setScreen] = useState("home");

	// flows: 'idle' | 'recommend' | 'find'
	const [mode, setMode] = useState("idle");

	// recommendation flow
	const [recs, setRecs] = useState([]);
	const [query, setQuery] = useState(null);

	// find flow
	const [findResults, setFindResults] = useState([]);
	const [findReq, setFindReq] = useState(null);
	const [findPage, setFindPage] = useState(1);

	// player state
	const [currentIndex, setCurrentIndex] = useState(0);
	const [playing, setPlaying] = useState(false);

	// full-screen overlay
	const [overlay, setOverlay] = useState({ show: false, text: "" });

	const abortRef = useRef(null);

	const tracks = useMemo(
		() => (mode === "find" ? findResults : recs),
		[mode, recs, findResults]
	);
	const currentTrack = tracks[currentIndex] || null;

	// ===== Recommendation flow =====
	const handleRecommend = async (payload) => {
		try {
			setOverlay({ show: true, text: "Getting recommendations…" });
			setMode("recommend");
			setFindResults([]);
			setFindReq(null);

			abortRef.current?.abort();
			const ctrl = new AbortController();
			abortRef.current = ctrl;

			const resp = await fetch(`${API_BASE_URL}/recommend`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
				signal: ctrl.signal,
			});
			if (!resp.ok) throw new Error("Failed to get recommendations");
			const data = await resp.json();

			setQuery(payload);
			setRecs(data.recommended_tracks || []);
			setCurrentIndex(0);
			setPlaying(true);
			setScreen("player");
		} catch (e) {
			if (e.name !== "AbortError") toast.error(e.message || "Error");
		} finally {
			setOverlay({ show: false, text: "" });
		}
	};

	// ===== Find flow =====
	const handleFind = async (body) => {
		try {
			setOverlay({ show: true, text: "Finding songs…" });
			setMode("find");
			setRecs([]);
			setQuery(null);

			const resp = await fetch(`${API_BASE_URL}/find-tracks`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			if (!resp.ok) throw new Error("Find tracks failed");
			const data = await resp.json();

			setFindReq({
				title: body.title,
				artist: body.artist,
				language: body.language,
			});
			setFindResults(data.results || []);
			setFindPage(1);
			setCurrentIndex(0);
			setPlaying(true);
			setScreen("player");
		} catch (e) {
			toast.error(e.message || "Error");
		} finally {
			setOverlay({ show: false, text: "" });
		}
	};

	const handleFindMore = async () => {
		if (!findReq) return;
		const nextPage = findPage + 1;
		try {
			setOverlay({ show: true, text: "Finding more songs…" });
			const resp = await fetch(`${API_BASE_URL}/find-tracks`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...findReq, limit: 10, page: nextPage }),
			});
			if (!resp.ok) throw new Error("Find more failed");
			const data = await resp.json();
			const newOnes = (data.results || []).filter(
				(x) =>
					!findResults.some(
						(y) => y.title === x.title && y.artist === x.artist
					)
			);
			setFindResults((prev) => [...prev, ...newOnes]);
			setFindPage(nextPage);
		} catch (e) {
			toast.error(e.message || "Error");
		} finally {
			setOverlay({ show: false, text: "" });
		}
	};

	// ===== Player controls =====
	const pickIndex = (i) => {
		setCurrentIndex(i);
		setPlaying(true);
	};
	const next = () => {
		if (tracks.length === 0) return;
		setCurrentIndex((i) => (i + 1 >= tracks.length ? i : i + 1));
	};
	const prev = () => {
		if (tracks.length === 0) return;
		setCurrentIndex((i) => (i - 1 < 0 ? 0 : i - 1));
	};

	// ===== Reset app =====
	const handleReset = () => {
		setScreen("home");
		setMode("idle");
		setRecs([]);
		setFindResults([]);
		setFindReq(null);
		setCurrentIndex(0);
		setPlaying(false);
		setQuery(null);
		setOverlay({ show: false, text: "" });
	};

	return (
		<div className="flex flex-col min-h-screen bg-amber-50">
			{/* keep your existing NavBar; only onReset is required here */}
			<NavBar onReset={handleReset} />

			{/* HOME: two forms, no player */}
			{screen === "home" && (
				<section className="p-4 lg:p-6 space-y-6">
					<div className="bg-white rounded-2xl shadow p-4 lg:p-6">
						<h2 className="text-xl font-semibold text-amber-900 mb-3">
							Get Recommendations
						</h2>
						<TrackForm onSubmit={handleRecommend} />
					</div>

					<div className="bg-white rounded-2xl shadow p-4 lg:p-6">
						<FindSongsForm onFind={handleFind} />
					</div>
				</section>
			)}

			{/* PLAYER PAGE: player + list only */}
			{screen === "player" && tracks.length > 0 && (
				<div className="flex flex-1 flex-col lg:flex-row gap-y-0 lg:gap-y-6 lg:gap-x-6 overflow-hidden">
					{/* Player */}
					<main className="flex-1 p-4 max-h-fit min-h-60 lg:max-h-full lg:min-h-0 lg:p-6 overflow-auto relative">
						<div className="w-full aspect-video relative">
							{currentTrack && (
								<YouTubePlayer
									track={currentTrack}
									playing={playing}
									onEnd={next}
								/>
							)}
						</div>

						<div className="flex justify-center space-x-4 mt-4">
							<button
								onClick={prev}
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
								onClick={next}
								disabled={currentIndex >= tracks.length - 1}
								className={`w-32 h-10 flex items-center justify-center rounded ${
									currentIndex >= tracks.length - 1
										? "bg-stone-300 cursor-not-allowed"
										: "bg-amber-900 text-white hover:bg-amber-800"
								}`}
							>
								Next ▶
							</button>
						</div>
					</main>

					{/* List (right on lg+, bottom on mobile) */}
					<aside className="flex-1 w-full lg:flex-none lg:w-80 bg-white shadow-inner pt-0 px-4 pb-4 lg:p-4 overflow-y-auto">
						{mode === "find" ? (
							<>
								<ResultsList
									items={findResults}
									currentIndex={currentIndex}
									onPick={pickIndex}
								/>
								<div className="mt-4 p-3 rounded border border-dashed text-sm text-stone-700">
									Still not what you’re looking for?
									<button
										onClick={handleFindMore}
										className="ml-2 px-3 py-1.5 rounded bg-amber-200 text-amber-900 hover:bg-amber-300"
									>
										Find more
									</button>
								</div>
							</>
						) : (
							<RecommendationList
								recs={recs}
								currentIndex={currentIndex}
								onPick={pickIndex}
							/>
						)}
					</aside>
				</div>
			)}

			{/* Full-screen loading overlay using your Spinner */}
			{overlay.show && (
				<div className="fixed inset-0 z-[100] grid place-items-center bg-black/60">
					<div className="flex flex-col items-center gap-4">
						<Spinner />
						<p className="text-white text-lg font-semibold">
							{overlay.text}
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
