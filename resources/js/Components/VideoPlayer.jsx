import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../storage/ThemeContext';

const VideoPlayer = ({
    videoUrl,
    title = "Video",
    className = "",
    autoplay = true,
    mute = true,
    loop = false,
    controls = true,
    showControls = true
}) => {
    const { isDarkMode } = useTheme();
    const iframeRef = useRef(null);
    const [isVideoEnded, setIsVideoEnded] = useState(false);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [player, setPlayer] = useState(null);

    // Función para convertir URLs de video al formato embed
    const getEmbedUrl = (url) => {
        if (!url) return null;

        try {
            // Si ya es una URL embed
            if (url.includes('/embed/') || url.includes('player.vimeo.com') || url.includes('player.')) {
                if (url.includes('youtube.com/embed/')) {
                    const hasAutoplay = url.includes('autoplay=');
                    const hasMute = url.includes('mute=');
                    const hasEnablejsapi = url.includes('enablejsapi=');
                    const hasOrigin = url.includes('origin=');

                    let params = [];
                    if (!hasAutoplay && autoplay) params.push('autoplay=1');
                    if (!hasMute && mute) params.push('mute=1');
                    if (!hasEnablejsapi) params.push('enablejsapi=1');
                    if (!hasOrigin) params.push(`origin=${window.location.origin}`);

                    if (params.length > 0) {
                        const separator = url.includes('?') ? '&' : '?';
                        return `${url}${separator}${params.join('&')}`;
                    }
                }
                return url;
            }

            // YouTube normal
            if (url.includes('youtube.com/watch')) {
                const videoId = url.split('v=')[1]?.split('&')[0];
                return videoId
                    ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}${autoplay ? '&autoplay=1' : ''}${mute ? '&mute=1' : ''}${loop ? '&loop=1&playlist=' + videoId : ''}`
                    : null;
            }

            if (url.includes('youtu.be/')) {
                const videoId = url.split('youtu.be/')[1]?.split('?')[0];
                return videoId
                    ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}${autoplay ? '&autoplay=1' : ''}${mute ? '&mute=1' : ''}${loop ? '&loop=1&playlist=' + videoId : ''}`
                    : null;
            }

            // Vimeo
            if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
                const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
                return videoId
                    ? `https://player.vimeo.com/video/${videoId}?autoplay=${autoplay ? '1' : '0'}${mute ? '&muted=1' : ''}`
                    : null;
            }

            if (url.startsWith('http://') || url.startsWith('https://')) {
                return url;
            }

            return null;
        } catch (error) {
            console.error('Error procesando URL de video:', error, 'URL:', url);
            return null;
        }
    };

    useEffect(() => {
        const embedUrl = getEmbedUrl(videoUrl);

        if (!embedUrl || !embedUrl.includes('youtube.com/embed/')) {
            setIsPlayerReady(true);
            return;
        }

        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                initializePlayer(embedUrl);
            };
        } else {
            initializePlayer(embedUrl);
        }

        const initializePlayer = (url) => {
            if (!iframeRef.current) return;
            const videoId = url.split('/embed/')[1]?.split('?')[0];
            if (!videoId) return;

            const ytPlayer = new window.YT.Player(iframeRef.current, {
                videoId: videoId,
                playerVars: {
                    autoplay: autoplay ? 1 : 0,
                    mute: mute ? 1 : 0,
                    loop: loop ? 1 : 0,
                    controls: controls ? 1 : 0,
                    rel: 0,
                    modestbranding: 1,
                    showinfo: 0,
                    iv_load_policy: 3,
                    fs: 1,
                    cc_load_policy: 0,
                    disablekb: 0
                },
                events: {
                    onReady: (event) => {
                        setIsPlayerReady(true);
                        setPlayer(event.target);
                    },
                    onStateChange: (event) => {
                        if (event.data === 0) {
                            setIsVideoEnded(true);
                        } else if (event.data === 1) {
                            setIsVideoEnded(false);
                        }
                    }
                }
            });
        };

        return () => {
            if (player && typeof player.destroy === 'function') {
                player.destroy();
            }
        };
    }, [videoUrl, autoplay, mute, loop, controls]);

    const embedUrl = getEmbedUrl(videoUrl);

    if (!embedUrl) {
        return (
            <div className={`flex items-center justify-center p-8 rounded-lg ${className} ${
                isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
            }`}>
                <div className="text-center">
                    <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p>Video no disponible o URL inválida</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            {/* Video Container */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                    ref={iframeRef}
                    src={embedUrl}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    title={title}
                ></iframe>

                {/* Overlay permanente que bloquea clicks */}
                <div
                    className="absolute top-0 left-0 w-full h-full rounded-lg z-10"
                    style={{ pointerEvents: 'auto', background: 'transparent' }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    title="Interacciones deshabilitadas"
                />
            </div>

            {/* Controles personalizados */}
            {showControls && player && (
                <div className={`mt-4 flex items-center justify-center space-x-4 p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                    <button
                        onClick={() => player.playVideo()}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                            isDarkMode
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                        disabled={!isPlayerReady}
                    >
                        ▶️ Reproducir
                    </button>
                    <button
                        onClick={() => player.pauseVideo()}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                            isDarkMode
                                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                                : 'bg-gray-500 hover:bg-gray-600 text-white'
                        }`}
                        disabled={!isPlayerReady}
                    >
                        ⏸️ Pausar
                    </button>
                    <button
                        onClick={() => {
                            player.seekTo(0);
                            setIsVideoEnded(false);
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                            isDarkMode
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                        disabled={!isPlayerReady}
                    >
                        🔄 Reiniciar
                    </button>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;
