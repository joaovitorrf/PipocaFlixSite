// js/home.js

class HomePage {
    constructor() {
        this.currentSlide = 0;
        this.sliderInterval = null;
        this.banners = [];
        this.sessions = [];
        this.init();
    }

    async init() {
        this.showLoading();
        
        try {
            await this.loadBanners();
            await this.loadRecentContent();
            await this.loadSessions();
            this.setupHeader();
            this.setupSearch();
            this.hideLoading();
        } catch (error) {
            console.error('Erro ao inicializar home:', error);
            this.showError('Erro ao carregar conteúdo. Por favor, recarregue a página.');
        }
    }

    showLoading() {
        const loading = document.getElementById('loading-overlay');
        if (loading) loading.classList.remove('hidden');
    }

    hideLoading() {
        const loading = document.getElementById('loading-overlay');
        if (loading) loading.classList.add('hidden');
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(229, 9, 20, 0.95);
            color: white;
            padding: 2rem;
            border-radius: 8px;
            text-align: center;
            z-index: 10000;
        `;
        errorDiv.innerHTML = `
            <h3 style="margin-bottom: 1rem;">${message}</h3>
            <button onclick="location.reload()" class="btn btn-primary">
                Recarregar
            </button>
        `;
        document.body.appendChild(errorDiv);
    }

    // CARREGAR BANNERS
    async loadBanners() {
        try {
            this.banners = await pipocaFlixAPI.getBanners();
            
            if (this.banners.length === 0) {
                // Se não houver banners, usar conteúdo recente como fallback
                const recentContent = await pipocaFlixAPI.getRecentContent(5);
                this.banners = recentContent.map(content => ({
                    imagem: content.capa,
                    link: content.link,
                    categoria: content.nome
                }));
            }
            
            this.renderBanners();
            this.startSlider();
        } catch (error) {
            console.error('Erro ao carregar banners:', error);
        }
    }

    renderBanners() {
        const heroSlider = document.getElementById('hero-slider');
        const heroNav = document.getElementById('hero-nav');
        
        if (!heroSlider || !heroNav) return;

        heroSlider.innerHTML = '';
        heroNav.innerHTML = '';

        this.banners.forEach((banner, index) => {
            // Criar slide
            const slide = document.createElement('div');
            slide.className = `hero-slide ${index === 0 ? 'active' : ''}`;
            slide.innerHTML = `
                <img src="${banner.imagem}" alt="${banner.categoria}">
                <div class="hero-overlay"></div>
                <div class="hero-content">
                    <h1 class="hero-title">${banner.categoria || 'Destaque'}</h1>
                    <p class="hero-description">Assista agora os melhores conteúdos!</p>
                    <div class="hero-buttons">
                        <button class="btn btn-primary" onclick="homePage.openBanner('${banner.link}', ${index})">
                            ▶ Assistir Agora
                        </button>
                        <button class="btn btn-secondary">
                            ℹ Mais Informações
                        </button>
                    </div>
                </div>
            `;
            heroSlider.appendChild(slide);

            // Criar navegação
            const navDot = document.createElement('span');
            navDot.className = index === 0 ? 'active' : '';
            navDot.onclick = () => this.goToSlide(index);
            heroNav.appendChild(navDot);
        });
    }

    startSlider() {
        this.sliderInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }

    stopSlider() {
        if (this.sliderInterval) {
            clearInterval(this.sliderInterval);
        }
    }

    goToSlide(index) {
        this.currentSlide = index;
        this.updateSlider();
        this.stopSlider();
        this.startSlider();
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.banners.length;
        this.updateSlider();
    }

    updateSlider() {
        const slides = document.querySelectorAll('.hero-slide');
        const navDots = document.querySelectorAll('#hero-nav span');

        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentSlide);
        });

        navDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    }

    openBanner(link, index) {
        if (link && link.startsWith('http')) {
            window.open(link, '_blank');
        } else {
            // Buscar conteúdo relacionado ao banner
            const banner = this.banners[index];
            if (banner.categoria) {
                this.searchAndOpen(banner.categoria);
            }
        }
    }

    async searchAndOpen(term) {
        const results = await pipocaFlixAPI.searchContent(term);
        if (results.length > 0) {
            this.openContent(results[0]);
        }
    }

    // CARREGAR CONTEÚDO RECENTE
    async loadRecentContent() {
        try {
            const recentContent = await pipocaFlixAPI.getRecentContent(8);
            this.renderRecentGrid(recentContent);
        } catch (error) {
            console.error('Erro ao carregar conteúdo recente:', error);
        }
    }

    renderRecentGrid(content) {
        const grid = document.getElementById('recent-grid');
        if (!grid) return;

        grid.innerHTML = '';

        content.forEach(item => {
            const card = this.createMovieCard(item);
            grid.appendChild(card);
        });
    }

    // CARREGAR SESSÕES
    async loadSessions() {
        try {
            const sessions = await pipocaFlixAPI.getSessions();
            
            // Se não houver sessões, criar sessões padrão
            if (sessions.length === 0) {
                sessions.push(
                    { categoria: 'Ação', tipo: 'Filme' },
                    { categoria: 'Comédia', tipo: 'Filme' },
                    { categoria: 'Drama', tipo: 'Série' },
                    { categoria: 'Terror', tipo: 'Filme' }
                );
            }

            for (const session of sessions) {
                await this.loadSessionContent(session);
            }
        } catch (error) {
            console.error('Erro ao carregar sessões:', error);
        }
    }

    async loadSessionContent(session) {
        try {
            const content = await pipocaFlixAPI.getContentBySession(
                session.categoria,
                session.tipo,
                12
            );

            if (content.length > 0) {
                this.renderSession(session.categoria, content);
            }
        } catch (error) {
            console.error(`Erro ao carregar sessão ${session.categoria}:`, error);
        }
    }

    renderSession(title, content) {
        const sessionsContainer = document.getElementById('sessions-container');
        if (!sessionsContainer) return;

        const section = document.createElement('div');
        section.className = 'content-section';
        section.innerHTML = `
            <h2 class="section-title">${title}</h2>
            <div class="carousel-wrapper">
                <button class="carousel-btn prev" onclick="homePage.scrollCarousel(this, -1)">‹</button>
                <div class="carousel-container">
                    <div class="carousel" id="carousel-${title.replace(/\s+/g, '-')}">
                    </div>
                </div>
                <button class="carousel-btn next" onclick="homePage.scrollCarousel(this, 1)">›</button>
            </div>
        `;

        sessionsContainer.appendChild(section);

        const carousel = section.querySelector('.carousel');
        content.forEach(item => {
            const card = this.createMovieCard(item);
            carousel.appendChild(card);
        });

        this.setupCarouselDrag(carousel);
    }

    // CRIAR CARD DE FILME
    createMovieCard(item) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.onclick = () => this.openContent(item);
        
        card.innerHTML = `
            <img src="${item.capa}" alt="${item.nome}" loading="lazy">
            <div class="movie-card-overlay">
                <h3 class="movie-card-title">${item.nome}</h3>
                <div class="movie-card-info">
                    ${item.ano} ${item.categoria ? '• ' + item.categoria : ''}
                </div>
            </div>
        `;

        return card;
    }

    openContent(item) {
        if (item.tipo === 'Série' || item.tipo === 'Serie') {
            window.location.href = `series.html?id=${item.id}`;
        } else {
            window.location.href = `movie.html?id=${item.id}`;
        }
    }

    // SCROLL DO CARROSSEL
    scrollCarousel(button, direction) {
        const wrapper = button.closest('.carousel-wrapper');
        const container = wrapper.querySelector('.carousel-container');
        const scrollAmount = 400;

        container.scrollBy({
            left: direction * scrollAmount,
            behavior: 'smooth'
        });
    }

    // DRAG NO CARROSSEL
    setupCarouselDrag(carousel) {
        let isDown = false;
        let startX;
        let scrollLeft;

        carousel.addEventListener('mousedown', (e) => {
            isDown = true;
            carousel.style.cursor = 'grabbing';
            startX = e.pageX - carousel.offsetLeft;
            scrollLeft = carousel.parentElement.scrollLeft;
        });

        carousel.addEventListener('mouseleave', () => {
            isDown = false;
            carousel.style.cursor = 'grab';
        });

        carousel.addEventListener('mouseup', () => {
            isDown = false;
            carousel.style.cursor = 'grab';
        });

        carousel.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - carousel.offsetLeft;
            const walk = (x - startX) * 2;
            carousel.parentElement.scrollLeft = scrollLeft - walk;
        });

        // Touch events para mobile
        let touchStartX = 0;
        let touchScrollLeft = 0;

        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].pageX;
            touchScrollLeft = carousel.parentElement.scrollLeft;
        });

        carousel.addEventListener('touchmove', (e) => {
            const x = e.touches[0].pageX;
            const walk = (touchStartX - x) * 2;
            carousel.parentElement.scrollLeft = touchScrollLeft + walk;
        });
    }

    // SETUP DO HEADER
    setupHeader() {
        const header = document.querySelector('.header');
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // SETUP DA BUSCA
    setupSearch() {
        const searchInput = document.getElementById('search-input');
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = searchInput.value.trim();
                    if (query) {
                        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
                    }
                }
            });
        }
    }
}

// Inicializar quando o DOM estiver pronto
let homePage;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        homePage = new HomePage();
    });
} else {
    homePage = new HomePage();
}