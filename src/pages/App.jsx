import { useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import FindSongsForm from "../components/FindSongsForm";
import NavBar from "../components/NavBar";
import RecommendationList from "../components/RecommendationList";
import ResultsList from "../components/ResultsList";
import SelectionModal from "../components/SelectionModal";
import TrackForm from "../components/TrackForm";
import YouTubePlayer from "../components/YouTubePlayer";
import { API_BASE_URL } from "../config";

export default function App() {
	// which flow is active: 'idle' | 'recommend' | 'find'
	const [mode, setMode] = useState("idle");

	// recommendation flow
	const [recs, setRecs] = useState([]);
	const [query, setQuery] = useState(null);

	// find flow
	const [findResults, setFindResults] = useState([]);
	const [findReq, setFindReq] = useState(null);
	const [findPage, setFindPage] = useState(1);
	const [findLoading, setFindLoading] = useState(false);

	// shared player state
	const [currentIndex, setCurrentIndex] = useState(0);
	const [playing, setPlaying] = useState(false);
	const [loading, setLoading] = useState(false);
	const abortRef = useRef(null);

	// modal (only meaningful for recommend flow)
	const [showSelections, setShowSelections] = useState(false);

	// active list for the player
	const tracks = useMemo(
		() => (mode === "find" ? findResults : recs),
		[mode, recs, findResults]
	);
	const currentTrack = tracks[currentIndex] || null;

	// ===== Recommendation flow =====
	const handleRecommend = async (payload) => {
		try {
			setLoading(true);
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
		} catch (e) {
			if (e.name !== "AbortError") toast.error(e.message || "Error");
		} finally {
			setLoading(false);
		}
	};

	// ===== Find flow =====
	const handleFind = async (body) => {
		try {
			setFindLoading(true);
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
		} catch (e) {
			toast.error(e.message || "Error");
		} finally {
			setFindLoading(false);
		}
	};

	const handleFindMore = async () => {
		if (!findReq) return;
		const nextPage = findPage + 1;
		try {
			setFindLoading(true);
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
			if (tracks.length === 0 && newOnes.length > 0) {
				setCurrentIndex(0);
				setPlaying(true);
			}
		} catch (e) {
			toast.error(e.message || "Error");
		} finally {
			setFindLoading(false);
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
		setMode("idle");
		setRecs([]);
		setFindResults([]);
		setFindReq(null);
		setCurrentIndex(0);
		setPlaying(false);
		setQuery(null);
	};

	return (
		<div className="flex flex-col min-h-screen bg-amber-50">
			<NavBar
				onReset={handleReset}
				// Only show "My Current Selections" when the recommendation flow is active
				hasRecs={mode === "recommend" && tracks.length > 0}
				onShowSelections={() => setShowSelections(true)}
				seedCount={query?.track_ids?.length || 0}
				query={query}
			/>

			{/* Forms section — always visible, player appears only after a search */}
			<section className="p-4 lg:p-6 space-y-6">
				<div className="bg-white rounded-2xl shadow p-4 lg:p-6">
					<h2 className="text-xl font-semibold text-amber-900 mb-3">
						Get Recommendations
					</h2>
					<TrackForm onSubmit={handleRecommend} loading={loading} />
				</div>

				<div className="bg-white rounded-2xl shadow p-4 lg:p-6">
					<FindSongsForm onFind={handleFind} loading={findLoading} />
				</div>
			</section>

			{/* Player + list — render only when we have tracks */}
			{tracks.length > 0 && (
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

					{/* List — right on lg+, bottom on mobile */}
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
										disabled={findLoading}
									>
										{findLoading
											? "Finding..."
											: "Find more"}
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

			{/* Only meaningful for recommendation flow */}
			<SelectionModal
				isOpen={showSelections}
				onClose={() => setShowSelections(false)}
				query={query}
			/>
		</div>
	);
}
