import {
  generatedPortrait,
  generatedShowcase,
} from '../content/generatedContent'

export const siteConfig = {
  heroPortrait: {
    src: '/assets/portrait-brand.jpg',
  },
  aboutPortrait: {
    src: generatedPortrait,
  },
  showcase: {
    ariaLabel: '项目影像',
    label: 'IN MOTION',
    caption: 'SELECTED SPACES / 2025—2026',
    scrollSpeed: 0.3,
    items: generatedShowcase,
  },
}
