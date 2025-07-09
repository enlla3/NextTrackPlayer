// src/components/Spinner.jsx

const SIZE_MAP = {
	1: "h-1 w-1",
	2: "h-2 w-2",
	3: "h-3 w-3",
	4: "h-4 w-4",
	6: "h-6 w-6",
	8: "h-8 w-8",
	12: "h-12 w-12",
};

export default function Spinner({ size = 6, color = "text-amber-900" }) {
	// look up explicit Tailwind class
	const sizeClass = SIZE_MAP[size] || SIZE_MAP[6];

	return (
		<svg
			className={`animate-spin ${sizeClass} ${color}`}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle
				className="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				strokeWidth="4"
			/>
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
			/>
		</svg>
	);
}
