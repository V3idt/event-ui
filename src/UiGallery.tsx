import Catalog from '../examples/react/src/Catalog'

/** The clone and independent consumer deliberately render the same catalog. */
export default function UiGallery() {
  return <Catalog cloneHref="/discover" />
}
