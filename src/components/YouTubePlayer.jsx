import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../config";
import { cacheGet, cacheSet } from "../lib/videoCache";
import Spinner from "./Spinner";

/**
 * Props:
 *  - track: { title, artist }
 *  - playing: boolean
 */
export default function YouTubePlayer({ track, playing }) {
	const [videoId, setVideoId] = useState(null);
	const [loading, setLoading] = useState(false);
	const reqIdRef = useRef(0); // avoid out-of-order responses

	useEffect(() => {
		const title = track?.title;
		const artist = track?.artist;
		if (!title || !artist) return;

		const myReq = ++reqIdRef.current;

		// 1) Try cache immediately
		const cached = cacheGet(title, artist);
		if (cached !== undefined) {
			setVideoId(cached);
			setLoading(false);
			return; // cached hit, no network
		}

		// 2) Otherwise fetch and cache
		setVideoId(null);
		setLoading(true);
		const ctrl = new AbortController();

		(async () => {
			try {
				const q = `${title} ${artist} official audio`;
				const url = `${API_BASE_URL}/yt-search?q=${encodeURIComponent(
					q
				)}`;
				const resp = await fetch(url, { signal: ctrl.signal });
				if (!resp.ok) throw new Error("YouTube search failed");
				const data = await resp.json();
				const vid = data?.videoId ?? null;

				cacheSet(title, artist, vid);

				if (myReq !== reqIdRef.current) return; // stale
				setVideoId(vid);
			} catch (e) {
				if (e.name !== "AbortError") {
					cacheSet(title, artist, null); // negative-cache
					if (myReq === reqIdRef.current) setVideoId(null);
				}
			} finally {
				if (myReq === reqIdRef.current) setLoading(false);
			}
		})();

		return () => ctrl.abort();
	}, [track?.title, track?.artist]);

	return (
		<div className="w-full h-full relative">
			{loading && (
				<div className="absolute inset-0 z-10 grid place-items-center bg-black/50 rounded-xl">
					<Spinner />
				</div>
			)}

			{videoId ? (
				<iframe
					key={videoId} // force reload when the id changes
					className="w-full h-full rounded-xl shadow bg-black"
					src={`https://www.youtube.com/embed/${videoId}?autoplay=${
						playing ? 1 : 0
					}&enablejsapi=1&rel=0&modestbranding=1`}
					title={`${track.title} — ${track.artist}`}
					frameBorder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					allowFullScreen
				/>
			) : !loading ? (
				<div className="w-full h-full rounded-xl shadow grid place-items-center bg-white text-stone-500">
					No video found
				</div>
			) : null}
		</div>
	);
}
