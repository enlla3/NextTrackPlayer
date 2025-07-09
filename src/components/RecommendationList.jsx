export default function RecommendationList({ recs, currentIndex, onPick }) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
			{recs.slice(0, 3).map((r, i) => (
				<div
					key={i}
					onClick={() => onPick(i)}
					className={`p-4 border rounded cursor-pointer transition ${
						i === currentIndex
							? "border-amber-900 bg-amber-100 shadow"
							: "hover:shadow-lg"
					}`}
				>
					<p className="font-semibold">{r.title}</p>
					<p className="text-sm text-gray-600">{r.artist}</p>
				</div>
			))}
		</div>
	);
}
