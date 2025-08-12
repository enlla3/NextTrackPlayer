import { useState } from "react";

export default function FindSongsForm({ onFind, loading = false }) {
	const [title, setTitle] = useState("");
	const [artist, setArtist] = useState("");
	const [language, setLanguage] = useState("");

	const canSubmit =
		(title.trim() && !artist.trim()) || (!title.trim() && artist.trim());

	const onSubmit = (e) => {
		e.preventDefault();
		if (!canSubmit) return;
		onFind({
			title: title.trim() || undefined,
			artist: artist.trim() || undefined,
			language: language.trim() || undefined,
			limit: 10,
			page: 1,
		});
	};

	return (
		<form onSubmit={onSubmit} className="space-y-3">
			<h2 className="text-xl font-semibold mb-1 text-amber-900">
				Forgetting something?{" "}
				<span className="font-normal">Find here.</span>
			</h2>

			<div className="text-sm text-stone-600 -mt-1">
				Enter <strong>title</strong> <em>or</em> <strong>artist</strong>{" "}
				(not both).
			</div>

			<input
				className="border p-2 w-full rounded"
				placeholder="Title (if you remember it)"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				aria-label="Find by title"
			/>
			<div className="text-center text-xs text-stone-500">— or —</div>
			<input
				className="border p-2 w-full rounded"
				placeholder="Artist (if you remember it)"
				value={artist}
				onChange={(e) => setArtist(e.target.value)}
				aria-label="Find by artist"
			/>
			<input
				className="border p-2 w-full rounded"
				placeholder="Language (optional, e.g. english, spanish)"
				value={language}
				onChange={(e) => setLanguage(e.target.value)}
				aria-label="Filter by language"
			/>

			<button
				className={`w-full md:w-auto bg-amber-900 text-white px-4 py-2 rounded ${
					!canSubmit || loading
						? "opacity-60 cursor-not-allowed"
						: "hover:bg-amber-800"
				}`}
				disabled={!canSubmit || loading}
			>
				{loading ? "Finding..." : "Find Songs"}
			</button>
		</form>
	);
}
