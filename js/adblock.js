// js/adblock.js

class AdBlockDetector {
    constructor() {
        this.isAdBlockEnabled = false;
        this.checkInterval = null;
        this.init();
    }

    init() {
        // Verificar AdBlock ao carregar
        this.detectAdBlock();
        
        // Verificar periodicamente
        this.checkInterval = setInterval(() => {
            this.detectAdBlock();
        }, 5000);
    }

    async detectAdBlock() {
        // Método 1: Criar elemento isca
        const bait = this.createBait();
        document.body.appendChild(bait);

        await new Promise(resolve => setTimeout(resolve, 100));

        const isBlocked = this.checkBait(bait);
        bait.remove();

        if (isBlocked) {
            this.handleAdBlockDetected();
        } else {
            this.handleAdBlockDisabled();
        }
    }

    createBait() {
        const bait = document.createElement('div');
        bait.className = 'ad ads advertisement banner-ad google-ad';
        bait.style.cssText = `
            width: 1px;
            height: 1px;
            position: absolute;
            top: -9999px;
            left: -9999px;
        `;
        bait.innerHTML = '&nbsp;';
        return bait;
    }

    checkBait(bait) {
        const styles = window.getComputedStyle(bait);
        
        // Verificar se foi escondido
        if (styles.display === 'none' || 
            styles.visibility === 'hidden' || 
            bait.offsetHeight === 0 ||
            bait.offsetWidth === 0) {
            return true;
        }

        return false;
    }

    handleAdBlockDetected() {
        if (this.isAdBlockEnabled) return;
        
        this.isAdBlockEnabled = true;
        console.warn('AdBlock detectado!');
        
        // Mostrar overlay bloqueando o site
        this.showAdBlockWarning();
    }

    handleAdBlockDisabled() {
        if (!this.isAdBlockEnabled) return;
        
        this.isAdBlockEnabled = false;
        this.hideAdBlockWarning();
    }

    showAdBlockWarning() {
        // Verificar se já existe
        if (document.getElementById('adblock-warning')) return;

        const overlay = document.createElement('div');
        overlay.id = 'adblock-warning';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.98);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
        `;

        overlay.innerHTML = `
            <div style="
                text-align: center;
                max-width: 600px;
                padding: 3rem;
                background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            ">
                <div style="
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #e50914 0%, #b20710 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 2rem;
                    font-size: 3rem;
                ">
                    🚫
                </div>
                
                <h2 style="
                    font-size: 2rem;
                    margin-bottom: 1rem;
                    color: #e50914;
                    font-weight: 700;
                ">
                    AdBlock Detectado
                </h2>
                
                <p style="
                    font-size: 1.1rem;
                    line-height: 1.8;
                    color: #a3a3a3;
                    margin-bottom: 2rem;
                ">
                    Para continuar assistindo, por favor desative o AdBlock neste site. 
                    Os anúncios nos ajudam a manter o serviço gratuito para você! 🎬
                </p>
                
                <div style="
                    background: rgba(229, 9, 20, 0.1);
                    border: 2px solid rgba(229, 9, 20, 0.3);
                    border-radius: 8px;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                ">
                    <h3 style="
                        font-size: 1.1rem;
                        margin-bottom: 1rem;
                        color: white;
                    ">
                        Como desativar o AdBlock:
                    </h3>
                    <ol style="
                        text-align: left;
                        color: #a3a3a3;
                        line-height: 2;
                        padding-left: 1.5rem;
                    ">
                        <li>Clique no ícone do AdBlock no navegador</li>
                        <li>Selecione "Pausar neste site" ou "Desativar"</li>
                        <li>Recarregue a página</li>
                    </ol>
                </div>
                
                <button onclick="location.reload()" style="
                    background: linear-gradient(135deg, #e50914 0%, #b20710 100%);
                    color: white;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 8px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s ease;
                    box-shadow: 0 4px 16px rgba(229, 9, 20, 0.4);
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    Já desativei - Recarregar Página
                </button>
            </div>
        `;

        document.body.appendChild(overlay);

        // Bloquear scroll
        document.body.style.overflow = 'hidden';
    }

    hideAdBlockWarning() {
        const warning = document.getElementById('adblock-warning');
        if (warning) {
            warning.remove();
            document.body.style.overflow = '';
        }
    }

    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        this.hideAdBlockWarning();
    }
}

// Inicializar detector
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.adBlockDetector = new AdBlockDetector();
    });
} else {
    window.adBlockDetector = new AdBlockDetector();
}