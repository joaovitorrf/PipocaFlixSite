// js/api.js

class PipocaFlixAPI {
    constructor() {
        this.baserowAPI = baserowAPI;
        this.tables = BASEROW_CONFIG.tables;
        this.fields = BASEROW_CONFIG.fields;
    }

    // BUSCAR CONTEÚDOS RECENTES
    async getRecentContent(limit = 8) {
        try {
            const params = {
                size: limit,
                order_by: '-id'
            };
            
            const data = await this.baserowAPI.getRows(this.tables.conteudos, params);
            return this.formatContentRows(data.results);
        } catch (error) {
            console.error('Erro ao buscar conteúdos recentes:', error);
            return [];
        }
    }

    // BUSCAR BANNERS
    async getBanners(categoria = null) {
        try {
            const params = {
                size: 10,
                order_by: '-id'
            };
            
            if (categoria) {
                params[`filter__field_${this.fields.banners.categoria}__equal`] = categoria;
            }
            
            const data = await this.baserowAPI.getRows(this.tables.banners, params);
            return this.formatBannerRows(data.results);
        } catch (error) {
            console.error('Erro ao buscar banners:', error);
            return [];
        }
    }

    // BUSCAR SESSÕES
    async getSessions() {
        try {
            const data = await this.baserowAPI.getRows(this.tables.sessoes);
            return data.results.map(row => ({
                id: row.id,
                categoria: row[`field_${this.fields.sessoes.categoria}`],
                tipo: row[`field_${this.fields.sessoes.tipo}`]
            }));
        } catch (error) {
            console.error('Erro ao buscar sessões:', error);
            return [];
        }
    }

    // BUSCAR CONTEÚDO POR SESSÃO
    async getContentBySession(categoria, tipo = null, limit = 12) {
        try {
            const params = {
                size: limit,
                order_by: '-id'
            };
            
            // Filtrar por categoria
            params[`filter__field_${this.fields.conteudos.categoria}__contains`] = categoria;
            
            // Filtrar por tipo se especificado
            if (tipo) {
                params[`filter__field_${this.fields.conteudos.tipo}__equal`] = tipo;
            }
            
            const data = await this.baserowAPI.getRows(this.tables.conteudos, params);
            return this.formatContentRows(data.results);
        } catch (error) {
            console.error('Erro ao buscar conteúdo por sessão:', error);
            return [];
        }
    }

    // BUSCAR CONTEÚDO POR ID
    async getContentById(id) {
        try {
            const data = await this.baserowAPI.getRowById(this.tables.conteudos, id);
            return this.formatContentRow(data);
        } catch (error) {
            console.error('Erro ao buscar conteúdo por ID:', error);
            return null;
        }
    }

    // BUSCAR CONTEÚDO POR NOME
    async searchContent(searchTerm) {
        try {
            const data = await this.baserowAPI.searchRows(
                this.tables.conteudos,
                searchTerm,
                `field_${this.fields.conteudos.nome}`
            );
            return this.formatContentRows(data.results);
        } catch (error) {
            console.error('Erro ao buscar conteúdo:', error);
            return [];
        }
    }

    // BUSCAR EPISÓDIOS DE UMA SÉRIE
    async getEpisodes(seriesName) {
        try {
            const params = {
                size: 200,
                order_by: `field_${this.fields.episodios.temporada},field_${this.fields.episodios.episodio}`
            };
            
            // Buscar episódios que contenham o nome da série
            params.search = seriesName;
            
            const data = await this.baserowAPI.getRows(this.tables.episodios, params);
            return this.formatEpisodeRows(data.results);
        } catch (error) {
            console.error('Erro ao buscar episódios:', error);
            return [];
        }
    }

    // BUSCAR CONTEÚDO ALEATÓRIO PARA RECOMENDAÇÕES
    async getRandomContent(excludeId = null, limit = 6) {
        try {
            const params = {
                size: 50,
                order_by: '-id'
            };
            
            const data = await this.baserowAPI.getRows(this.tables.conteudos, params);
            let results = this.formatContentRows(data.results);
            
            // Remover o item atual
            if (excludeId) {
                results = results.filter(item => item.id !== excludeId);
            }
            
            // Embaralhar e pegar apenas o limite
            return this.shuffleArray(results).slice(0, limit);
        } catch (error) {
            console.error('Erro ao buscar conteúdo aleatório:', error);
            return [];
        }
    }

    // FORMATAR DADOS DE CONTEÚDO
    formatContentRows(rows) {
        return rows.map(row => this.formatContentRow(row));
    }

    formatContentRow(row) {
        const fields = this.fields.conteudos;
        
        return {
            id: row.id,
            capa: this.extractImageUrl(row[`field_${fields.capa}`]),
            nome: row[`field_${fields.nome}`] || 'Sem título',
            link: row[`field_${fields.link}`] || '',
            sinopse: row[`field_${fields.sinopse}`] || 'Sinopse não disponível',
            categoria: row[`field_${fields.categoria}`] || '',
            ano: row[`field_${fields.ano}`] || '',
            duracao: row[`field_${fields.duracao}`] || '',
            trailer: row[`field_${fields.trailer}`] || '',
            fotosElenco: this.extractMultipleImages(row[`field_${fields.fotosElenco}`]),
            nomeElenco: row[`field_${fields.nomeElenco}`] || '',
            tipo: row[`field_${fields.tipo}`] || 'Filme'
        };
    }

    // FORMATAR DADOS DE BANNERS
    formatBannerRows(rows) {
        return rows.map(row => ({
            id: row.id,
            imagem: this.extractImageUrl(row[`field_${this.fields.banners.imagem}`]),
            link: row[`field_${this.fields.banners.link}`] || '',
            categoria: row[`field_${this.fields.banners.categoria}`] || ''
        }));
    }

    // FORMATAR DADOS DE EPISÓDIOS
    formatEpisodeRows(rows) {
        return rows.map(row => ({
            id: row.id,
            nome: row[`field_${this.fields.episodios.nome}`] || '',
            temporada: row[`field_${this.fields.episodios.temporada}`] || 1,
            episodio: row[`field_${this.fields.episodios.episodio}`] || 1,
            // O link do episódio geralmente está no campo nome ou em outro campo
            // Ajuste conforme sua estrutura
            link: this.extractVideoLink(row[`field_${this.fields.episodios.nome}`])
        }));
    }

    // EXTRAIR URL DE IMAGEM DO BASEROW
    extractImageUrl(imageField) {
        if (!imageField || imageField.length === 0) {
            return '/assets/images/placeholder.jpg';
        }
        
        // Baserow retorna array de objetos com url
        if (Array.isArray(imageField) && imageField[0]) {
            return imageField[0].url || imageField[0].thumbnails?.large?.url || '/assets/images/placeholder.jpg';
        }
        
        return '/assets/images/placeholder.jpg';
    }

    // EXTRAIR MÚLTIPLAS IMAGENS
    extractMultipleImages(imageField) {
        if (!imageField || !Array.isArray(imageField)) {
            return [];
        }
        
        return imageField.map(img => img.url || img.thumbnails?.large?.url).filter(Boolean);
    }

    // EXTRAIR LINK DE VÍDEO
    extractVideoLink(text) {
        if (!text) return '';
        
        // Procurar por URLs no texto
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const matches = text.match(urlRegex);
        
        return matches ? matches[0] : text;
    }

    // EMBARALHAR ARRAY
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // AGRUPAR EPISÓDIOS POR TEMPORADA
    groupEpisodesBySeason(episodes) {
        const grouped = {};
        
        episodes.forEach(episode => {
            const season = episode.temporada;
            if (!grouped[season]) {
                grouped[season] = [];
            }
            grouped[season].push(episode);
        });
        
        // Ordenar episódios dentro de cada temporada
        Object.keys(grouped).forEach(season => {
            grouped[season].sort((a, b) => a.episodio - b.episodio);
        });
        
        return grouped;
    }

    // LIMPAR CACHE
    clearCache() {
        this.baserowAPI.clearCache();
    }
}

// Instância global
const pipocaFlixAPI = new PipocaFlixAPI();