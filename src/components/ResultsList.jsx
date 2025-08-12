export default function ResultsList({ items, currentIndex, onPick }) {
	return (
		<div className="flex flex-col h-full">
			<h2 className="text-xl font-semibold mb-3 text-amber-900">
				Results
			</h2>

			{/* Only this area scrolls */}
			<div className="flex-1 min-h-0 overflow-y-auto pr-1">
				{items.length === 0 ? (
					<p className="text-stone-600">No results yet.</p>
				) : (
					<ul className="space-y-2">
						{items.map((t, i) => (
							<li
								key={`${t.title}-${t.artist}-${i}`}
								onClick={() => onPick(i)}
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
		</div>
	);
}
