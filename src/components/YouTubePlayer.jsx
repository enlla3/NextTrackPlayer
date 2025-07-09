import { useEffect, useRef, useState } from "react";
import YouTube from "react-youtube";
import Spinner from "./Spinner";

export default function YouTubePlayer({ artist, title, onEnded }) {
	const [videoId, setVideoId] = useState(null);
	const [error, setError] = useState(null);
	const [idLoading, setIdLoading] = useState(true);
	const [playerReady, setPlayerReady] = useState(false);

	// simple in‐memory cache: { "Artist|||Title": "videoId", … }
	const cacheRef = useRef({});

	useEffect(() => {
		let cancelled = false;
		setVideoId(null);
		setError(null);
		setIdLoading(true);
		setPlayerReady(false);

		const key = `${artist}|||${title}`;
		// if we already fetched this track => short-circuit
		if (cacheRef.current[key]) {
			setVideoId(cacheRef.current[key]);
			setIdLoading(false);
			return;
		}

		(async () => {
			try {
				const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
				const q = encodeURIComponent(`${artist} ${title}`);
				// only request the videoId field
				const url =
					`https://www.googleapis.com/youtube/v3/search` +
					`?part=snippet` +
					`&type=video` +
					`&maxResults=1` +
					`&fields=items(id/videoId)` +
					`&key=${apiKey}` +
					`&q=${q}`;

				const res = await fetch(url);
				if (!res.ok) throw new Error(`YT status ${res.status}`);
				const data = await res.json();
				const vid = data.items?.[0]?.id?.videoId;
				if (!vid) throw new Error("No video found");

				if (!cancelled) {
					cacheRef.current[key] = vid;
					setVideoId(vid);
				}
			} catch (e) {
				if (!cancelled) setError(e.message);
			} finally {
				if (!cancelled) setIdLoading(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [artist, title]);

	if (error) {
		return (
			<div className="absolute inset-0 flex items-center justify-center bg-black/10">
				<p className="text-red-500">Video error: {error}</p>
			</div>
		);
	}

	return (
		<>
			{(idLoading || !playerReady) && (
				<div className="absolute inset-0 flex items-center justify-center bg-black/10">
					<Spinner size={8} color="text-white" />
				</div>
			)}

			{videoId && (
				<YouTube
					videoId={videoId}
					className="w-full h-full"
					opts={{
						width: "100%",
						height: "100%",
						playerVars: { autoplay: 1, controls: 1 },
					}}
					onReady={() => setPlayerReady(true)}
					onEnd={onEnded}
				/>
			)}
		</>
	);
}
