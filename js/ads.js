// js/ads.js

class AdsManager {
    constructor() {
        this.nativeAdCode = '';
        this.socialAdCode = '';
        this.bannerAdCode = '';
        this.adsLoaded = false;
    }

    // Configurar códigos de anúncios (fornecidos pelo usuário)
    setAdCodes(native, social, banner) {
        this.nativeAdCode = native;
        this.socialAdCode = social;
        this.bannerAdCode = banner;
    }

    // Carregar anúncios nativos
    loadNativeAd(containerId) {
        const container = document.getElementById(containerId);
        if (!container || !this.nativeAdCode) return;

        // Criar script async
        const script = document.createElement('script');
        script.async = true;
        script.innerHTML = this.nativeAdCode;
        
        container.appendChild(script);
        this.adsLoaded = true;
    }

    // Carregar anúncios sociais
    loadSocialAd(containerId) {
        const container = document.getElementById(containerId);
        if (!container || !this.socialAdCode) return;

        const script = document.createElement('script');
        script.async = true;
        script.innerHTML = this.socialAdCode;
        
        container.appendChild(script);
    }

    // Carregar banners
    loadBannerAd(containerId) {
        const container = document.getElementById(containerId);
        if (!container || !this.bannerAdCode) return;

        const script = document.createElement('script');
        script.async = true;
        script.innerHTML = this.bannerAdCode;
        
        container.appendChild(script);
    }

    // Criar container de anúncio nativo
    createNativeAdContainer() {
        const container = document.createElement('div');
        container.id = 'native-ad-container';
        container.className = 'ad-container native-ad';
        container.style.cssText = `
            margin: 2rem auto;
            max-width: 1400px;
            padding: 0 4%;
        `;
        return container;
    }

    // Criar container de banner
    createBannerAdContainer() {
        const container = document.createElement('div');
        container.id = 'banner-ad-container';
        container.className = 'ad-container banner-ad';
        container.style.cssText = `
            margin: 2rem auto;
            text-align: center;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.02);
            border-radius: 8px;
        `;
        return container;
    }

    // Inserir anúncio após N elementos
    insertAdAfterElements(selector, position, adType = 'native') {
        const elements = document.querySelectorAll(selector);
        
        if (elements.length > position) {
            const container = adType === 'native' 
                ? this.createNativeAdContainer() 
                : this.createBannerAdContainer();
            
            elements[position].parentNode.insertBefore(
                container, 
                elements[position].nextSibling
            );
            
            if (adType === 'native') {
                this.loadNativeAd(container.id);
            } else {
                this.loadBannerAd(container.id);
            }
        }
    }

    // Lazy load de anúncios
    lazyLoadAds() {
        const adContainers = document.querySelectorAll('.ad-container[data-ad-type]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.loaded) {
                    const adType = entry.target.dataset.adType;
                    const containerId = entry.target.id;
                    
                    switch(adType) {
                        case 'native':
                            this.loadNativeAd(containerId);
                            break;
                        case 'social':
                            this.loadSocialAd(containerId);
                            break;
                        case 'banner':
                            this.loadBannerAd(containerId);
                            break;
                    }
                    
                    entry.target.dataset.loaded = 'true';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '200px'
        });
        
        adContainers.forEach(container => observer.observe(container));
    }
}

// Instância global
const adsManager = new AdsManager();

// Exemplo de uso (descomentar e adicionar códigos reais):
/*
adsManager.setAdCodes(
    'CÓDIGO_NATIVE_AD_AQUI',
    'CÓDIGO_SOCIAL_AD_AQUI',
    'CÓDIGO_BANNER_AD_AQUI'
);
*/