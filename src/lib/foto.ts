/** Foto responsiva: as imagens locais (/img/x-900.webp) têm um par menor -480. */
export function fonteFoto(url: string) {
  const m = url.match(/^(\/img\/.+)-900\.webp$/);
  return m ? { src: `${m[1]}-480.webp`, srcSet: `${m[1]}-480.webp 480w, ${m[1]}-900.webp 900w` } : { src: url, srcSet: undefined };
}
