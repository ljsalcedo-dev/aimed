interface AimedLogoProps {
	size?: number;
}

function LogoMark({ size = 32 }: AimedLogoProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<rect width="100" height="100" rx="24" fill="#1D9E75" />
			<line x1="50" y1="19" x2="50" y2="81" stroke="white" strokeWidth="9" strokeLinecap="round" />
			<line x1="19" y1="50" x2="81" y2="50" stroke="white" strokeWidth="9" strokeLinecap="round" />
			<circle cx="50" cy="19" r="4.5" fill="white" opacity="0.75" />
			<circle cx="50" cy="81" r="4.5" fill="white" opacity="0.75" />
			<circle cx="19" cy="50" r="4.5" fill="white" opacity="0.75" />
			<circle cx="81" cy="50" r="4.5" fill="white" opacity="0.75" />
			<circle cx="50" cy="50" r="6.5" fill="#085041" />
		</svg>
	);
}

export function AimedLogoCompact({ iconSize = 32, textSize = 22 }: { iconSize?: number; textSize?: number }) {
	return (
		<div className="flex items-center gap-2.5">
			<LogoMark size={iconSize} />
			<span
				style={{
					fontSize: textSize,
					fontWeight: 500,
					letterSpacing: "-0.04em",
					lineHeight: 1,
				}}
			>
				<span style={{ color: "#1D9E75" }}>ai</span>
				<span className="text-foreground">med</span>
			</span>
		</div>
	);
}

export function AimedLogoSidebar() {
	return (
		<div className="flex items-center gap-2.25">
			<LogoMark size={28} />
			<div>
				<div
					style={{
						fontSize: 15,
						fontWeight: 500,
						letterSpacing: "-0.03em",
						lineHeight: 1,
					}}
				>
					<span style={{ color: "#1D9E75" }}>ai</span>
					<span className="text-foreground">med</span>
				</div>
				<div
					className="text-muted-foreground"
					style={{
						fontSize: 9,
						letterSpacing: "0.05em",
						marginTop: 2,
					}}
				>
					AI-powered Medical Review
				</div>
			</div>
		</div>
	);
}

export function AimedLogoFull({ iconSize = 48 }: { iconSize?: number }) {
	return (
		<div className="flex flex-col items-center gap-4">
			<LogoMark size={iconSize} />
			<div className="text-center">
				<div
					style={{
						fontSize: 42,
						fontWeight: 500,
						letterSpacing: "-0.04em",
						lineHeight: 1,
					}}
				>
					<span style={{ color: "#1D9E75" }}>ai</span>
					<span className="text-foreground">med</span>
				</div>
				<div className="text-sm text-muted-foreground mt-2.5 tracking-widest">
					AI-powered Medical Review
				</div>
			</div>
		</div>
	);
}
