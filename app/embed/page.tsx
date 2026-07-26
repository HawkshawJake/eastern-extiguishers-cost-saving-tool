import EmbeddedCalculator from './EmbeddedCalculator'

// Rendered on the server so the iframe paints the calculator on first load
// rather than an empty box while the bundle downloads.
export default async function EmbedPage({
  searchParams,
}: {
  searchParams: Promise<{ heading?: string }>
}) {
  const { heading } = await searchParams
  return <EmbeddedCalculator showHeading={heading !== '0'} />
}
