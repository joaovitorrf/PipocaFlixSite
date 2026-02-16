// js/search.js

class SearchPage {
    constructor() {
        this.query = '';
        this.results = [];
        this.currentPage = 1;
        this.pageSize = 18;
        this.isLoading = false;
        this.hasMore = true;
        this.debounceTimer = null;
        this.init();
    }

    init() {
        this.getQueryFromURL();
        this.setupSearchInput();
        this.setupInfiniteScroll();
        
        if (this.query) {
            this.performSearch();
        }
    }

    getQueryFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        this.query = urlParams.get('q') || '';
        
        const searchInput = document.getElementById('search-input-main');
        if (searchInput && this.query) {
            searchInput.value = this.query;
        }
    }

    setupSearchInput() {
        const searchInput = document.getElementById('search-input-main');
        const headerSearch = document.getElementById('search-input');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.query = e.target.value.trim();
                    this.performSearch();
                }
            });

            searchInput.focus();
        }

        if (headerSearch) {
            headerSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = e.target.value.trim();
                    if (query) {
                        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
                    }
                }
            });
        }
    }

    handleSearchInput(value) {
        clearTimeout(this.debounceTimer);
        
        this.debounceTimer = setTimeout(() => {
            this.query = value.trim();
            if (this.query) {
                this.performSearch();
            } else {
                this.clearResults();
            }
        }, 500);
    }

    async performSearch() {
        if (!this.query || this.isLoading) return;

        this.showLoading();
        this.isLoading = true;
        this.currentPage = 1;

        try {
            this.results = await pipocaFlixAPI.searchContent(this.query);
            this.renderResults();
            this.updateResultsInfo();
        } catch (error) {
            console.error('Erro na busca:', error);
            this.showError('Erro ao realizar busca. Tente novamente.');
        } finally {
            this.hideLoading();
            this.isLoading = false;
        }
    }

    renderResults() {
        const grid = document.getElementById('search-grid');
        const noResults = document.getElementById('no-results');

        if (!grid) return;

        grid.innerHTML = '';

        if (this.results.length === 0) {
            grid.classList.add('hidden');
            if (noResults) {
                noResults.classList.remove('hidden');
                this.renderNoResults();
            }
            return;
        }

        grid.classList.remove('hidden');
        if (noResults) noResults.classList.add('hidden');

        const endIndex = this.currentPage * this.pageSize;
        const displayResults = this.results.slice(0, endIndex);

        displayResults.forEach(item => {
            const card = this.createResultCard(item);
            grid.appendChild(card);
        });

        this.hasMore = endIndex < this.results.length;
    }

    createResultCard(item) {
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

    renderNoResults() {
        const noResults = document.getElementById('no-results');
        if (!noResults) return;

        noResults.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2>Nenhum resultado encontrado</h2>
            <p>Não encontramos nada para "${this.query}"</p>
            <div class="search-suggestions">
                <h3>Sugestões:</h3>
                <ul style="color: var(--text-secondary); margin-top: 0.5rem;">
                    <li>• Verifique a ortografia das palavras</li>
                    <li>• Tente palavras-chave diferentes</li>
                    <li>• Use termos mais genéricos</li>
                </ul>
            </div>
        `;
    }

    updateResultsInfo() {
        const info = document.getElementById('results-info');
        if (!info) return;

        if (this.results.length > 0) {
            info.innerHTML = `Encontramos <span>${this.results.length}</span> resultado${this.results.length !== 1 ? 's' : ''} para "${this.query}"`;
            info.classList.remove('hidden');
        } else {
            info.classList.add('hidden');
        }
    }

    openContent(item) {
        if (item.tipo === 'Série' || item.tipo === 'Serie') {
            window.location.href = `series.html?id=${item.id}`;
        } else {
            window.location.href = `movie.html?id=${item.id}`;
        }
    }

    setupInfiniteScroll() {
        let scrollTimeout;

        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);

            scrollTimeout = setTimeout(() => {
                const scrollPosition = window.innerHeight + window.scrollY;
                const pageHeight = document.documentElement.scrollHeight;

                if (scrollPosition >= pageHeight - 500 && this.hasMore && !this.isLoading) {
                    this.loadMore();
                }
            }, 100);
        });
    }

    loadMore() {
        if (!this.hasMore || this.isLoading) return;

        this.showScrollLoader();
        this.currentPage++;
        
        setTimeout(() => {
            this.renderResults();
            this.hideScrollLoader();
        }, 500);
    }

    clearResults() {
        const grid = document.getElementById('search-grid');
        const noResults = document.getElementById('no-results');
        const info = document.getElementById('results-info');

        if (grid) grid.innerHTML = '';
        if (noResults) noResults.classList.add('hidden');
        if (info) info.classList.add('hidden');

        this.results = [];
        this.currentPage = 1;
        this.hasMore = true;
    }

    showLoading() {
        const loader = document.getElementById('search-loading');
        if (loader) loader.classList.remove('hidden');
    }

    hideLoading() {
        const loader = document.getElementById('search-loading');
        if (loader) loader.classList.add('hidden');
    }

    showScrollLoader() {
        const loader = document.getElementById('scroll-loader');
        if (loader) loader.classList.add('active');
    }

    hideScrollLoader() {
        const loader = document.getElementById('scroll-loader');
        if (loader) loader.classList.remove('active');
    }

    showError(message) {
        // Implementar toast de erro
        console.error(message);
    }
}

// Inicializar
let searchPage;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        searchPage = new SearchPage();
    });
} else {
    searchPage = new SearchPage();
}