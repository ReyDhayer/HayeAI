import axios from 'axios';
 
const YOUTUBE_API_KEY = 'AIzaSyBPrXhkqFXXQGTeilX0kCqZs7yYCqNx9Ck';

export async function getVideoDetails(url: string) {
  try {
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error('URL do YouTube inválida. Insira uma URL completa do YouTube ou ID do vídeo.');
    }

    const response = await axios({
      method: 'GET',
      url: 'https://youtube.googleapis.com/youtube/v3/videos',
      params: {
        part: 'snippet,contentDetails',
        id: videoId,
        key: YOUTUBE_API_KEY
      },
      headers: {
        'Accept': 'application/json',
        'X-Origin': 'https://localhost:3000',
        'Referer': 'https://localhost:3000/'
      },
      validateStatus: (status) => status === 200
    });

    if (!response.data.items?.[0]) {
      throw new Error('Vídeo não encontrado ou privado.');
    }

    const videoData = response.data.items[0];
    return {
      title: videoData.snippet?.title || 'Sem título',
      description: videoData.snippet?.description || 'Sem descrição',
      duration: videoData.contentDetails?.duration || 'Duração não disponível',
      channelTitle: videoData.snippet?.channelTitle || 'Canal desconhecido',
      id: videoId
    };
  } catch (error) {
    console.error('YouTube API Error:', error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('Acesso à API do YouTube bloqueado. Tente novamente mais tarde.');
      }
      if (error.response?.status === 400) {
        throw new Error('ID do vídeo inválido. Verifique a URL.');
      }
    }
    throw new Error('Falha ao obter dados do vídeo. Verifique a URL e tente novamente.');
  }
}

function extractVideoId(url: string): string | null {
  if (!url) return null;

  // Handle direct video ID input
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    // Handle youtube.com URLs
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v');
    }
    // Handle youtu.be URLs
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
  } catch {
    // Handle partial URLs or IDs
    const patterns = [
      /(?:v=|youtu\.be\/|\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^[a-zA-Z0-9_-]{11}$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) return match[1];
    }
  }
  
  return null;
}