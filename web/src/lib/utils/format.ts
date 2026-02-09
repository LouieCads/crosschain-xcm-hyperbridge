export function formatAddress(address: string | undefined): string {
	if (!address) return '';
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatNumber(value: number | bigint): string {
	return value.toLocaleString();
}

export function formatTokenAmount(amount: bigint, decimals: number = 18): string {
	const divisor = BigInt(10 ** decimals);
	const wholePart = amount / divisor;
	const fractionalPart = amount % divisor;
	
	if (fractionalPart === 0n) {
		return wholePart.toString();
	}
	
	const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
	const trimmedFractional = fractionalStr.replace(/0+$/, '');
	
	return `${wholePart}.${trimmedFractional}`;
}
