import { useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import NavBar from "../components/NavBar";
import SelectionModal from "../components/SelectionModal";
import Spinner from "../components/Spinner";
import TrackForm from "../components/TrackForm";
import YouTubePlayer from "../components/YouTubePlayer";
import { API_BASE_URL } from "../config";

export default function App() {
	const [query, setQuery] = useState(() => {
		const saved = sessionStorage.getItem("nt-query");
		return saved ? JSON.parse(saved) : null;
	});
	const [recs, setRecs] = useState([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [loading, setLoading] = useState(false);
	const [prefetching, setPrefetching] = useState(false);
	const [showSelections, setShowSelections] = useState(false);

	// retain preferences across looping prefetches
	const prefsRef = useRef(query?.preferences || {});

	// single controller for all fetches in this session
	const abortCtrlRef = useRef(new AbortController());

	const handleReset = () => {
		// 1) cancel any on-going fetches
		abortCtrlRef.current.abort();

		// 2) clear everything
		sessionStorage.removeItem("nt-query");
		setQuery(null);
		setRecs([]);
		setCurrentIndex(0);
		prefsRef.current = {};
		setLoading(false);
		setPrefetching(false);

		// 3) new controller for next session
		abortCtrlRef.current = new AbortController();
	};

	const handleSubmit = async (newQuery) => {
		sessionStorage.setItem("nt-query", JSON.stringify(newQuery));
		setQuery(newQuery);
		prefsRef.current = newQuery.preferences || {};

		setLoading(true);
		try {
			const resp = await fetch(`${API_BASE_URL}/recommend`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newQuery),
				signal: abortCtrlRef.current.signal, // ← wire up abort
			});
			if (!resp.ok) throw new Error(`Status ${resp.status}`);
			const { recommended_tracks } = await resp.json();
			setRecs(recommended_tracks);
			setCurrentIndex(0);
			startPrefetchLoop(recommended_tracks);
		} catch (err) {
			if (err.name === "AbortError") {
				// aborted by reset, no need to toast
			} else {
				console.error("Initial fetch error:", err);
				toast.error("Failed to fetch recommendations.");
				handleReset();
			}
		} finally {
			setLoading(false);
		}
	};

	const startPrefetchLoop = (batch) => {
		setPrefetching(true);
		(async function loop(lastBatch) {
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
					signal: abortCtrlRef.current.signal, // wiring up abort
				});
				if (!resp.ok) throw new Error(`Status ${resp.status}`);
				const { recommended_tracks: nextBatch } = await resp.json();
				if (!nextBatch.length) {
					setPrefetching(false);
					return;
				}
				setRecs((old) => [...old, ...nextBatch]);
				await loop(nextBatch);
			} catch (err) {
				if (err.name !== "AbortError") {
					console.error("Prefetch loop error:", err);
				}
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
			<NavBar
				onReset={handleReset}
				hasRecs={recs.length > 0}
				onShowSelections={() => setShowSelections(true)}
			/>
			<SelectionModal
				isOpen={showSelections}
				onClose={() => setShowSelections(false)}
				query={query}
			/>

			<div className="flex flex-1 flex-col lg:flex-row gap-y-0 lg:gap-y-6 lg:gap-x-6 overflow-hidden">
				{/* Main area */}
				<main className="flex-1 p-4 max-h-fit min-h-60 lg:max-h-full lg:min-h-0 lg:p-6 overflow-auto relative">
					{loading ? (
						<div className="absolute inset-0 flex items-center justify-center">
							<Spinner size={8} role="status" />
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
										(currentIndex >= recs.length - 1 &&
											prefetching)
									}
									className={`w-32 h-10 flex items-center justify-center rounded ${
										currentIndex >= recs.length - 1 &&
										prefetching
											? "bg-stone-300 cursor-not-allowed"
											: "bg-amber-900 text-white hover:bg-amber-800"
									}`}
								>
									{currentIndex >= recs.length - 1 &&
									prefetching ? (
										<Spinner size={6} color="text-white" />
									) : (
										"Next ▶"
									)}
								</button>
							</div>
						</>
					)}
				</main>

				{/* Recommendation list */}
				<aside className="flex-1 w-full lg:flex-none lg:w-80 bg-white shadow-inner pt-0 px-4 pb-4 lg:p-4 overflow-y-auto">
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
								<span className="text-stone-600 text-sm">
									— {r.artist}
								</span>
							</li>
						))}
					</ul>
					{prefetching && (
						<div className="flex items-center justify-center mt-4 space-x-2">
							<Spinner size={6} />
							<span className="text-stone-700 text-sm">
								Loading more…
							</span>
						</div>
					)}
				</aside>
			</div>

			<ToastContainer
				position="top-center"
				autoClose={2000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				draggable
			/>
		</div>
	);
}
