import { useEffect, useRef, useState } from 'react'
import ImageLightbox from './components/ImageLightbox'
import { siteConfig } from './config/site'
import { generatedProjects } from './content/generatedContent'
import SimpleCursor from './components/SimpleCursor'

const strengths = [
  {
    index: '01',
    title: '空间规划',
    en: 'SPATIAL PLANNING',
    copy: '从家庭结构、生活习惯和采光条件出发，重新梳理平面关系与空间尺度，让每一平方米都真正参与到日常使用中。',
    tags: ['平面布局', '动线梳理', '尺度推演'],
  },
  {
    index: '02',
    title: '材质与光影',
    en: 'MATERIAL & LIGHT',
    copy: '通过木饰面、石材、织物与涂料的关系，配合自然光和人工照明，建立空间温度、层次与长久耐看的质感。',
    tags: ['材质搭配', '灯光设计', '色彩体系'],
  },
  {
    index: '03',
    title: '收纳与功能',
    en: 'STORAGE & FLOW',
    copy: '把柜体、设备、隐形门和日常杂物纳入整体设计，让收纳融入空间秩序，而不是成为入住后的补丁。',
    tags: ['系统收纳', '功能整合', '设备协调'],
  },
  {
    index: '04',
    title: '软装与陈设',
    en: 'FURNISHING & STYLING',
    copy: '从家具尺度、窗帘地毯到灯具与艺术陈设，控制空间最后百分之十的气质，让居住画面自然完整。',
    tags: ['家具选型', '布艺搭配', '艺术陈设'],
  },
  {
    index: '05',
    title: '深化与落地',
    en: 'DETAIL & DELIVERY',
    copy: '以完整施工图、节点收口和现场交底连接设计理想，持续跟进关键工序，保证最终效果与最初方案一致。',
    tags: ['施工深化', '节点收口', '现场交底'],
  },
]

const awards = [
  '2025 全球人居美学住宅空间奖',
  '40UNDER40（宁德）当代设计杰出青年',
  '2024 宁德十大高定家具空间设计师',
  '2025 东方杰出设计',
  '2025 年度设计新秀',
  '2025 金住奖（宁德）十大居住空间设计师',
  '2025 城市智能豪宅新势力',
  '2025—2026 湾区设计同盟福建站 宁德地区执行主任',
]

const pricing = [
  {
    index: '01',
    en: 'DESIGN ONLY',
    title: '纯设计',
    price: '150',
    description: '适合自行组织施工与主材采购，需要完整设计成果与方向把控的项目。',
    items: ['概念方案与空间规划', '效果呈现与材质建议', '施工图深化与交底'],
  },
  {
    index: '02',
    en: 'SEMI-PACKAGE',
    title: '半包',
    price: '900',
    description: '设计与基础施工协同推进，适合希望设计标准和施工品质稳定衔接的项目。',
    items: ['完整设计服务', '基础施工与辅材', '关键节点现场配合'],
  },
  {
    index: '03',
    en: 'SEMI-MANAGEMENT',
    title: '半托管',
    price: '1800',
    description: '在设计与半包基础上，进一步介入主材、节点和现场效果管理。',
    items: ['设计与基础施工', '主材选择与采购协同', '现场进度与落地跟进'],
    featured: true,
  },
  {
    index: '04',
    en: 'FULL MANAGEMENT',
    title: '全案托管',
    price: '3000',
    description: '从空间策略到最终交付的系统化服务，适合追求完整落地与省心体验的项目。',
    items: ['全流程设计统筹', '主材、施工与软装管理', '节点验收与最终交付'],
  },
]

function Arrow({ direction = 'diagonal' }) {
  return (
    <svg
      aria-hidden="true"
      className={`arrow arrow--${direction}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path d="M5 19 19 5M8 5h11v11" />
    </svg>
  )
}

function Cross({ className = '' }) {
  return (
    <span className={`cross ${className}`} aria-hidden="true">
      <span />
      <span />
    </span>
  )
}

function ShowcaseMedia({ item, autoplay = false }) {
  if (item.type === 'video') {
    return (
      <video
        autoPlay={autoplay}
        muted
        loop
        playsInline
        preload={autoplay ? 'metadata' : 'none'}
        poster={item.poster}
        aria-label={item.alt || undefined}
      >
        <source src={item.src} />
      </video>
    )
  }

  return <img src={item.src} alt={item.alt || ''} loading="lazy" />
}

function ProjectMarquee({ config, items: sourceItems }) {
  const sectionRef = useRef(null)
  const rowOneRef = useRef(null)
  const rowTwoRef = useRef(null)
  const items = sourceItems.filter((item) => item?.src)

  useEffect(() => {
    let frame = 0

    const updatePosition = () => {
      const section = sectionRef.current
      const rowOne = rowOneRef.current
      const rowTwo = rowTwoRef.current
      if (!section || !rowOne || !rowTwo) return

      const offset =
        (window.scrollY - section.offsetTop + window.innerHeight) * config.scrollSpeed
      const unit = rowOne.scrollWidth / 3
      rowOne.style.transform = `translate3d(${-unit + offset}px, 0, 0)`
      rowTwo.style.transform = `translate3d(${-unit - offset}px, 0, 0)`
    }

    const handleScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(updatePosition)
    }

    updatePosition()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [config.scrollSpeed, items.length])

  if (!items.length) return null

  const reversedItems = items.slice().reverse()
  const rowOne = [...items, ...items, ...items]
  const rowTwo = [...reversedItems, ...reversedItems, ...reversedItems]

  return (
    <section className="project-marquee" ref={sectionRef} aria-label={config.ariaLabel}>
      <div className="marquee-label">
        <span>{config.label}</span>
        <div className="marquee-label-actions">
          <span>{config.caption}</span>
        </div>
      </div>
      <div className="marquee-window">
        <div className="marquee-row" ref={rowOneRef}>
          {rowOne.map((item, index) => (
            <figure key={`one-${item.src}-${index}`}>
              <ShowcaseMedia item={item} autoplay={index < items.length} />
              <span>{String((index % items.length) + 1).padStart(2, '0')}</span>
            </figure>
          ))}
        </div>
        <div className="marquee-row" ref={rowTwoRef}>
          {rowTwo.map((item, index) => (
            <figure key={`two-${item.src}-${index}`}>
              <ShowcaseMedia item={item} autoplay={index < items.length} />
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [imageGallery, setImageGallery] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const heroRef = useRef(null)

  const allProjects = generatedProjects.map((project, index) => ({
    ...project,
    number: String(index + 1).padStart(2, '0'),
    subtitle: project.subtitle || project.category,
    images: project.imageUrls || project.images,
  }))

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotionPreference = () => setReducedMotion(media.matches)
    syncMotionPreference()
    media.addEventListener('change', syncMotionPreference)
    return () => media.removeEventListener('change', syncMotionPreference)
  }, [])

  useEffect(() => {
    const revealItems = document.querySelectorAll('[data-reveal]')
    if (!window.IntersectionObserver) {
      revealItems.forEach((item) => item.classList.add('is-visible'))
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.14, rootMargin: '0px 0px -5% 0px' },
    )

    revealItems.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const updateScrollState = () => {
      setScrolled(window.scrollY > 24)
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0
      document.documentElement.style.setProperty('--scroll-progress', `${progress}%`)
    }

    updateScrollState()
    window.addEventListener('scroll', updateScrollState, { passive: true })
    return () => window.removeEventListener('scroll', updateScrollState)
  }, [])

  useEffect(() => {
    const hero = heroRef.current
    if (!hero || reducedMotion || !window.matchMedia('(pointer: fine)').matches) {
      return undefined
    }

    let frame = 0
    let pointerX = 0
    let pointerY = 0

    const applyParallax = () => {
      hero.style.setProperty('--hero-scene-x', `${(pointerX * 14).toFixed(2)}px`)
      hero.style.setProperty('--hero-scene-y', `${(pointerY * 9).toFixed(2)}px`)
      hero.style.setProperty('--hero-content-x', `${(pointerX * -5).toFixed(2)}px`)
      hero.style.setProperty('--hero-content-y', `${(pointerY * -3).toFixed(2)}px`)
      hero.style.setProperty('--hero-glow-x', `${(50 + pointerX * 34).toFixed(2)}%`)
      hero.style.setProperty('--hero-glow-y', `${(38 + pointerY * 28).toFixed(2)}%`)
    }

    const handlePointerMove = (event) => {
      pointerX = (event.clientX / window.innerWidth) * 2 - 1
      pointerY = (event.clientY / window.innerHeight) * 2 - 1
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(applyParallax)
    }

    const resetParallax = () => {
      pointerX = 0
      pointerY = 0
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(applyParallax)
    }

    applyParallax()
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('blur', resetParallax)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('blur', resetParallax)
    }
  }, [reducedMotion])

  useEffect(() => {
    const cards = [...document.querySelectorAll('.project-stack-card')]
    if (reducedMotion || cards.length < 2) {
      cards.forEach((card) => card.style.setProperty('--stack-scale', '1'))
      return undefined
    }

    let frame = 0
    const updateStack = () => {
      cards.forEach((card, index) => {
        const nextCard = cards[index + 1]
        if (!nextCard) {
          card.style.setProperty('--stack-scale', '1')
          return
        }

        const nextTop = nextCard.getBoundingClientRect().top
        const progress = Math.min(
          1,
          Math.max(0, (window.innerHeight - nextTop) / Math.max(1, window.innerHeight - 130)),
        )
        const depth = cards.length - index - 1
        const scale = Math.max(0.9, 1 - progress * depth * 0.022)
        card.style.setProperty('--stack-scale', scale.toFixed(4))
      })
    }

    const handleScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(updateStack)
    }

    updateStack()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [reducedMotion])

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen)
    return () => document.body.classList.remove('menu-open')
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <div className="intro-screen" aria-hidden="true">
        <span>WZY</span>
        <span>INTERIOR / 2026</span>
      </div>
      <div className="scroll-progress" aria-hidden="true" />
      <SimpleCursor />

      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="header-inner">
          <a className="brand" href="#home" aria-label="吴周杨作品集首页">
            <span className="brand-mark">W</span>
            <span className="brand-copy">
              <strong>WZY DESIGN</strong>
              <small>INTERIOR / BRANDING</small>
            </span>
          </a>

          <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="主导航">
            <a className="is-active" href="#home" onClick={closeMenu} aria-current="page">
              <span>00</span>首页
            </a>
            <a href="#about" onClick={closeMenu}>
              <span>01</span>关于
            </a>
            <a href="#pricing" onClick={closeMenu}>
              <span>02</span>价格
            </a>
            <a href="#projects" onClick={closeMenu}>
              <span>03</span>作品
            </a>
            <a href="#strengths" onClick={closeMenu}>
              <span>04</span>能力
            </a>
            <a href="#contact" onClick={closeMenu}>
              <span>05</span>联系
            </a>
          </nav>

          <a className="header-contact" href="#contact">
            电话咨询
            <Arrow />
          </a>

          <button
            className={`menu-toggle ${menuOpen ? 'is-active' : ''}`}
            type="button"
            aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <main>
        <section className="hero brand-home" id="home" ref={heroRef}>
          <div className="brand-home-bg" aria-hidden="true" />
          <div className="brand-home-photo" aria-hidden="true">
            <img src={siteConfig.heroPortrait.src} alt="" />
          </div>
          <div className="brand-home-glow" aria-hidden="true" />
          <div className="brand-home-grid" aria-hidden="true" />
          <span className="brand-home-cross brand-home-cross--one" aria-hidden="true">+</span>
          <span className="brand-home-cross brand-home-cross--two" aria-hidden="true">+</span>

          <div className="hero-content brand-home-content">
            <div className="brand-home-kicker">
              <span>WZY DESIGN × INTERIOR</span>
              <span>PROFILE / 2026</span>
            </div>

            <div className="brand-home-layout">
              <aside className="brand-home-rail" aria-hidden="true">
                <span>SPACE<br />LIGHT<br />MATERIAL</span>
                <i />
                <span>FUJIAN / CHINA</span>
              </aside>

              <div className="brand-home-copy">
                <div className="brand-home-title">
                  <span className="brand-home-index">
                    <span>PROFILE</span>
                    <i />
                    <small>2026</small>
                  </span>
                  <div>
                    <span className="brand-home-cn">设计介绍</span>
                    <h1>
                      <span>DESIGN</span>
                      <em>INTRODUCTION</em>
                    </h1>
                  </div>
                </div>

                <div className="brand-home-stripes" aria-hidden="true">
                  <i />
                  <span>WZY DESIGN</span>
                  <b />
                  <span>INTERIOR / PROFILE</span>
                </div>

                <p className="brand-home-description">
                  从空间规划到材质光影，从软装陈设到现场落地，
                  我们希望每个空间都回到真实生活，并在时间里持续成立。
                </p>

                <a className="brand-home-about" href="#about">
                  <span>ABOUT</span>
                  <strong>ME</strong>
                  <b aria-hidden="true">+</b>
                  <small>了解我的设计方法</small>
                  <Arrow />
                </a>

                <div className="brand-home-tags" aria-label="主要设计领域">
                  <span>SPACE PLANNING</span>
                  <span>MATERIAL & LIGHT</span>
                  <span>FULL SERVICE</span>
                </div>
              </div>
            </div>

            <div className="hero-bottom brand-home-footer">
              <a className="hero-scroll" href="#projects">
                <span>探索精选项目</span>
                <span className="scroll-line">
                  <i />
                </span>
              </a>

              <span className="brand-home-footer-note">
                RESIDENTIAL / COMMERCIAL / INTERIOR
              </span>

              <div className="hero-tags" aria-label="主要设计领域">
                <span>住宅设计</span>
                <span>商业空间</span>
                <span>全案落地</span>
              </div>
            </div>
          </div>
        </section>

        <ProjectMarquee
          config={siteConfig.showcase}
          items={siteConfig.showcase.items}
        />

        <section className="section about" id="about">
          <div className="container">
            <div className="section-heading" data-reveal>
              <div>
                <span className="section-index">01 / PROFILE</span>
                <span className="section-note">关于我 / ABOUT</span>
              </div>
              <Cross />
            </div>

            <div className="about-display-title" data-reveal>
              <span>ABOUT</span>
              <small>关于我 / ABOUT ME</small>
            </div>

            <div className="about-nameplate" data-reveal>
              <strong>吴周杨</strong>
              <span />
              <small>WU ZHOUYANG<br />INTERIOR DESIGNER</small>
            </div>

            <div className="about-layout">
              <div className="about-visual" data-reveal>
                <div className="about-living-stage">
                  <img src={siteConfig.aboutPortrait.src} alt="吴周杨" />
                </div>
                <div className="portrait-meta" aria-hidden="true">
                  <span>26°39′N</span>
                  <span>120°13′E</span>
                </div>
              </div>

              <div className="about-copy">
                <p className="about-lead" data-reveal>
                  克制，不意味着冷淡。
                  <br />
                  它是对生活
                  <em>更精确的表达。</em>
                </p>

                <div className="about-body" data-reveal>
                  <p>
                    我是吴周杨，一名扎根福建的室内设计师。比起制造视觉符号，我更关注人与空间长期相处的方式：光线如何进入、家人如何相遇、物件如何被安放。
                  </p>
                  <p>
                    从空间策略、材质搭配到施工图深化与现场协同，我以全案视角推进每一个项目，让设计不止停留在效果图里。
                  </p>
                </div>

                <div className="profile-row" data-reveal>
                  <div>
                    <span>现任</span>
                    <strong>福鼎新一装饰设计 · 创始人 / 设计总监</strong>
                  </div>
                  <a href="tel:17605058558" aria-label="拨打电话 17605058558">
                    17605058558
                    <Arrow />
                  </a>
                </div>

                <div className="data-grid" data-reveal>
                  <div>
                    <strong>100<sup>+</sup></strong>
                    <span>空间项目实践</span>
                  </div>
                  <div>
                    <strong>08</strong>
                    <span>奖项与行业身份</span>
                  </div>
                  <div>
                    <strong>全案</strong>
                    <span>住宅 · 商业 · 软装</span>
                  </div>
                  <div>
                    <strong>2026</strong>
                    <span>持续设计与更新</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="awards" data-reveal>
              <div className="awards-label">
                <span>SELECTED RECOGNITION</span>
                <small>近年荣誉 / 行业身份</small>
              </div>
              <div className="awards-list">
                {awards.map((award, index) => (
                  <p key={award}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {award}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section pricing" id="pricing">
          <div className="pricing-watermark" aria-hidden="true">
            PRICE
          </div>
          <div className="container">
            <div className="pricing-topline" data-reveal>
              <span>02 / PRICING</span>
              <span>DESIGN SERVICE / 2026</span>
            </div>

            <div className="pricing-heading" data-reveal>
              <div>
                <span>按需选择服务深度</span>
                <h2>
                  PRICE
                  <em>透明报价。</em>
                </h2>
              </div>
              <p>
                从纯设计到全案托管，
                <br />
                根据项目面积、复杂度与服务边界选择合适模式。
              </p>
            </div>

            <div className="pricing-grid">
              {pricing.map((item, index) => (
                <article
                  className={`price-card ${item.featured ? 'is-featured' : ''}`}
                  data-reveal
                  style={{ '--reveal-delay': `${index * 80}ms` }}
                  key={item.title}
                >
                  <div className="price-card-top">
                    <span>{item.index}</span>
                    <small>{item.en}</small>
                  </div>
                  <div className="price-card-name">
                    <h3>{item.title}</h3>
                    <span>服务模式</span>
                  </div>
                  <div className="price-amount">
                    <span>¥</span>
                    <strong>{item.price}</strong>
                    <small>元 / ㎡ 起</small>
                  </div>
                  <p>{item.description}</p>
                  <ul>
                    {item.items.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                  <a href="#contact" aria-label={`咨询${item.title}服务`}>
                    咨询此方案
                    <Arrow />
                  </a>
                </article>
              ))}
            </div>

            <div className="pricing-footer" data-reveal>
              <p>* 最终报价会根据实际面积、空间复杂度、材料体系及交付范围进行调整。</p>
              <a className="contact-button" href="#contact">
                <span>获取详细报价</span>
                <Arrow />
              </a>
            </div>
          </div>
        </section>

        <section className="section projects" id="projects">
          <div className="container">
            <div className="projects-heading" data-reveal>
              <div>
                <span className="section-index">03 / SELECTED WORKS</span>
                <h2>
                  PROJECT
                  <br />
                  <em>空间作品。</em>
                </h2>
              </div>
              <div className="projects-heading-side">
                <p>
                  从住宅到商业空间，
                  <br />
                  记录人与空间共同生长的过程。
                </p>
              </div>
            </div>

            {allProjects.length > 0 ? (
              <div className="project-stack">
                {allProjects.map((project, index) => {
                  const images = project.images.length
                    ? project.images
                    : ['/assets/hero-poster.jpg']

                  return (
                    <article
                      className={`project-stack-card ${
                        images.length === 1 ? 'is-single-image' : ''
                      }`}
                      style={{ '--stack-index': index }}
                      key={project.id}
                    >
                      <div className="project-stack-header">
                        <span className="project-stack-number">{project.number}</span>
                        <div className="project-stack-title">
                          <span>{project.category}</span>
                          <h3>{project.title}</h3>
                        </div>
                        <div className="project-stack-meta">
                          <span>{project.subtitle}</span>
                          <span>
                            {project.year} / {project.area}
                          </span>
                        </div>
                        <a className="project-ghost-button" href="#contact">
                          开始类似项目
                          <Arrow />
                        </a>
                      </div>

                      <div className="project-collage">
                        <div className="project-collage-small">
                          <figure>
                            <button
                              className="project-image-button"
                              type="button"
                              onClick={() =>
                                setImageGallery({
                                  images,
                                  index: images[1] ? 1 : 0,
                                  title: project.title,
                                })
                              }
                              aria-label={`放大查看 ${project.title} 空间细节`}
                            >
                              <img
                                src={images[1] || images[0]}
                                alt={`${project.title} 空间细节`}
                                loading="lazy"
                              />
                              <span className="project-image-expand">VIEW ↗</span>
                            </button>
                          </figure>
                          <figure>
                            <button
                              className="project-image-button"
                              type="button"
                              onClick={() =>
                                setImageGallery({
                                  images,
                                  index: images[2] ? 2 : 0,
                                  title: project.title,
                                })
                              }
                              aria-label={`放大查看 ${project.title} 材质与光影`}
                            >
                              <img
                                src={images[2] || images[0]}
                                alt={`${project.title} 材质与光影`}
                                loading="lazy"
                              />
                              <span className="project-image-expand">VIEW ↗</span>
                            </button>
                          </figure>
                        </div>
                        <figure className="project-collage-large">
                          <button
                            className="project-image-button"
                            type="button"
                            onClick={() =>
                              setImageGallery({
                                images,
                                index: 0,
                                title: project.title,
                              })
                            }
                            aria-label={`放大查看 ${project.title} 主要空间`}
                          >
                            <img
                              src={images[0]}
                              alt={`${project.title} 主要空间`}
                              loading="lazy"
                            />
                            <span className="project-image-expand">OPEN IMAGE ↗</span>
                          </button>
                        </figure>
                        <span className="project-image-count">
                          {String(images.length).padStart(2, '0')} IMAGES
                        </span>
                      </div>

                      <div className="project-stack-footer">
                        <p>{project.description || '以空间策略、材质与光影回应真实生活。'}</p>
                        <span>WU ZHOUYANG / {project.year}</span>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="project-empty-state">
                <div className="project-empty-mark" aria-hidden="true">
                  <span>01</span>
                  <i />
                  <span>YOUR WORK</span>
                </div>
                <div className="project-empty-content">
                  <span className="project-empty-kicker">LOCAL GALLERY</span>
                  <h3>
                    作品即将展示
                    <br />
                  </h3>
                  <p>
                    作品集内容待设计师后续更新。
                  </p>
                </div>
              </div>
            )}

            <div className="project-notes" data-reveal>
              <p>
                <span>PROCESS</span>
                概念沟通 → 空间规划 → 材质系统 → 图纸深化 → 现场落地
              </p>
              <span className="project-notes-line" />
            </div>
          </div>
        </section>

        <section className="section services" id="strengths">
          <div className="container">
            <div className="services-heading" data-reveal>
              <span className="services-index">04 / INTERIOR CAPABILITIES</span>
              <h2>INTERIOR</h2>
              <div>
                <p>
                  室内设计不是风格的堆叠，而是把动线、材质、光线和日常使用关系，
                  组织成一个可以长久生活的空间。
                </p>
                <span>DESIGN THINKING / 05 CAPABILITIES</span>
              </div>
            </div>

            <div className="capability-board">
              <aside className="capability-visual" data-reveal>
                <div className="capability-blueprint" aria-hidden="true">
                  <span className="capability-room capability-room--a" />
                  <span className="capability-room capability-room--b" />
                  <span className="capability-room capability-room--c" />
                  <span className="capability-room capability-room--d" />
                  <span className="capability-axis capability-axis--x" />
                  <span className="capability-axis capability-axis--y" />
                  <span className="capability-axis-ring" />
                  <small className="capability-plan-label capability-plan-label--one">
                    LIVING / 01
                  </small>
                  <small className="capability-plan-label capability-plan-label--two">
                    LIGHT / 06
                  </small>
                </div>
                <div className="capability-visual-top">
                  <span>INTERIOR SYSTEM</span>
                  <small>05 MODULES</small>
                </div>
                <div className="capability-visual-copy">
                  <span>SPACE / MATERIAL / LIGHT</span>
                  <p>让空间先解决生活，<br />再表达审美。</p>
                  <small>INTERIOR APPROACH / 2026</small>
                </div>
                <div className="capability-legend" aria-hidden="true">
                  <span><i />PLAN</span>
                  <span><i />MATERIAL</span>
                  <span><i />DETAIL</span>
                </div>
              </aside>

              <div className="capability-list">
                {strengths.map((service, index) => (
                  <article
                    className="capability-item"
                    data-reveal
                    style={{ '--reveal-delay': `${index * 70}ms` }}
                    key={service.title}
                  >
                    <div className="capability-item-heading">
                      <span>{service.index}</span>
                      <div>
                        <small>{service.en}</small>
                        <h3>{service.title}</h3>
                      </div>
                    </div>
                    <p>{service.copy}</p>
                    <div className="capability-tags" aria-label={`${service.title}包含内容`}>
                      {service.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="services-footer" data-reveal>
              <span>DRAWING / MODEL / MATERIAL / DELIVERY</span>
              <div>
                <span>AutoCAD</span>
                <span>SketchUp</span>
                <span>Enscape</span>
                <span>D5 Render</span>
              </div>
            </div>
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="contact-grid" aria-hidden="true" />
          <div className="container contact-inner">
            <div className="contact-top" data-reveal>
              <span className="section-index">05 / CONTACT</span>
              <span>AVAILABLE FOR SELECTED PROJECTS</span>
            </div>

            <div className="contact-main">
              <div className="contact-title" data-reveal>
                <span>有一个空间，正在发生？</span>
                <h2>
                  让我们，
                  <br />
                  一起定义
                  <br />
                  <em>下一个空间。</em>
                </h2>
              </div>

              <div className="contact-details" data-reveal>
                <a
                  className="contact-phone"
                  href="tel:17605058558"
                  aria-label="拨打电话 17605058558"
                >
                  <small>TEL / DIRECT CALL</small>
                  <span>17605058558</span>
                  <Arrow />
                </a>

                <div className="contact-info-grid">
                  <div>
                    <span>所在城市</span>
                    <p>福建 · 福鼎</p>
                  </div>
                  <div>
                    <span>设计机构</span>
                    <p>福鼎新一装饰设计</p>
                  </div>
                  <div>
                    <span>微信咨询</span>
                    <p>扫描二维码添加</p>
                  </div>
                </div>

                <figure className="contact-qr">
                  <img src="/assets/wechat-qr.jpg" alt="吴周杨微信二维码" loading="lazy" />
                  <figcaption>WECHAT / 吴周杨</figcaption>
                </figure>
              </div>
            </div>

            <div className="contact-footer" data-reveal>
              <span>© 2026 WU ZHOUYANG</span>
              <span>INTERIOR DESIGNER / FUJIAN</span>
              <a href="#home">
                回到顶部
                <Arrow direction="up" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <ImageLightbox
        gallery={imageGallery}
        onClose={() => setImageGallery(null)}
        onChange={(index) =>
          setImageGallery((current) => (current ? { ...current, index } : current))
        }
      />
    </>
  )
}

export default App
