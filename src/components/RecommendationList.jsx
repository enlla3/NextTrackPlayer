export default function RecommendationList({
	recs = [],
	currentIndex = 0,
	onPick,
}) {
	return (
		<div>
			<h2 className="text-xl font-semibold mb-3 text-amber-900">
				All Recommendations
			</h2>
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
				</ul>
			)}
		</div>
	);
}
