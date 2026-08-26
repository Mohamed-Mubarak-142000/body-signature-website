// Cross-component "the cart changed" signal — fired by anything that
// mutates the cart (add to cart, update quantity, remove, checkout) so the
// header's item-count badge can refetch without a full page navigation.
export const CART_UPDATED_EVENT = "cart:updated";

export function emitCartUpdated() {
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}
