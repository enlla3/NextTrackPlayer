import { useState } from "react";

export default function TrackForm({ onSubmit }) {
	const [tracks, setTracks] = useState([{ title: "", artist: "" }]);
	const [prefs, setPrefs] = useState({
		favorite_artists: "",
		preferred_genres: "",
		preferred_languages: "",
	});

	const handleTrackChange = (idx, field, val) => {
		const t = [...tracks];
		t[idx][field] = val;
		setTracks(t);
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				const payload = {
					track_ids: tracks.filter((t) => t.title && t.artist),
					preferences: {
						favorite_artists: prefs.favorite_artists
							.split(",")
							.map((s) => s.trim())
							.filter(Boolean),
						preferred_genres: prefs.preferred_genres
							.split(",")
							.map((s) => s.trim())
							.filter(Boolean),
						preferred_languages: prefs.preferred_languages
							.split(",")
							.map((s) => s.trim())
							.filter(Boolean),
					},
				};
				onSubmit(payload);
			}}
			className="space-y-4 max-w-xl mx-auto"
		>
			{tracks.map((t, i) => (
				<div
					key={i}
					className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0"
				>
					<input
						className="border p-2 w-full rounded"
						placeholder="Title"
						value={t.title}
						onChange={(e) =>
							handleTrackChange(i, "title", e.target.value)
						}
					/>
					<input
						className="border p-2 w-full rounded"
						placeholder="Artist"
						value={t.artist}
						onChange={(e) =>
							handleTrackChange(i, "artist", e.target.value)
						}
					/>
					<button
						type="button"
						className="text-red-500 self-start md:self-center"
						onClick={() =>
							setTracks((ts) => ts.filter((_, j) => j !== i))
						}
					>
						✕
					</button>
				</div>
			))}

			<button
				type="button"
				className="text-blue-600"
				onClick={() =>
					setTracks((ts) => [...ts, { title: "", artist: "" }])
				}
			>
				+ Add track
			</button>

			<div className="space-y-2">
				<input
					className="border p-2 w-full rounded"
					placeholder="Favorite artists (comma-sep)"
					value={prefs.favorite_artists}
					onChange={(e) =>
						setPrefs((p) => ({
							...p,
							favorite_artists: e.target.value,
						}))
					}
				/>
				<input
					className="border p-2 w-full rounded"
					placeholder="Preferred genres (comma-sep)"
					value={prefs.preferred_genres}
					onChange={(e) =>
						setPrefs((p) => ({
							...p,
							preferred_genres: e.target.value,
						}))
					}
				/>
				<input
					className="border p-2 w-full rounded"
					placeholder="Preferred languages (comma-sep)"
					value={prefs.preferred_languages}
					onChange={(e) =>
						setPrefs((p) => ({
							...p,
							preferred_languages: e.target.value,
						}))
					}
				/>
			</div>

			<button className="bg-amber-900 text-white px-4 py-2 rounded w-full md:w-auto">
				Get Recommendations
			</button>
		</form>
	);
}
