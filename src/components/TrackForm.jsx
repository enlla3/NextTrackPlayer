import { useState } from "react";

export default function TrackForm({ onSubmit }) {
	const [tracks, setTracks] = useState([{ title: "", artist: "" }]);
	const [prefs, setPrefs] = useState({
		favorite_artists: "",
		preferred_genres: "",
		preferred_languages: "",
		same_artist_only: false, // ← default off
	});

	const handleTrackChange = (idx, field, val) => {
		setTracks((prev) => {
			const next = [...prev];
			next[idx] = { ...next[idx], [field]: val };
			return next;
		});
	};

	const addTrack = () =>
		setTracks((prev) => [...prev, { title: "", artist: "" }]);

	const removeTrack = (idx) =>
		setTracks((prev) => prev.filter((_, i) => i !== idx));

	const parseList = (s) =>
		s
			.split(",")
			.map((x) => x.trim())
			.filter(Boolean);

	const handleSubmit = (e) => {
		e.preventDefault();
		const payload = {
			track_ids: tracks.filter((t) => t.title && t.artist),
			preferences: {
				favorite_artists: parseList(prefs.favorite_artists),
				preferred_genres: parseList(prefs.preferred_genres),
				preferred_languages: parseList(prefs.preferred_languages),
				same_artist_only: !!prefs.same_artist_only, // ← wired to checkbox
			},
		};
		onSubmit(payload);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
			{/* Tracks input list */}
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
					{i > 0 && (
						<button
							type="button"
							onClick={() => removeTrack(i)}
							className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
							aria-label={`Remove track ${i + 1}`}
						>
							Remove
						</button>
					)}
				</div>
			))}

			<div>
				<button
					type="button"
					onClick={addTrack}
					className="px-4 py-2 rounded bg-amber-200 text-amber-900 hover:bg-amber-300"
				>
					Add Track
				</button>
			</div>

			{/* Preferences */}
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

				{/* Same-artist checkbox */}
				<div className="flex items-center space-x-2">
					<input
						id="sameArtistOnly"
						type="checkbox"
						className="h-4 w-4"
						checked={!!prefs.same_artist_only}
						onChange={(e) =>
							setPrefs((p) => ({
								...p,
								same_artist_only: e.target.checked,
							}))
						}
					/>
					<label htmlFor="sameArtistOnly" className="text-sm">
						Same artist only
					</label>
				</div>
			</div>

			<button className="bg-amber-900 text-white px-4 py-2 rounded w-full md:w-auto">
				Get Recommendations
			</button>
		</form>
	);
}
