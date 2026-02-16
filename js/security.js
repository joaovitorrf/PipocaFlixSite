// js/security.js

class SecurityManager {
    constructor() {
        this.init();
    }

    init() {
        this.disableRightClick();
        this.disableKeyboardShortcuts();
        this.disableTextSelection();
        this.detectDevTools();
        this.disablePrintScreen();
        this.preventFraming();
    }

    // BLOQUEAR BOTÃO DIREITO
    disableRightClick() {
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showWarning('Botão direito desabilitado!');
            return false;
        });
    }

    // BLOQUEAR ATALHOS DE TECLADO
    disableKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // F12
            if (e.keyCode === 123) {
                e.preventDefault();
                this.showWarning('DevTools bloqueado!');
                return false;
            }

            // Ctrl+Shift+I (DevTools)
            if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
                e.preventDefault();
                this.showWarning('DevTools bloqueado!');
                return false;
            }

            // Ctrl+Shift+J (Console)
            if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
                e.preventDefault();
                this.showWarning('Console bloqueado!');
                return false;
            }

            // Ctrl+U (View Source)
            if (e.ctrlKey && e.keyCode === 85) {
                e.preventDefault();
                this.showWarning('Código fonte bloqueado!');
                return false;
            }

            // Ctrl+S (Salvar)
            if (e.ctrlKey && e.keyCode === 83) {
                e.preventDefault();
                this.showWarning('Salvar bloqueado!');
                return false;
            }

            // Ctrl+C (Copiar)
            if (e.ctrlKey && e.keyCode === 67) {
                e.preventDefault();
                this.showWarning('Copiar bloqueado!');
                return false;
            }

            // Ctrl+A (Selecionar tudo)
            if (e.ctrlKey && e.keyCode === 65) {
                e.preventDefault();
                return false;
            }
        });
    }

    // BLOQUEAR SELEÇÃO DE TEXTO
    disableTextSelection() {
        document.addEventListener('selectstart', (e) => {
            e.preventDefault();
            return false;
        });

        document.addEventListener('copy', (e) => {
            e.preventDefault();
            this.showWarning('Copiar bloqueado!');
            return false;
        });
    }

    // DETECTAR DEVTOOLS ABERTO
    detectDevTools() {
        const threshold = 160;
        let devtoolsOpen = false;

        const detectDevToolsBySize = () => {
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;
            
            if (widthThreshold || heightThreshold) {
                if (!devtoolsOpen) {
                    devtoolsOpen = true;
                    this.handleDevToolsDetected();
                }
            } else {
                devtoolsOpen = false;
            }
        };

        // Detectar por timing
        const detectDevToolsByTiming = () => {
            const start = performance.now();
            debugger;
            const end = performance.now();
            
            if (end - start > 100) {
                this.handleDevToolsDetected();
            }
        };

        // Verificar a cada 1 segundo
        setInterval(detectDevToolsBySize, 1000);
        
        // Verificar por console.log
        const element = new Image();
        Object.defineProperty(element, 'id', {
            get: () => {
                this.handleDevToolsDetected();
                return 'devtools-detector';
            }
        });
        
        setInterval(() => {
            console.log(element);
            console.clear();
        }, 1000);
    }

    // AÇÃO QUANDO DEVTOOLS É DETECTADO
    handleDevToolsDetected() {
        // Redirecionar para outra página
        setTimeout(() => {
            window.location.href = 'https://google.com';
        }, 100);
    }

    // BLOQUEAR PRINT SCREEN
    disablePrintScreen() {
        document.addEventListener('keyup', (e) => {
            if (e.key === 'PrintScreen') {
                navigator.clipboard.writeText('');
                this.showWarning('Screenshot bloqueado!');
            }
        });

        // Detectar quando a janela perde o foco (possível print screen)
        document.addEventListener('blur', () => {
            setTimeout(() => {
                navigator.clipboard.writeText('');
            }, 100);
        });
    }

    // PREVENIR IFRAME
    preventFraming() {
        if (window.self !== window.top) {
            window.top.location = window.self.location;
        }
    }

    // MOSTRAR AVISO
    showWarning(message) {
        // Criar toast de aviso
        const existingToast = document.querySelector('.security-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'security-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #e50914 0%, #b20710 100%);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            z-index: 99999;
            box-shadow: 0 4px 16px rgba(229, 9, 20, 0.4);
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // OFUSCAR CÓDIGO (chamar isso após o carregamento)
    obfuscate() {
        // Remover comentários do código
        // Renomear variáveis
        // Adicionar código morto
        // IIFE wrapper
        
        (function() {
            const _0x1a2b = ['log', 'warn', 'error', 'info', 'debug'];
            const _0x3c4d = console;
            _0x1a2b.forEach(method => {
                _0x3c4d[method] = function() {};
            });
        })();
    }
}

// CSS para animações do toast
const securityStyles = document.createElement('style');
securityStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    * {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    }
    
    input, textarea {
        user-select: text;
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
    }
`;
document.head.appendChild(securityStyles);

// Inicializar segurança quando o DOM carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.securityManager = new SecurityManager();
    });
} else {
    window.securityManager = new SecurityManager();
}