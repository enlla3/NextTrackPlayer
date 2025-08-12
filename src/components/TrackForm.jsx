import { useState } from "react";
import { toast } from "react-toastify";

export default function TrackForm({ onSubmit, loading = false }) {
	const [title, setTitle] = useState("");
	const [artist, setArtist] = useState("");
	const [seeds, setSeeds] = useState([]);

	const [favoriteArtists, setFavoriteArtists] = useState("");
	const [preferredGenres, setPreferredGenres] = useState("");
	const [preferredLanguages, setPreferredLanguages] = useState("");
	const [sameArtistOnly, setSameArtistOnly] = useState(false);

	const addSeed = () => {
		const t = title.trim();
		const a = artist.trim();
		if (!t || !a) {
			toast.error(
				"Please enter both Title and Artist for previous track before adding another."
			);
			return;
		}
		const key = (x) =>
			`${x.artist.toLowerCase()}|||${x.title.toLowerCase()}`;
		const next = { title: t, artist: a };
		if (seeds.some((s) => key(s) === key(next))) {
			toast.info("That track is already added.");
			return;
		}
		setSeeds((prev) => [...prev, next]);
		setTitle("");
		setArtist("");
	};

	const removeSeed = (i) => {
		setSeeds((prev) => prev.filter((_, idx) => idx !== i));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (seeds.length === 0) {
			toast.error(
				"Please fill in both the Title and Artist fields and click 'Add Track' button."
			);
			return;
		}

		const toList = (s) =>
			s
				.split(",")
				.map((x) => x.trim())
				.filter(Boolean);

		const payload = {
			track_ids: seeds,
			preferences: {
				favorite_artists: toList(favoriteArtists),
				preferred_genres: toList(preferredGenres),
				preferred_languages: toList(preferredLanguages),
				same_artist_only: !!sameArtistOnly,
			},
		};

		onSubmit?.(payload);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{/* Seeds chips (render only when there are seeds) */}
			{seeds.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{seeds.map((s, i) => (
						<span
							key={`${s.title}-${s.artist}-${i}`}
							className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200"
							title={`${s.title} — ${s.artist}`}
						>
							<span className="font-medium">{s.title}</span>
							<span className="text-stone-600 text-sm">
								— {s.artist}
							</span>
							<button
								type="button"
								onClick={() => removeSeed(i)}
								className="ml-1 rounded-full px-1.5 py-0.5 hover:bg-amber-200"
								aria-label={`Remove ${s.title} — ${s.artist}`}
							>
								✕
							</button>
						</span>
					))}
				</div>
			)}

			{/* Title / Artist — full width fields (stacked); they fill the card */}
			<input
				className="border p-2 w-full rounded"
				placeholder="Title"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				aria-label="Seed title"
			/>
			<input
				className="border p-2 w-full rounded"
				placeholder="Artist"
				value={artist}
				onChange={(e) => setArtist(e.target.value)}
				aria-label="Seed artist"
			/>

			<button
				type="button"
				onClick={addSeed}
				className="px-4 py-2 rounded bg-amber-200 text-amber-900 hover:bg-amber-300"
			>
				Add Track
			</button>

			{/* Preferences — full width like Find Songs */}
			<input
				className="border p-2 w-full rounded"
				placeholder="Favorite artists (comma-sep)"
				value={favoriteArtists}
				onChange={(e) => setFavoriteArtists(e.target.value)}
				aria-label="Favorite artists"
			/>
			<input
				className="border p-2 w-full rounded"
				placeholder="Preferred genres (comma-sep)"
				value={preferredGenres}
				onChange={(e) => setPreferredGenres(e.target.value)}
				aria-label="Preferred genres"
			/>
			<input
				className="border p-2 w-full rounded"
				placeholder="Preferred languages (comma-sep)"
				value={preferredLanguages}
				onChange={(e) => setPreferredLanguages(e.target.value)}
				aria-label="Preferred languages"
			/>

			<label className="flex items-center gap-2 select-none">
				<input
					type="checkbox"
					className="accent-amber-700"
					checked={sameArtistOnly}
					onChange={(e) => setSameArtistOnly(e.target.checked)}
				/>
				<span>Same artist only</span>
			</label>

			<div className="flex justify-start">
				<button
					type="submit"
					disabled={loading}
					className={`bg-amber-900 text-white px-4 py-2 rounded ${
						loading
							? "opacity-60 cursor-not-allowed"
							: "hover:bg-amber-800"
					}`}
				>
					{loading ? "Getting…" : "Get Recommendations"}
				</button>
			</div>
		</form>
	);
}
