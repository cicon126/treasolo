function removeExportArtifacts(svg: SVGSVGElement) {
  svg.querySelectorAll('.anchor-circle').forEach((el) => el.remove());
}

export function exportAsSvg(svgElement: SVGSVGElement, filename: string = 'mindmap.svg') {
  const serializer = new XMLSerializer();
  const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

  const rect = svgElement.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  clonedSvg.setAttribute('width', String(width));
  clonedSvg.setAttribute('height', String(height));
  clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  removeExportArtifacts(clonedSvg);

  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bgRect.setAttribute('width', String(width));
  bgRect.setAttribute('height', String(height));
  bgRect.setAttribute('fill', '#121212');
  clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);

  const svgString = serializer.serializeToString(clonedSvg);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAsPng(svgElement: SVGSVGElement, filename: string = 'mindmap.png', scale: number = 2) {
  const serializer = new XMLSerializer();
  const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

  const rect = svgElement.getBoundingClientRect();
  const width = rect.width * scale;
  const height = rect.height * scale;

  clonedSvg.setAttribute('width', String(width));
  clonedSvg.setAttribute('height', String(height));
  clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  removeExportArtifacts(clonedSvg);

  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bgRect.setAttribute('width', String(width));
  bgRect.setAttribute('height', String(height));
  bgRect.setAttribute('fill', '#121212');
  clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);

  const svgString = serializer.serializeToString(clonedSvg);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#121212';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (blob) {
          const pngUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(pngUrl);
        }
      }, 'image/png');
    }
    URL.revokeObjectURL(url);
  };
  img.src = url;
}
