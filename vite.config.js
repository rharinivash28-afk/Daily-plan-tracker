import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Make the main CSS load non-render-blocking so the inline splash + first
// paint aren't held back by the stylesheet download. The full CSS swaps in
// as soon as it arrives (FOUC is avoided by the inline critical styles).
function perfHtml() {
  return {
    name: 'perf-html',
    enforce: 'post',
    transformIndexHtml(html) {
      // 1) Make main CSS non-render-blocking (inline critical styles handle FOUC).
      html = html.replace(
        /<link rel="stylesheet"(\s+crossorigin)? href="(\/assets\/[^"]+\.css)">/,
        (_m, cross, href) =>
          `<link rel="stylesheet"${cross || ''} href="${href}" media="print" onload="this.media='all'">` +
          `<noscript><link rel="stylesheet"${cross || ''} href="${href}"></noscript>`
      )
      // 2) Prioritize the entry + react chunks for a faster LCP; drop preloads
      //    for non-critical chunks (confetti/dates) so they don't compete.
      html = html.replace(/<link rel="modulepreload"[^>]*href="\/assets\/(confetti|dates)-[^"]+\.js">/g, '')
      html = html.replace(/<script type="module"( crossorigin)? src="(\/assets\/[^"]+\.js)">/,
        '<script type="module"$1 src="$2" fetchpriority="high">')
      html = html.replace(/(<link rel="modulepreload"[^>]*href="\/assets\/react-[^"]+\.js")>/,
        '$1 fetchpriority="high">')
      return html
    },
  }
}

export default defineConfig({
  plugins: [react(), perfHtml()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react/') || id.includes('scheduler')) return 'react'
            if (id.includes('framer-motion')) return 'motion'
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) return 'charts'
            if (id.includes('@supabase') || id.includes('supabase')) return 'supabase'
            if (id.includes('lucide-react')) return 'icons'
            if (id.includes('date-fns')) return 'dates'
            if (id.includes('canvas-confetti')) return 'confetti'
          }
        },
      },
    },
  },
})
