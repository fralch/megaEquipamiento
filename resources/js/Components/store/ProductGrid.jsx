import React, { useState, useEffect } from 'react';

const ProductGrid = ({ products: initialProducts }) => {
  const [products, setProducts] = useState(initialProducts || []);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 24;

  const countryCodeMap = {
    'afganistán': 'af',
    'albania': 'al',
    'alemania': 'de',
    'andorra': 'ad',
    'angola': 'ao',
    'antigua y barbuda': 'ag',
    'arabia saudita': 'sa',
    'argelia': 'dz',
    'argentina': 'ar',
    'armenia': 'am',
    'australia': 'au',
    'austria': 'at',
    'azerbaiyán': 'az',
    'bahamas': 'bs',
    'bangladés': 'bd',
    'barbados': 'bb',
    'baréin': 'bh',
    'bélgica': 'be',
    'belice': 'bz',
    'benín': 'bj',
    'bielorrusia': 'by',
    'birmania': 'mm',
    'bolivia': 'bo',
    'bosnia y herzegovina': 'ba',
    'botsuana': 'bw',
    'brasil': 'br',
    'brunéi': 'bn',
    'bulgaria': 'bg',
    'burkina faso': 'bf',
    'burundi': 'bi',
    'bután': 'bt',
    'cabo verde': 'cv',
    'camboya': 'kh',
    'camerún': 'cm',
    'canadá': 'ca',
    'catar': 'qa',
    'chad': 'td',
    'chile': 'cl',
    'china': 'cn',
    'chipre': 'cy',
    'colombia': 'co',
    'comoras': 'km',
    'corea del norte': 'kp',
    'corea del sur': 'kr',
    'costa de marfil': 'ci',
    'costa rica': 'cr',
    'croacia': 'hr',
    'cuba': 'cu',
    'dinamarca': 'dk',
    'dominica': 'dm',
    'ecuador': 'ec',
    'egipto': 'eg',
    'el salvador': 'sv',
    'emiratos árabes unidos': 'ae',
    'eslovaquia': 'sk',
    'eslovenia': 'si',
    'españa': 'es',
    'estados unidos': 'us',
    'estonia': 'ee',
    'etiopía': 'et',
    'filipinas': 'ph',
    'finlandia': 'fi',
    'fiyi': 'fj',
    'francia': 'fr',
    'gabón': 'ga',
    'gambia': 'gm',
    'georgia': 'ge',
    'ghana': 'gh',
    'granada': 'gd',
    'grecia': 'gr',
    'guatemala': 'gt',
    'guinea': 'gn',
    'guinea-bisáu': 'gw',
    'guinea ecuatorial': 'gq',
    'guyana': 'gy',
    'haití': 'ht',
    'honduras': 'hn',
    'hungría': 'hu',
    'india': 'in',
    'indonesia': 'id',
    'irak': 'iq',
    'irán': 'ir',
    'irlanda': 'ie',
    'islandia': 'is',
    'israel': 'il',
    'italia': 'it',
    'jamaica': 'jm',
    'japón': 'jp',
    'jordania': 'jo',
    'kazajistán': 'kz',
    'kenia': 'ke',
    'kirguistán': 'kg',
    'kiribati': 'ki',
    'kuwait': 'kw',
    'laos': 'la',
    'letonia': 'lv',
    'líbano': 'lb',
    'liberia': 'lr',
    'libia': 'ly',
    'liechtenstein': 'li',
    'lituania': 'lt',
    'luxemburgo': 'lu',
    'madagascar': 'mg',
    'malasia': 'my',
    'malaui': 'mw',
    'maldivas': 'mv',
    'mali': 'ml',
    'malta': 'mt',
    'marruecos': 'ma',
    'mauricio': 'mu',
    'mauritania': 'mr',
    'méxico': 'mx',
    'micronesia': 'fm',
    'moldavia': 'md',
    'mónaco': 'mc',
    'mongolia': 'mn',
    'montenegro': 'me',
    'mozambique': 'mz',
    'namibia': 'na',
    'nauru': 'nr',
    'nepal': 'np',
    'nicaragua': 'ni',
    'nigeria': 'ng',
    'noruega': 'no',
    'nueva zelanda': 'nz',
    'omán': 'om',
    'países bajos': 'nl',
    'pakistán': 'pk',
    'palaos': 'pw',
    'panamá': 'pa',
    'papúa nueva guinea': 'pg',
    'paraguay': 'py',
    'perú': 'pe',
    'polonia': 'pl',
    'portugal': 'pt',
    'reino unido': 'gb',
    'república checa': 'cz',
    'república dominicana': 'do',
    'ruanda': 'rw',
    'rumania': 'ro',
    'rusia': 'ru',
    'samoa': 'ws',
    'san marino': 'sm',
    'santa lucía': 'lc',
    'santo tomé y príncipe': 'st',
    'senegal': 'sn',
    'serbia': 'rs',
    'singapur': 'sg',
    'siria': 'sy',
    'sri lanka': 'lk',
    'sudáfrica': 'za',
    'sudán': 'sd',
    'suecia': 'se',
    'suiza': 'ch',
    'surinam': 'sr',
    'tailandia': 'th',
    'tanzania': 'tz',
    'tayikistán': 'tj',
    'timor oriental': 'tl',
    'togo': 'tg',
    'tonga': 'to',
    'trinidad y tobago': 'tt',
    'túnez': 'tn',
    'turquía': 'tr',
    'turkmenistán': 'tm',
    'ucrania': 'ua',
    'uganda': 'ug',
    'uruguay': 'uy',
    'uzbekistán': 'uz',
    'vanuatu': 'vu',
    'venezuela': 've',
    'vietnam': 'vn',
    'yemen': 'ye',
    'zambia': 'zm',
    'zimbabue': 'zw'
  };

  useEffect(() => {
    if (!initialProducts || initialProducts.length === 0) {
      const fetchProducts = async () => {
        try {
          const response = await fetch('http://127.0.0.1:8000/product/all');
          const data = await response.json();

          const transformedProducts = data.map(item => {
            const countryName = item.pais.toLowerCase();
            const countryCode = countryCodeMap[countryName] || 'unknown';
            return {
              id: item.id_producto,
              title: item.nombre,
              diameter: item.caracteristicas?.Dimensiones || 'N/A',
              material: item.caracteristicas?.Marca || 'N/A',
              brand: item.caracteristicas?.Marca || 'N/A',
              origin: item.pais,
              price: parseFloat(item.precio_igv),
              image: item.imagen,
              flag: `https://flagcdn.com/w320/${countryCode}.png`,
              description: item.descripcion
            };
          });

          setProducts(transformedProducts);
        } catch (error) {
          console.error('Error fetching products:', error);
        }
      };

      fetchProducts();
    } else {
      const transformedProducts = initialProducts.map(item => {
        const countryName = item.pais.toLowerCase();
        const countryCode = countryCodeMap[countryName] || 'unknown';
        return {
          id: item.id_producto,
          title: item.nombre,
          diameter: item.caracteristicas?.Dimensiones || 'N/A',
          material: item.caracteristicas?.Marca || 'N/A',
          brand: item.caracteristicas?.Marca || 'N/A',
          origin: item.pais,
          price: parseFloat(item.precio_igv),
          image: item.imagen,
          flag: `https://flagcdn.com/w320/${countryCode}.png`,
          description: item.descripcion
        };
      });

      setProducts(transformedProducts);
    }
  }, [initialProducts]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(products.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
        {currentProducts.map((product) => (
          <Card key={product.id} product={product} />
        ))}
      </div>
      <div className="flex justify-center space-x-2 mt-4">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => handlePageChange(i + 1)}
            className={`px-4 py-2 rounded ${
              currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

const Card = ({ product }) => {
  return (
    <div className="max-w-sm mx-auto bg-white rounded-lg shadow-md overflow-hidden border min-h-[400px] relative group">
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-64 object-contain p-4"
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800">{product.title}</h2>
        <p className="text-sm text-gray-600">
          <strong>Diámetro:</strong> {product.diameter}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Material:</strong> {product.material}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Marca:</strong> {product.brand}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Procedencia:</strong> {product.origin}
        </p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-bold text-blue-600">
            ${product.price}
          </span>
          <img
            src={product.flag}
            alt={`Bandera de ${product.origin}`}
            className="w-6 h-4 object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/path/to/default-flag.png';
            }}
          />
        </div>
      </div>

      <div className="absolute inset-0 bg-gray-800 bg-opacity-90 text-white flex flex-col justify-start items-center transition-opacity duration-300 opacity-0 group-hover:opacity-100 p-4 overflow-y-auto max-h-full">
        <h2 className="text-2xl font-semibold mb-4 text-center">{product.title}</h2>
        <div className="text-sm text-gray-300 mb-2 space-y-2">
          <p>
            <strong>Diámetro:</strong> {product.diameter}
          </p>
          <p>
            <strong>Material:</strong> {product.material}
          </p>
          <p>
            <strong>Marca:</strong> {product.brand}
          </p>
          <p>
            <strong>Procedencia:</strong> {product.origin}
          </p>
          <div
            className="mb-4"
            dangerouslySetInnerHTML={{ __html: product.description }}
          ></div>
        </div>
        <div className="flex space-x-4 mt-auto">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
            Añadir al carrito
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md">
            Comparar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;
