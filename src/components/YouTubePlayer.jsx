import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../config";

/**
 * Props:
 *  - track: { title, artist }
 *  - playing: boolean
 *  - onEnd?: () => void
 */
export default function YouTubePlayer({ track, playing, onEnd }) {
	const [videoId, setVideoId] = useState(null);
	const reqIdRef = useRef(0); // guard against out-of-order results

	useEffect(() => {
		if (!track?.title || !track?.artist) return;

		const myReqId = ++reqIdRef.current;
		setVideoId(null);

		const controller = new AbortController();
		(async () => {
			try {
				const resp = await fetch(`${API_BASE_URL}/yt-search`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						title: track.title,
						artist: track.artist,
					}),
					signal: controller.signal,
				});
				if (!resp.ok) throw new Error("YouTube search failed");
				const data = await resp.json();

				// only the latest in-flight request can update the player
				if (myReqId !== reqIdRef.current) return;

				setVideoId(data?.videoId || null);
			} catch (e) {
				if (e.name !== "AbortError") setVideoId(null);
			}
		})();

		return () => controller.abort();
	}, [track?.title, track?.artist]);

	return (
		<div className="w-full h-full">
			{videoId ? (
				<iframe
					key={videoId} // force-remount on new video
					className="w-full h-full rounded-xl shadow bg-black"
					src={`https://www.youtube.com/embed/${videoId}?autoplay=${
						playing ? 1 : 0
					}&enablejsapi=1&rel=0&modestbranding=1`}
					title={`${track.title} — ${track.artist}`}
					frameBorder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					allowFullScreen
				/>
			) : (
				<div className="w-full h-full rounded-xl shadow grid place-items-center bg-white text-stone-500">
					Finding a playable video…
				</div>
			)}
		</div>
	);
}
