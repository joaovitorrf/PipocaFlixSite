// js/series.js

class SeriesPlayer {
    constructor() {
        this.seriesId = null;
        this.seriesData = null;
        this.episodes = [];
        this.episodesBySeason = {};
        this.currentSeason = 1;
        this.currentEpisode = null;
        this.player = null;
        this.smartlinkClicks = 0;
        this.smartlinkRequired = 2;
        this.autoplayTimer = null;
        this.autoplayCountdown = 10;
        this.init();
    }

    async init() {
        this.getSeriesIdFromURL();
        
        if (!this.seriesId) {
            this.showError('ID da série não encontrado');
            return;
        }

        await this.loadSeriesData();
        await this.loadEpisodes();
        this.setupPlayer();
        this.checkSmartlink();
        this.renderSeasonSelector();
        this.setupActionButtons();
    }

    getSeriesIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        this.seriesId = urlParams.get('id');
    }

    async loadSeriesData() {
        try {
            this.seriesData = await pipocaFlixAPI.getContentById(this.seriesId);
            
            if (!this.seriesData) {
                this.showError('Série não encontrada');
                return;
            }

            this.renderSeriesInfo();
        } catch (error) {
            console.error('Erro ao carregar série:', error);
            this.showError('Erro ao carregar informações da série');
        }
    }

    async loadEpisodes() {
        try {
            this.episodes = await pipocaFlixAPI.getEpisodes(this.seriesData.nome);
            
            if (this.episodes.length === 0) {
                this.showToast('Nenhum episódio encontrado para esta série');
                return;
            }

            // Agrupar por temporada
            this.episodesBySeason = pipocaFlixAPI.groupEpisodesBySeason(this.episodes);
            
            // Definir temporada inicial
            const seasons = Object.keys(this.episodesBySeason).map(Number).sort((a, b) => a - b);
            this.currentSeason = seasons[0] || 1;

        } catch (error) {
            console.error('Erro ao carregar episódios:', error);
        }
    }

    renderSeriesInfo() {
        // Título
        const titleEl = document.getElementById('series-title');
        if (titleEl) titleEl.textContent = this.seriesData.nome;

        // Meta informações
        const metaEl = document.getElementById('series-meta');
        if (metaEl) {
            metaEl.innerHTML = `
                <span>${this.seriesData.ano || 'N/A'}</span>
                ${this.seriesData.categoria ? `<span class="movie-category">${this.seriesData.categoria}</span>` : ''}
            `;
        }

        // Sinopse
        const synopsisEl = document.getElementById('synopsis-text');
        if (synopsisEl) {
            synopsisEl.textContent = this.seriesData.sinopse;
        }

        // Elenco
        this.renderCast();

        // Atualizar document title
        document.title = `${this.seriesData.nome} - PipocaFlix`;
    }

    renderCast() {
        const castGrid = document.getElementById('cast-grid');
        if (!castGrid || !this.seriesData.nomeElenco) return;

        const names = this.seriesData.nomeElenco.split('|').map(n => n.trim());
        const photos = this.seriesData.fotosElenco || [];

        castGrid.innerHTML = '';

        names.forEach((name, index) => {
            if (!name) return;

            const card = document.createElement('div');
            card.className = 'cast-card';
            
            const photo = photos[index] || '/assets/images/avatar-placeholder.jpg';
            
            card.innerHTML = `
                <img src="${photo}" alt="${name}" class="cast-photo" loading="lazy">
                <div class="cast-name">${name}</div>
            `;

            castGrid.appendChild(card);
        });
    }

    renderSeasonSelector() {
        const seasonButton = document.getElementById('season-button');
        const seasonMenu = document.getElementById('season-menu');

        if (!seasonButton || !seasonMenu) return;

        // Atualizar texto do botão
        seasonButton.innerHTML = `
            Temporada ${this.currentSeason}
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
            </svg>
        `;

        // Toggle menu
        seasonButton.onclick = () => {
            seasonButton.classList.toggle('active');
            seasonMenu.classList.toggle('active');
        };

        // Renderizar opções de temporadas
        seasonMenu.innerHTML = '';
        const seasons = Object.keys(this.episodesBySeason).map(Number).sort((a, b) => a - b);

        seasons.forEach(season => {
            const option = document.createElement('div');
            option.className = `season-option ${season === this.currentSeason ? 'active' : ''}`;
            option.textContent = `Temporada ${season}`;
            option.onclick = () => {
                this.selectSeason(season);
                seasonButton.classList.remove('active');
                seasonMenu.classList.remove('active');
            };
            seasonMenu.appendChild(option);
        });

        // Renderizar episódios da temporada atual
        this.renderEpisodes();
    }

    selectSeason(season) {
        this.currentSeason = season;
        this.renderSeasonSelector();
    }

    renderEpisodes() {
        const episodesGrid = document.getElementById('episodes-grid');
        if (!episodesGrid) return;

        episodesGrid.innerHTML = '';

        const episodes = this.episodesBySeason[this.currentSeason] || [];

        episodes.forEach(episode => {
            const card = this.createEpisodeCard(episode);
            episodesGrid.appendChild(card);
        });
    }

    createEpisodeCard(episode) {
        const card = document.createElement('div');
        card.className = 'episode-card';
        card.onclick = () => this.playEpisode(episode);

        // Verificar progresso salvo
        const progress = this.getEpisodeProgress(episode.id);

        card.innerHTML = `
            <div class="episode-thumbnail">
                <img src="${this.seriesData.capa}" alt="Episódio ${episode.episodio}" loading="lazy">
                <div class="episode-play-icon">
                    <svg fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
                    </svg>
                </div>
                ${progress > 0 ? `<div class="episode-progress" style="width: ${progress}%"></div>` : ''}
            </div>
            <div class="episode-info">
                <div class="episode-number">Episódio ${episode.episodio}</div>
                <h4 class="episode-title">${episode.nome || `Episódio ${episode.episodio}`}</h4>
            </div>
        `;

        return card;
    }

    playEpisode(episode) {
        this.currentEpisode = episode;

        // Verificar smartlink
        const clicks = localStorage.getItem('smartlink_clicks');
        if (!clicks || parseInt(clicks) < this.smartlinkRequired) {
            this.showSmartlinkOverlay();
            return;
        }

        this.loadEpisodeVideo(episode);
        this.saveWatchHistory(episode);

        // Scroll para o player
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    loadEpisodeVideo(episode) {
        if (!this.player || !episode.link) return;

        this.player.src = episode.link;
        this.player.play();

        // Atualizar título
        const titleEl = document.getElementById('series-title');
        if (titleEl) {
            titleEl.textContent = `${this.seriesData.nome} - T${episode.temporada}E${episode.episodio}`;
        }

        // Evento de fim do episódio
        this.player.onended = () => {
            this.handleEpisodeEnded();
        };

        // Salvar progresso a cada 10 segundos
        this.player.ontimeupdate = () => {
            if (this.player.currentTime % 10 < 0.5) {
                this.saveEpisodeProgress(episode.id, this.player.currentTime, this.player.duration);
            }
        };
    }

    handleEpisodeEnded() {
        const nextEpisode = this.getNextEpisode();
        
        if (nextEpisode) {
            this.showAutoplayOverlay(nextEpisode);
        } else {
            this.showToast('Você completou esta temporada! 🎉');
        }
    }

    getNextEpisode() {
        if (!this.currentEpisode) return null;

        const currentSeasonEpisodes = this.episodesBySeason[this.currentEpisode.temporada] || [];
        const currentIndex = currentSeasonEpisodes.findIndex(ep => ep.id === this.currentEpisode.id);

        if (currentIndex !== -1 && currentIndex < currentSeasonEpisodes.length - 1) {
            return currentSeasonEpisodes[currentIndex + 1];
        }

        // Verificar próxima temporada
        const nextSeason = this.currentEpisode.temporada + 1;
        if (this.episodesBySeason[nextSeason]) {
            return this.episodesBySeason[nextSeason][0];
        }

        return null;
    }

    showAutoplayOverlay(nextEpisode) {
        const overlay = document.getElementById('autoplay-overlay');
        if (!overlay) return;

        // Preencher informações do próximo episódio
        const thumbnail = overlay.querySelector('.autoplay-thumbnail img');
        const title = overlay.querySelector('.autoplay-details h5');
        const description = overlay.querySelector('.autoplay-details p');

        if (thumbnail) thumbnail.src = this.seriesData.capa;
        if (title) title.textContent = nextEpisode.nome || `Episódio ${nextEpisode.episodio}`;
        if (description) description.textContent = `Temporada ${nextEpisode.temporada} • Episódio ${nextEpisode.episodio}`;

        overlay.classList.add('active');

        // Iniciar countdown
        this.autoplayCountdown = 10;
        this.startAutoplayCountdown(nextEpisode);

        // Botões
        const watchBtn = overlay.querySelector('.btn-watch');
        const cancelBtn = overlay.querySelector('.btn-cancel');

        if (watchBtn) {
            watchBtn.onclick = () => {
                this.cancelAutoplay();
                this.playEpisode(nextEpisode);
            };
        }

        if (cancelBtn) {
            cancelBtn.onclick = () => {
                this.cancelAutoplay();
            };
        }
    }

    startAutoplayCountdown(nextEpisode) {
        const timerEl = document.querySelector('.autoplay-timer');
        const progressBar = document.querySelector('.autoplay-progress-bar');

        this.autoplayTimer = setInterval(() => {
            this.autoplayCountdown--;

            if (timerEl) {
                timerEl.textContent = `Próximo episódio em ${this.autoplayCountdown} segundos...`;
            }

            if (progressBar) {
                const percent = ((10 - this.autoplayCountdown) / 10) * 100;
                progressBar.style.width = percent + '%';
            }

            if (this.autoplayCountdown <= 0) {
                this.cancelAutoplay();
                this.playEpisode(nextEpisode);
            }
        }, 1000);
    }

    cancelAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }

        const overlay = document.getElementById('autoplay-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    // PROGRESSO E HISTÓRICO
    saveEpisodeProgress(episodeId, currentTime, duration) {
        const progress = (currentTime / duration) * 100;
        localStorage.setItem(`episode_progress_${episodeId}`, progress.toString());
    }

    getEpisodeProgress(episodeId) {
        const progress = localStorage.getItem(`episode_progress_${episodeId}`);
        return progress ? parseFloat(progress) : 0;
    }

    saveWatchHistory(episode) {
        const history = JSON.parse(localStorage.getItem('watch_history') || '[]');
        
        const entry = {
            seriesId: this.seriesId,
            seriesName: this.seriesData.nome,
            episodeId: episode.id,
            season: episode.temporada,
            episode: episode.episodio,
            timestamp: Date.now()
        };

        // Remover duplicatas
        const filtered = history.filter(h => h.episodeId !== episode.id);
        filtered.unshift(entry);

        // Manter apenas últimos 50
        const limited = filtered.slice(0, 50);

        localStorage.setItem('watch_history', JSON.stringify(limited));
    }

    // PLAYER
    setupPlayer() {
        this.player = document.getElementById('video-player');
        
        if (!this.player) return;

        this.setupCustomControls();
    }

    setupCustomControls() {
        const playPauseBtn = document.getElementById('play-pause');
        const progressBar = document.getElementById('progress-bar');
        const progressFilled = document.getElementById('progress-filled');
        const timeDisplay = document.getElementById('time-display');
        const fullscreenBtn = document.getElementById('fullscreen-btn');

        // Play/Pause
        if (playPauseBtn) {
            playPauseBtn.onclick = () => this.togglePlay();
            this.player.onclick = () => this.togglePlay();
        }

        // Progress bar
        if (progressBar) {
            progressBar.onclick = (e) => {
                const rect = progressBar.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                this.player.currentTime = percent * this.player.duration;
            };
        }

        // Update progress
        this.player.addEventListener('timeupdate', () => {
            const percent = (this.player.currentTime / this.player.duration) * 100;
            if (progressFilled) progressFilled.style.width = percent + '%';
            
            if (timeDisplay) {
                timeDisplay.textContent = `${this.formatTime(this.player.currentTime)} / ${this.formatTime(this.player.duration)}`;
            }
        });

        // Fullscreen
        if (fullscreenBtn) {
            fullscreenBtn.onclick = () => this.toggleFullscreen();
        }

        // Controles automáticos
        const videoContainer = document.querySelector('.video-wrapper');
        const controls = document.querySelector('.video-controls');
        let controlsTimeout;

        if (videoContainer && controls) {
            videoContainer.addEventListener('mousemove', () => {
                controls.classList.add('show');
                clearTimeout(controlsTimeout);
                controlsTimeout = setTimeout(() => {
                    if (!this.player.paused) {
                        controls.classList.remove('show');
                    }
                }, 3000);
            });
        }
    }

    togglePlay() {
        if (this.player.paused) {
            this.player.play();
            document.getElementById('play-pause').textContent = '⏸';
        } else {
            this.player.pause();
            document.getElementById('play-pause').textContent = '▶';
        }
    }

    toggleFullscreen() {
        const container = document.querySelector('.video-container');
        
        if (!document.fullscreenElement) {
            container.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // SMARTLINK
    checkSmartlink() {
        const clicks = localStorage.getItem('smartlink_clicks');
        
        if (clicks && parseInt(clicks) >= this.smartlinkRequired) {
            this.unlockPlayer();
        } else {
            this.showSmartlinkOverlay();
        }
    }

    showSmartlinkOverlay() {
        const overlay = document.getElementById('smartlink-overlay');
        if (!overlay) return;

        overlay.classList.remove('hidden');

        const currentClicks = parseInt(localStorage.getItem('smartlink_clicks') || '0');
        const remaining = this.smartlinkRequired - currentClicks;

        const counter = document.getElementById('smartlink-counter');
        if (counter) {
            counter.textContent = `Cliques restantes: ${remaining}`;
        }

        const btn = document.getElementById('smartlink-btn');
        if (btn) {
            btn.onclick = () => this.handleSmartlinkClick();
        }
    }

    handleSmartlinkClick() {
        window.open('https://www.effectivegatecpm.com/eacwhk55f?key=87f8fc919fb5d70a825293b5490713dd', '_blank');

        let clicks = parseInt(localStorage.getItem('smartlink_clicks') || '0');
        clicks++;
        localStorage.setItem('smartlink_clicks', clicks.toString());

        const remaining = this.smartlinkRequired - clicks;
        const counter = document.getElementById('smartlink-counter');
        
        if (remaining > 0) {
            if (counter) {
                counter.textContent = `Cliques restantes: ${remaining}`;
            }
        } else {
            this.unlockPlayer();
        }
    }

    unlockPlayer() {
        const overlay = document.getElementById('smartlink-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
        this.showToast('Player liberado! Boa maratona! 📺');
    }

    // BOTÕES DE AÇÃO
    setupActionButtons() {
        const shareBtn = document.getElementById('share-btn');
        if (shareBtn) {
            shareBtn.onclick = () => this.handleShare();
        }
    }

    async handleShare() {
        const shareData = {
            title: this.seriesData.nome,
            text: `Assista ${this.seriesData.nome} no PipocaFlix!`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                this.showToast('Compartilhado com sucesso!');
            } catch (error) {
                console.log('Compartilhamento cancelado');
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            this.showToast('Link copiado!');
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 10000;
        `;

        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    showError(message) {
        const container = document.querySelector('.series-page');
        if (container) {
            container.innerHTML = `
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    text-align: center;
                    padding: 2rem;
                ">
                    <div>
                        <h1 style="font-size: 3rem; margin-bottom: 1rem;">😕</h1>
                        <h2 style="margin-bottom: 1rem;">${message}</h2>
                        <button onclick="window.history.back()" class="btn btn-primary">
                            Voltar
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// Inicializar
let seriesPlayer;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        seriesPlayer = new SeriesPlayer();
    });
} else {
    seriesPlayer = new SeriesPlayer();
}