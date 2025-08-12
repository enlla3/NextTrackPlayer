import { useEffect, useMemo, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import FindSongsForm from "../components/FindSongsForm";
import NavBar from "../components/NavBar";
import RecommendationList from "../components/RecommendationList";
import ResultsList from "../components/ResultsList";
import SelectionModal from "../components/SelectionModal";
import Spinner from "../components/Spinner";
import TrackForm from "../components/TrackForm";
import YouTubePlayer from "../components/YouTubePlayer";
import { API_BASE_URL } from "../config";

export default function App() {
	// screens: home and player
	const [screen, setScreen] = useState("home");

	// flows: idle recommend and find
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

	// selection modal (recommendation flow)
	const [showSelections, setShowSelections] = useState(false);

	// prefetch
	const [prefetching, setPrefetching] = useState(false);
	const prefsRef = useRef({});

	// one controller for the current recommend/prefetch session
	const abortCtrlRef = useRef(new AbortController());

	// keep lists only scroll and use the right active list for the player
	const tracks = useMemo(
		() => (mode === "find" ? findResults : recs),
		[mode, recs, findResults]
	);
	const currentTrack = tracks[currentIndex] || null;

	// Reset everything
	const handleReset = () => {
		try {
			abortCtrlRef.current.abort();
		} catch (_) {}
		abortCtrlRef.current = new AbortController();

		setScreen("home");
		setMode("idle");
		setRecs([]);
		setFindResults([]);
		setFindReq(null);
		setQuery(null);
		setCurrentIndex(0);
		setPlaying(false);
		setPrefetching(false);
		setOverlay({ show: false, text: "" });
	};

	// Recommendation flow
	const handleRecommend = async (payload) => {
		setOverlay({ show: true, text: "Getting recommendations…" });
		setMode("recommend");
		setFindResults([]);
		setFindReq(null);
		setPrefetching(false);

		// keep prefs available for the recursive prefetch loop
		prefsRef.current = payload?.preferences || {};

		// reset controller for this session
		try {
			abortCtrlRef.current.abort();
		} catch (_) {}
		abortCtrlRef.current = new AbortController();

		try {
			const resp = await fetch(`${API_BASE_URL}/recommend`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
				signal: abortCtrlRef.current.signal,
			});
			if (!resp.ok)
				throw new Error(`Recommendations failed (${resp.status})`);
			const data = await resp.json();
			const firstBatch = data?.recommended_tracks || [];
			if (!firstBatch.length) {
				toast.error("No recommendations found.");
				setOverlay({ show: false, text: "" });
				return;
			}

			setQuery(payload);
			setRecs(firstBatch);
			setCurrentIndex(0);
			setPlaying(true);
			setScreen("player");

			// start with the first batch we already have
			startPrefetchLoop(firstBatch);
		} catch (err) {
			if (err.name !== "AbortError") {
				console.error("[recommend] error:", err);
				toast.error("Failed to fetch recommendations.");
			}
			// go back to home if first fetch fails
			setMode("idle");
			setScreen("home");
		} finally {
			setOverlay({ show: false, text: "" });
		}
	};

	const startPrefetchLoop = (batch) => {
		setPrefetching(true);
		(async function loop(lastBatch) {
			// use up to the last 3 tracks as seeds
			const seeds = lastBatch.slice(-3).map((t) => ({
				title: t.title,
				artist: t.artist,
			}));
			if (!seeds.length) {
				setPrefetching(false);
				return;
			}

			const payload = { track_ids: seeds, preferences: prefsRef.current };
			try {
				const resp = await fetch(`${API_BASE_URL}/recommend`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
					signal: abortCtrlRef.current.signal,
				});
				if (!resp.ok)
					throw new Error(`Prefetch failed (${resp.status})`);
				const json = await resp.json();
				const nextBatch = json?.recommended_tracks || [];

				if (!nextBatch.length) {
					setPrefetching(false);
					return;
				}

				// append unique only
				setRecs((old) => {
					const seen = new Set(
						old.map((r) => `${r.artist}|||${r.title}`)
					);
					const unique = nextBatch.filter(
						(r) => !seen.has(`${r.artist}|||${r.title}`)
					);
					return unique.length ? [...old, ...unique] : old;
				});

				// recurse with the batch we just received
				await loop(nextBatch);
			} catch (err) {
				if (err.name !== "AbortError") {
					console.error("[prefetch] loop error:", err);
					toast.error("Problem preloading more recommendations.");
				}
				setPrefetching(false);
			}
		})(batch);
	};

	// Find flow (title OR artist, language optional)
	const handleFind = async (body) => {
		setOverlay({ show: true, text: "Finding songs…" });
		setMode("find");
		setRecs([]);
		setQuery(null);
		setPrefetching(false);

		try {
			const resp = await fetch(`${API_BASE_URL}/find-tracks`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			if (!resp.ok)
				throw new Error(`Find tracks failed (${resp.status})`);
			const data = await resp.json();
			const rows = data?.results || [];
			if (!rows.length) {
				toast.error("No matching songs found.");
				setOverlay({ show: false, text: "" });
				return;
			}

			setFindReq({
				title: body.title,
				artist: body.artist,
				language: body.language,
			});
			setFindResults(rows);
			setFindPage(1);
			setCurrentIndex(0);
			setPlaying(true);
			setScreen("player");
		} catch (err) {
			console.error("[find] error:", err);
			toast.error("Failed to find songs.");
			setMode("idle");
			setScreen("home");
		} finally {
			setOverlay({ show: false, text: "" });
		}
	};

	const handleFindMore = async () => {
		if (!findReq) return;
		const nextPage = findPage + 1;
		setOverlay({ show: true, text: "Finding more songs…" });
		try {
			const resp = await fetch(`${API_BASE_URL}/find-tracks`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...findReq, limit: 10, page: nextPage }),
			});
			if (!resp.ok) throw new Error(`Find more failed (${resp.status})`);
			const data = await resp.json();
			const newOnes = (data.results || []).filter(
				(x) =>
					!findResults.some(
						(y) => y.title === x.title && y.artist === x.artist
					)
			);
			if (!newOnes.length) {
				toast.info("No more results.");
			}
			setFindResults((prev) => [...prev, ...newOnes]);
			setFindPage(nextPage);
		} catch (err) {
			console.error("[find-more] error:", err);
			toast.error("Failed to load more results.");
		} finally {
			setOverlay({ show: false, text: "" });
		}
	};

	// Player controls
	const pickIndex = (i) => {
		setCurrentIndex(i);
		setPlaying(true);
	};
	const next = () => {
		if (!tracks.length) return;
		setCurrentIndex((i) => (i + 1 >= tracks.length ? i : i + 1));
	};
	const prev = () => {
		if (!tracks.length) return;
		setCurrentIndex((i) => (i - 1 < 0 ? 0 : i - 1));
	};

	// stop any in-flight recommend/prefetch when leaving recommendations mode
	useEffect(() => {
		if (mode !== "recommend" && prefetching) {
			try {
				abortCtrlRef.current.abort();
			} catch (_) {}
			abortCtrlRef.current = new AbortController();
			setPrefetching(false);
		}
	}, [mode, prefetching]);

	return (
		// Lock viewport; only inner panes may scroll
		<div className="h-screen overflow-hidden flex flex-col bg-amber-50">
			<NavBar
				onReset={handleReset}
				hasRecs={mode === "recommend" && tracks.length > 0}
				onShowSelections={() => setShowSelections(true)}
				seedCount={query?.track_ids?.length || 0}
				query={query}
			/>

			{/* HOME: two forms, side-by-side on large screens, stacked on small */}
			{screen === "home" && (
				<section className="p-4 lg:p-6 overflow-auto">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Left card: Get Recommendations */}
						<div className="bg-white rounded-2xl shadow p-4 lg:p-6">
							<h2 className="text-xl font-semibold text-amber-900 mb-3">
								Get Recommendations
							</h2>
							<TrackForm onSubmit={handleRecommend} />
						</div>

						{/* Right card: Find Songs */}
						<div className="bg-white rounded-2xl shadow p-4 lg:p-6">
							<h2 className="text-xl font-semibold mb-1 text-amber-900">
								Forgetting something?{" "}
								<span className="font-normal">Find here.</span>
							</h2>
							<p className="text-sm text-stone-600 -mt-1 mb-3">
								Enter <strong>title</strong> <em>or</em>{" "}
								<strong>artist</strong> (not both).
							</p>
							<FindSongsForm onFind={handleFind} />
						</div>
					</div>
				</section>
			)}

			{/* Player page: player + list only*/}
			{screen === "player" && tracks.length > 0 && (
				<div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden gap-y-0 lg:gap-x-6">
					{/* Player pane */}
					<main className="lg:flex-[2] flex-[1] min-h-0 p-4 lg:p-6 overflow-hidden">
						<div className="h-full flex flex-col">
							{/* Player fills remaining space */}
							<div className="flex-1 min-h-0">
								{currentTrack && (
									<YouTubePlayer
										track={currentTrack}
										playing={playing}
										onEnd={next}
									/>
								)}
							</div>

							{/* Transport controls */}
							<div className="shrink-0 flex justify-center gap-4 mt-4">
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
									disabled={
										currentIndex >= tracks.length - 1 &&
										prefetching
									}
									className={`w-32 h-10 flex items-center justify-center rounded ${
										currentIndex >= tracks.length - 1 &&
										prefetching
											? "bg-stone-300 cursor-not-allowed"
											: "bg-amber-900 text-white hover:bg-amber-800"
									}`}
								>
									{currentIndex >= tracks.length - 1 &&
									prefetching ? (
										<Spinner size={6} color="text-white" />
									) : (
										"Next ▶"
									)}
								</button>
							</div>
						</div>
					</main>

					{/* List pane */}
					<aside className="lg:flex-[1] flex-[1] min-h-0 bg-white shadow-inner pt-0 px-4 pb-4 lg:p-4 overflow-hidden">
						{mode === "find" ? (
							// Results: scrollable list + sticky footer button
							<div className="h-full flex flex-col min-h-0">
								<div className="flex-1 min-h-0">
									<ResultsList
										items={findResults}
										currentIndex={currentIndex}
										onPick={pickIndex}
									/>
								</div>

								<div className="shrink-0 mt-4 p-3 rounded border border-dashed text-sm text-stone-700 bg-white sticky bottom-0">
									Still not what you’re looking for?
									<button
										onClick={handleFindMore}
										className="ml-2 px-3 py-1.5 rounded bg-amber-200 text-amber-900 hover:bg-amber-300"
									>
										Find more
									</button>
								</div>
							</div>
						) : (
							<RecommendationList
								recs={recs}
								currentIndex={currentIndex}
								onPick={pickIndex}
								isLoadingMore={prefetching} // small spinner at bottom
							/>
						)}
					</aside>
				</div>
			)}

			{/* Recommendations flow: show seeds and preferences */}
			<SelectionModal
				isOpen={showSelections}
				onClose={() => setShowSelections(false)}
				query={query}
			/>

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

			<ToastContainer
				position="top-center"
				autoClose={2200}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				draggable
				pauseOnFocusLoss={false}
			/>
		</div>
	);
}
