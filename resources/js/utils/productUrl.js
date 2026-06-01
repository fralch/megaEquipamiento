export const getProductUrl = (product) => {
  if (!product) {
    return '/';
  }

  if (product.product_url) {
    return product.product_url;
  }

  const id = product.id_producto || product.id;
  const title = product.nombre || product.title || 'producto';
  const slug = title
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `/producto/${slug || 'producto'}-${id}`;
};
