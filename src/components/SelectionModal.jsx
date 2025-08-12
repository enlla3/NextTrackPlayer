import { useEffect } from "react";

export default function SelectionModal({ isOpen, onClose, query }) {
	if (!isOpen) return null;

	// close on Escape
	useEffect(() => {
		const h = (e) => e.key === "Escape" && onClose();
		window.addEventListener("keydown", h);
		return () => window.removeEventListener("keydown", h);
	}, [onClose]);

	const tracks = query?.track_ids || [];
	const prefs = query?.preferences || {};

	const join = (v) => (Array.isArray(v) ? v.join(", ") : v ?? "");

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center"
			role="dialog"
			aria-modal="true"
			aria-labelledby="selections-heading"
		>
			{/* backdrop */}
			<div className="absolute inset-0 bg-black/40" onClick={onClose} />

			{/* modal */}
			<div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-[92%] p-6">
				<div className="flex items-start justify-between mb-4">
					<h2
						id="selections-heading"
						className="text-xl font-semibold text-amber-900"
					>
						My Current Selections
					</h2>
					<button
						onClick={onClose}
						className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
						aria-label="Close"
					>
						Close
					</button>
				</div>

				{!query ? (
					<p className="text-gray-600">
						No selections yet. Submit a query to see it here.
					</p>
				) : (
					<div className="space-y-6">
						{/* Tracks */}
						<div>
							<h3 className="font-semibold mb-2">Tracks</h3>
							{tracks.length === 0 ? (
								<p className="text-gray-600">
									No tracks provided.
								</p>
							) : (
								<ul className="space-y-1">
									{tracks.map((t, i) => (
										<li
											key={`${t.artist}-${t.title}-${i}`}
											className="flex items-center justify-between border rounded p-2"
										>
											<span className="font-medium">
												{t.title}
											</span>
											<span className="text-gray-600">
												{t.artist}
											</span>
										</li>
									))}
								</ul>
							)}
						</div>

						{/* Preferences */}
						<div>
							<h3 className="font-semibold mb-2">Preferences</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								<div className="border rounded p-3">
									<p className="text-sm text-gray-500">
										Favorite artists
									</p>
									<p>{join(prefs.favorite_artists)}</p>
								</div>
								<div className="border rounded p-3">
									<p className="text-sm text-gray-500">
										Preferred genres
									</p>
									<p>{join(prefs.preferred_genres)}</p>
								</div>
								<div className="border rounded p-3">
									<p className="text-sm text-gray-500">
										Preferred languages
									</p>
									<p>{join(prefs.preferred_languages)}</p>
								</div>
								<div className="border rounded p-3">
									<p className="text-sm text-gray-500">
										Same artist only
									</p>
									<p>
										{prefs.same_artist_only ? "Yes" : "No"}
									</p>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
