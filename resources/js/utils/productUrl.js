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

export const getMarcaUrl = (brand) => {
  if (!brand) return '/';

  // Si el backend ya calculó la URL
  if (brand.seo_url) return brand.seo_url;

  const id = brand.id_marca || brand.id;
  const name = brand.nombre || brand.name || 'marca';
  const slug = name
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `/marcas/${slug || 'marca'}-${id}`;
};
