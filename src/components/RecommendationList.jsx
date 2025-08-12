export default function RecommendationList({
	recs = [],
	currentIndex = 0,
	onPick,
	isLoadingMore = false,
}) {
	return (
		<div className="flex flex-col h-full">
			<h2 className="text-xl font-semibold mb-3 text-amber-900">
				All Recommendations
			</h2>

			{/* Only this area scrolls */}
			<div className="flex-1 min-h-0 overflow-y-auto pr-1">
				{recs.length === 0 ? (
					<p className="text-stone-600">No recommendations yet.</p>
				) : (
					<ul className="space-y-2">
						{recs.map((t, i) => (
							<li
								key={`${t.title}-${t.artist}-${i}`}
								onClick={() => onPick && onPick(i)}
								className={[
									"p-2 rounded cursor-pointer transition",
									i === currentIndex
										? "bg-amber-100 font-bold"
										: "hover:bg-amber-50",
								].join(" ")}
							>
								{t.title}{" "}
								<span className="text-stone-600 text-sm">
									— {t.artist}
								</span>
							</li>
						))}

						{isLoadingMore && (
							<li className="flex justify-center py-3">
								<span
									className="inline-block h-5 w-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"
									aria-label="Loading more recommendations"
								/>
							</li>
						)}
					</ul>
				)}
			</div>
		</div>
	);
}
