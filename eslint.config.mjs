// ESLint flat config (ESLint 10 / Next 16). `next lint` a été retiré en Next 16 ;
// on lance ESLint directement (`eslint .`).
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextCoreWebVitals,
  {
    ignores: ['.next/**', 'node_modules/**', 'public/**'],
  },
];

export default config;
