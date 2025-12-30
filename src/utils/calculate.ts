export function calculateSystemKwp(
  numPanels: number,
  panelRatingW: number
): number {
  return (numPanels * panelRatingW) / 1000;
}
