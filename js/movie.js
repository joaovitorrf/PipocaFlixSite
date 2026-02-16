// js/movie.js

class MoviePlayer {
    constructor() {
        this.movieId = null;
        this.movieData = null;
        this.player = null;
        this.smartlinkClicks = 0;
        this.smartlinkRequired = 2;
        this.init();
    }

    async init() {
        this.getMovieIdFromURL();
        
        if (!this.movieId) {
            this.showError('ID do filme não encontrado');
            return;
        }

        await this.loadMovieData();
        this.setupPlayer();
        this.checkSmartlink();
    }

    getMovieIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        this.movieId = urlParams.get('id');
    }

    async loadMovieData() {
        try {
            this.movieData = await pipocaFlixAPI.getContentById(this.movieId);
            
            if (!this.movieData) {
                this.showError('Filme não encontrado');
                return;
            }

            this.renderMovieInfo();
            this.loadRecommendations();
        } catch (error) {
            console.error('Erro ao carregar filme:', error);
            this.showError('Erro ao carregar informações do filme');
        }
    }

    renderMovieInfo() {
        // Título
        const titleEl = document.getElementById('movie-title');
        if (titleEl) titleEl.textContent = this.movieData.nome;

        // Meta informações
        const metaEl = document.getElementById('movie-meta');
        if (metaEl) {
            metaEl.innerHTML = `
                <span>${this.movieData.ano || 'N/A'}</span>
                <span>${this.movieData.duracao || 'N/A'}</span>
                ${this.movieData.categoria ? `<span class="movie-category">${this.movieData.categoria}</span>` : ''}
            `;
        }

        // Sinopse
        const synopsisEl = document.getElementById('synopsis-text');
        if (synopsisEl) {
            synopsisEl.textContent = this.movieData.sinopse;
            
            // Read more se for muito longo
            if (this.movieData.sinopse.length > 300) {
                synopsisEl.classList.add('collapsed');
                const readMore = document.getElementById('read-more');
                if (readMore) {
                    readMore.classList.remove('hidden');
                    readMore.onclick = () => {
                        synopsisEl.classList.toggle('expanded');
                        readMore.textContent = synopsisEl.classList.contains('expanded') 
                            ? 'Ler menos' 
                            : 'Ler mais';
                    };
                }
            }
        }

        // Elenco
        this.renderCast();

        // Atualizar document title
        document.title = `${this.movieData.nome} - PipocaFlix`;
    }

    renderCast() {
        const castGrid = document.getElementById('cast-grid');
        if (!castGrid || !this.movieData.nomeElenco) return;

        const names = this.movieData.nomeElenco.split('|').map(n => n.trim());
        const photos = this.movieData.fotosElenco || [];

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

    async loadRecommendations() {
        try {
            const recommendations = await pipocaFlixAPI.getRandomContent(this.movieId, 6);
            this.renderRecommendations(recommendations);
        } catch (error) {
            console.error('Erro ao carregar recomendações:', error);
        }
    }

    renderRecommendations(items) {
        const grid = document.getElementById('recommendations-grid');
        if (!grid) return;

        grid.innerHTML = '';

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            card.onclick = () => {
                window.location.href = `movie.html?id=${item.id}`;
            };
            
            card.innerHTML = `
                <img src="${item.capa}" alt="${item.nome}" loading="lazy">
                <div class="movie-card-overlay">
                    <h3 class="movie-card-title">${item.nome}</h3>
                    <div class="movie-card-info">${item.ano}</div>
                </div>
            `;

            grid.appendChild(card);
        });
    }

    setupPlayer() {
        this.player = document.getElementById('video-player');
        
        if (!this.player) return;

        // Setup de controles customizados
        this.setupCustomControls();
        
        // Carregar vídeo
        if (this.movieData.link) {
            this.player.src = this.movieData.link;
        }
    }

    setupCustomControls() {
        const playPauseBtn = document.getElementById('play-pause');
        const progressBar = document.getElementById('progress-bar');
        const progressFilled = document.getElementById('progress-filled');
        const timeDisplay = document.getElementById('time-display');
        const volumeBtn = document.getElementById('volume-btn');
        const volumeSlider = document.getElementById('volume-slider');
        const volumeFilled = document.getElementById('volume-filled');
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        const speedBtn = document.getElementById('speed-btn');
        const speedMenu = document.getElementById('speed-menu');

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
        this.player.ontimeupdate = () => {
            const percent = (this.player.currentTime / this.player.duration) * 100;
            if (progressFilled) progressFilled.style.width = percent + '%';
            
            if (timeDisplay) {
                timeDisplay.textContent = `${this.formatTime(this.player.currentTime)} / ${this.formatTime(this.player.duration)}`;
            }
        };

        // Update buffer
        this.player.onprogress = () => {
            const bufferBar = document.getElementById('buffer-bar');
            if (bufferBar && this.player.buffered.length > 0) {
                const bufferedEnd = this.player.buffered.end(this.player.buffered.length - 1);
                const percent = (bufferedEnd / this.player.duration) * 100;
                bufferBar.style.width = percent + '%';
            }
        };

        // Volume
        if (volumeBtn) {
            volumeBtn.onclick = () => this.toggleMute();
        }

        if (volumeSlider) {
            volumeSlider.onclick = (e) => {
                const rect = volumeSlider.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                this.player.volume = percent;
                if (volumeFilled) volumeFilled.style.width = (percent * 100) + '%';
            };
        }

        // Fullscreen
        if (fullscreenBtn) {
            fullscreenBtn.onclick = () => this.toggleFullscreen();
        }

        // Speed
        if (speedBtn && speedMenu) {
            speedBtn.onclick = () => speedMenu.classList.toggle('active');
            
            document.querySelectorAll('.speed-option').forEach(option => {
                option.onclick = () => {
                    const speed = parseFloat(option.dataset.speed);
                    this.player.playbackRate = speed;
                    
                    document.querySelectorAll('.speed-option').forEach(opt => 
                        opt.classList.remove('active')
                    );
                    option.classList.add('active');
                    speedMenu.classList.remove('active');
                };
            });
        }

        // Loading state
        this.player.onwaiting = () => {
            document.getElementById('video-loading')?.classList.add('show');
        };

        this.player.oncanplay = () => {
            document.getElementById('video-loading')?.classList.remove('show');
        };

        // Mostrar/ocultar controles
        const videoContainer = document.querySelector('.video-wrapper');
        const controls = document.querySelector('.video-controls');
        let controlsTimeout;

        videoContainer.addEventListener('mousemove', () => {
            controls.classList.add('show');
            clearTimeout(controlsTimeout);
            controlsTimeout = setTimeout(() => {
                if (!this.player.paused) {
                    controls.classList.remove('show');
                }
            }, 3000);
        });

        videoContainer.addEventListener('mouseleave', () => {
            if (!this.player.paused) {
                controls.classList.remove('show');
            }
        });
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

    toggleMute() {
        this.player.muted = !this.player.muted;
        const volumeBtn = document.getElementById('volume-btn');
        if (volumeBtn) {
            volumeBtn.textContent = this.player.muted ? '🔇' : '🔊';
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
        // Abrir smartlink em nova aba
        window.open('https://www.effectivegatecpm.com/eacwhk55f?key=87f8fc919fb5d70a825293b5490713dd', '_blank');

        // Incrementar contador
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

        // Mostrar mensagem de sucesso
        this.showToast('Player liberado! Bom filme! 🎬');
    }

    // BOTÕES DE AÇÃO
    setupActionButtons() {
        // Transmitir (Cast)
        const castBtn = document.getElementById('cast-btn');
        if (castBtn) {
            castBtn.onclick = () => this.handleCast();
        }

        // Download
        const downloadBtn = document.getElementById('download-btn');
        if (downloadBtn) {
            downloadBtn.onclick = () => this.handleDownload();
        }

        // Trailer
        const trailerBtn = document.getElementById('trailer-btn');
        if (trailerBtn) {
            trailerBtn.onclick = () => this.handleTrailer();
        }

        // Compartilhar
        const shareBtn = document.getElementById('share-btn');
        if (shareBtn) {
            shareBtn.onclick = () => this.handleShare();
        }
    }

    async handleCast() {
        if ('presentation' in navigator) {
            try {
                const request = new PresentationRequest([this.movieData.link]);
                const connection = await request.start();
                this.showToast('Transmitindo para TV...');
            } catch (error) {
                this.showToast('Nenhum dispositivo encontrado');
            }
        } else {
            this.showToast('Recurso não disponível neste navegador');
        }
    }

    handleDownload() {
        if (this.movieData.link) {
            const a = document.createElement('a');
            a.href = this.movieData.link;
            a.download = this.movieData.nome + '.mp4';
            a.click();
            this.showToast('Download iniciado!');
        }
    }

    handleTrailer() {
        if (!this.movieData.trailer) {
            this.showToast('Trailer não disponível');
            return;
        }

        const modal = document.getElementById('trailer-modal');
        const iframe = document.getElementById('trailer-iframe');
        
        if (modal && iframe) {
            // Extrair ID do YouTube
            let videoId = '';
            if (this.movieData.trailer.includes('youtube.com')) {
                videoId = new URL(this.movieData.trailer).searchParams.get('v');
            } else if (this.movieData.trailer.includes('youtu.be')) {
                videoId = this.movieData.trailer.split('/').pop();
            }

            if (videoId) {
                iframe.src = `https://www.youtube.com/embed/${videoId}`;
                modal.classList.add('active');
            }
        }
    }

    async handleShare() {
        const shareData = {
            title: this.movieData.nome,
            text: `Assista ${this.movieData.nome} no PipocaFlix!`,
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
            // Fallback: copiar link
            navigator.clipboard.writeText(window.location.href);
            this.showToast('Link copiado para a área de transferência!');
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
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
            animation: fadeInUp 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOutDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    showError(message) {
        const container = document.querySelector('.player-page');
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
let moviePlayer;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        moviePlayer = new MoviePlayer();
        moviePlayer.setupActionButtons();
    });
} else {
    moviePlayer = new MoviePlayer();
    moviePlayer.setupActionButtons();
}