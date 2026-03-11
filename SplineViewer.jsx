/**
 * SplineViewer.jsx
 * 
 * Componente React para carregar cenas do Spline utilizando o web component
 * <spline-viewer> (sem @splinetool/react-spline).
 * 
 * Remove a marca d'água "Built with Spline" via:
 * 1. CSS global: spline-viewer::part(logo) { display: none !important }
 * 2. MutationObserver: bypass do Shadow DOM com querySelector('#logo').remove()
 * 
 * Uso:
 *   import SplineViewer from './SplineViewer';
 *   <SplineViewer url="https://prod.spline.design/.../scene.splinecode" />
 */

import { useEffect, useRef } from 'react';

const SPLINE_VIEWER_SCRIPT = 'https://unpkg.com/@splinetool/viewer@1.9.82/build/spline-viewer.js';

export default function SplineViewer({
  url = 'https://prod.spline.design/vCwD3PhWh9YH4MO4KWsToCx8/scene.splinecode',
  style = {},
  className = '',
}) {
  const containerRef = useRef(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // ── 1. Injetar o script do <spline-viewer> (uma única vez) ──
    if (!scriptLoadedRef.current && !document.querySelector(`script[src="${SPLINE_VIEWER_SCRIPT}"]`)) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = SPLINE_VIEWER_SCRIPT;
      document.head.appendChild(script);
      scriptLoadedRef.current = true;
    }

    // ── 2. Criar o elemento <spline-viewer> ──
    const container = containerRef.current;
    if (!container) return;

    const viewer = document.createElement('spline-viewer');
    viewer.setAttribute('url', url);
    viewer.style.width = '100%';
    viewer.style.height = '100%';
    viewer.style.display = 'block';
    container.innerHTML = '';
    container.appendChild(viewer);

    // ── 3. Função para remover a marca d'água (#logo) do Shadow DOM ──
    const removeLogo = (root) => {
      if (!root) return false;
      const logo = root.querySelector('#logo');
      if (logo) {
        logo.remove();
        console.log('[SplineViewer] Watermark removed via MutationObserver');
        return true;
      }
      return false;
    };

    // ── 4. Observar o Shadow DOM para remoção dinâmica ──
    const observeShadowRoot = (shadowRoot) => {
      // Tentativa imediata
      removeLogo(shadowRoot);

      // Observer para nós adicionados dinamicamente
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.id === 'logo' || (node.querySelector && node.querySelector('#logo'))) {
              removeLogo(shadowRoot);
            }
          }
        }
      });

      observer.observe(shadowRoot, { childList: true, subtree: true });
      return observer;
    };

    let shadowObserver = null;
    let viewerObserver = null;

    // ── 5. Aguardar o shadowRoot ser criado ──
    const waitForShadowRoot = () => {
      if (viewer.shadowRoot) {
        shadowObserver = observeShadowRoot(viewer.shadowRoot);
        return;
      }

      // O shadowRoot ainda não existe — observar o viewer até que seja criado
      viewerObserver = new MutationObserver(() => {
        if (viewer.shadowRoot) {
          shadowObserver = observeShadowRoot(viewer.shadowRoot);
          viewerObserver.disconnect();
          viewerObserver = null;
        }
      });

      viewerObserver.observe(viewer, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    };

    waitForShadowRoot();

    // ── 6. Fallback: retry periódico por 10 segundos ──
    let attempts = 0;
    const maxAttempts = 20;
    const retryInterval = setInterval(() => {
      attempts++;
      if (viewer.shadowRoot) {
        removeLogo(viewer.shadowRoot);
      }
      if (attempts >= maxAttempts) {
        clearInterval(retryInterval);
      }
    }, 500);

    // ── Cleanup ──
    return () => {
      clearInterval(retryInterval);
      if (shadowObserver) shadowObserver.disconnect();
      if (viewerObserver) viewerObserver.disconnect();
      if (container) container.innerHTML = '';
    };
  }, [url]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    />
  );
}
