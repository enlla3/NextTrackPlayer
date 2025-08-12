import logo from "../assets/logo.png";

export default function NavBar({
	onReset,
	hasRecs = false,
	onShowSelections,
	seedCount = 0,
	query = null,
}) {
	const sameArtistOnly = !!query?.preferences?.same_artist_only;

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
						title={
							query
								? `View your selections (${seedCount} seed${
										seedCount === 1 ? "" : "s"
								  }${
										sameArtistOnly
											? ", Same artist only"
											: ""
								  })`
								: "View your selections"
						}
						className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-white text-amber-900 border border-amber-300 hover:bg-amber-50 active:scale-[.98] transition"
					>
						{/* Mobile: icon + badge */}
						<span className="sm:hidden relative inline-flex">
							{/* list icon  */}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="h-5 w-5"
								aria-hidden="true"
							>
								<path d="M4 6.75A.75.75 0 0 1 4.75 6h14.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 6.75Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 12Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H4.75a.75.75 0 0 1-.75-.75Z" />
							</svg>

							{seedCount > 0 && (
								<span className="absolute -top-1 -right-1 inline-flex items-center justify-center text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] bg-amber-600 text-white">
									{seedCount}
								</span>
							)}
						</span>

						{/* Desktop: label + badge + chip */}
						<span className="hidden sm:inline">
							My Current Selections
						</span>

						{seedCount > 0 && (
							<span className="hidden sm:inline-flex items-center justify-center text-xs font-semibold rounded-full min-w-[22px] h-[22px] bg-amber-600 text-white">
								{seedCount}
							</span>
						)}

						{sameArtistOnly && (
							<span className="hidden sm:inline text-[11px] ml-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
								Same artist
							</span>
						)}
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
