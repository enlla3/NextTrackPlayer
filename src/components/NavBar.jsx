import logo from "../assets/logo.png";

export default function NavBar({ onReset, hasRecs = false, onShowSelections }) {
	return (
		<nav className="bg-amber-200 text-amber-900 p-4 shadow flex items-center justify-between">
			{/* Left: logo + title */}
			<div className="flex items-center space-x-3">
				<img
					src={logo}
					alt="NextTrack Logo"
					className="h-10 object-contain"
				/>
				<span className="text-2xl font-bold whitespace-nowrap">
					NextTrack
				</span>
			</div>

			{/* Right: actions */}
			<div className="flex items-center space-x-2">
				{hasRecs && (
					<button
						type="button"
						onClick={onShowSelections}
						className="px-3 py-2 rounded bg-white text-amber-900 border border-amber-300 hover:bg-amber-50"
					>
						My Current Selections
					</button>
				)}
				{onReset && (
					<button
						type="button"
						onClick={onReset}
						className="px-3 py-2 rounded bg-amber-900 text-white hover:opacity-90"
					>
						Reset
					</button>
				)}
			</div>
		</nav>
	);
}
