import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, MicOff } from 'lucide-react';

export default function VideoTile({ 
    vid, 
    _retryAutoplay, 
    isLocal = false, 
    username = '', 
    videoAvailable = true, 
    audioAvailable = true,
    _onAutoplayFailure
}) {
    const videoElRef = useRef(null);
    const [needsUnmute, setNeedsUnmute] = useState(false);

    /**
     * STRATEGY (Simple & Proven — used by Jitsi Meet, Google Meet):
     * 
     * LOCAL video:  <video muted> — always muted to prevent echo
     * REMOTE video: <video> with autoplay attempt:
     *   1. Try play() with audio (unmuted) — works if user has interacted with page
     *   2. If blocked by Chrome autoplay policy → mute, play muted, show "Click to unmute"
     *   3. On ANY user click → unmute all remote videos
     * 
     * No Web Audio API. No hidden <audio> elements. Just native <video>.
     */

    // ─── Attach stream and attempt playback ───────────────────
    useEffect(() => {
        const videoEl = videoElRef.current;
        if (!videoEl) return;

        const stream = isLocal ? window.localStream : vid?.stream;
        if (!stream) return;

        // Always reassign srcObject when stream changes
        videoEl.srcObject = stream;

        const tracks = stream.getTracks();
        console.log(`[VideoTile] ${isLocal ? 'LOCAL' : vid?.socketId} stream assigned. Tracks:`,
            tracks.map(t => `${t.kind}:${t.readyState}:enabled=${t.enabled}:muted=${t.muted}`));

        if (isLocal) {
            // Local: always muted to prevent echo
            videoEl.muted = true;
            videoEl.play().catch(() => {});
            return;
        }

        // REMOTE: Try to play WITH audio first
        videoEl.muted = false;
        videoEl.volume = 1.0;

        const playAttempt = videoEl.play();
        if (playAttempt !== undefined) {
            playAttempt
                .then(() => {
                    console.log(`[VideoTile] ✅ Remote video+audio playing for ${vid?.socketId} (unmuted)`);
                    setNeedsUnmute(false);
                })
                .catch((err) => {
                    if (err.name === 'AbortError') return;

                    console.warn(`[VideoTile] ⚠️ Unmuted play blocked for ${vid?.socketId}: ${err.name}`);
                    
                    // Fallback: mute and play (video will show, audio won't)
                    videoEl.muted = true;
                    videoEl.play().then(() => {
                        console.log(`[VideoTile] Video playing muted for ${vid?.socketId}, waiting for user gesture to unmute`);
                        setNeedsUnmute(true);
                    }).catch((e2) => {
                        console.error(`[VideoTile] Even muted play failed for ${vid?.socketId}:`, e2);
                    });
                });
        }

        // When new audio tracks arrive (Chrome often delivers them late),
        // try to unmute the video element again
        const handleTrackEvent = () => {
            const currentTracks = stream.getAudioTracks();
            console.log(`[VideoTile] Track event for ${vid?.socketId}, audio tracks:`, 
                currentTracks.map(t => `${t.readyState}:enabled=${t.enabled}:muted=${t.muted}`));
            
            if (videoEl.muted && currentTracks.length > 0) {
                videoEl.muted = false;
                videoEl.play().then(() => {
                    console.log(`[VideoTile] ✅ Unmuted after track event for ${vid?.socketId}`);
                    setNeedsUnmute(false);
                }).catch(() => {
                    videoEl.muted = true;
                    videoEl.play().catch(() => {});
                });
            }
        };

        // Listen for track unmute and addtrack events
        const audioTracks = stream.getAudioTracks();
        audioTracks.forEach(t => t.addEventListener('unmute', handleTrackEvent));
        stream.addEventListener('addtrack', handleTrackEvent);

        return () => {
            audioTracks.forEach(t => t.removeEventListener('unmute', handleTrackEvent));
            stream.removeEventListener('addtrack', handleTrackEvent);
        };

    }, [isLocal, vid?.stream, vid?.socketId]);

    // ─── Global click to unmute (Chrome needs user gesture) ──────
    useEffect(() => {
        if (isLocal || !needsUnmute) return;

        const handleGesture = () => {
            const videoEl = videoElRef.current;
            if (!videoEl) return;

            videoEl.muted = false;
            videoEl.volume = 1.0;
            videoEl.play().then(() => {
                console.log(`[VideoTile] ✅ Unmuted via user gesture for ${vid?.socketId}`);
                setNeedsUnmute(false);
            }).catch(() => {
                // Still blocked, keep trying on next click
                videoEl.muted = true;
                videoEl.play().catch(() => {});
            });
        };

        document.addEventListener('click', handleGesture);
        document.addEventListener('keydown', handleGesture, { once: true });

        return () => {
            document.removeEventListener('click', handleGesture);
            document.removeEventListener('keydown', handleGesture);
        };
    }, [isLocal, needsUnmute, vid?.socketId]);

    // ─── Keep local stream in sync ────────────────────────────
    useEffect(() => {
        if (!isLocal) return;
        const videoEl = videoElRef.current;
        if (!videoEl || !window.localStream) return;
        if (videoEl.srcObject === window.localStream) return;

        videoEl.srcObject = window.localStream;
        videoEl.muted = true;
        videoEl.play().catch(() => {});
    });

    // ─── Manual unmute handler ────────────────────────────────
    const handleManualUnmute = useCallback(() => {
        const videoEl = videoElRef.current;
        if (!videoEl) return;

        // Resume AudioContext if it exists (for silence() generator)
        if (window.audioCtx && window.audioCtx.state === 'suspended') {
            window.audioCtx.resume();
        }

        videoEl.muted = false;
        videoEl.volume = 1.0;
        videoEl.play().then(() => {
            console.log(`[VideoTile] ✅ Manual unmute succeeded for ${vid?.socketId}`);
            setNeedsUnmute(false);
        }).catch(e => {
            console.error(`[VideoTile] Manual unmute failed:`, e);
        });
    }, [vid?.socketId]);

    return (
        <div className="relative w-full h-full min-h-[200px] bg-background border border-accent rounded-2xl overflow-hidden shadow-sm group hover:shadow-md transition-shadow">
            
            {/* Single video element — muted for local, unmuted for remote */}
            <video
                data-socket={!isLocal ? vid?.socketId : undefined}
                ref={videoElRef}
                autoPlay
                playsInline
                // Local is always muted. Remote starts unmuted (or gets muted if autoplay blocks)
                muted={isLocal}
                className={`w-full h-full object-cover ${!videoAvailable && isLocal ? 'hidden' : ''}`}
            ></video>

            {/* Local Fallback Avatar if camera is disabled */}
            {isLocal && !videoAvailable && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
                    <div className="w-16 h-16 bg-accent border border-accent rounded-full flex items-center justify-center mb-2 shadow-sm">
                        <span className="text-2xl text-textMain font-bold">
                            {username.charAt(0).toUpperCase()}
                        </span>
                    </div>
                </div>
            )}

            {/* "Click to Unmute" overlay — only shown if Chrome blocked audio autoplay */}
            {!isLocal && needsUnmute && (
                <div className="absolute top-3 right-3 z-20">
                    <button 
                        onClick={handleManualUnmute}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg animate-pulse"
                    >
                        <VolumeX size={16} />
                        Click to Unmute
                    </button>
                </div>
            )}

            {/* Bottom Metadata Label */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 border border-accent rounded-lg text-textMain text-sm font-semibold z-10 flex items-center gap-2 shadow-sm">
                
                {/* Green Live Indicator */}
                <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                
                {isLocal ? `${username} (You)` : (vid?.username || "Participant")}
                
                {!audioAvailable && isLocal && <MicOff size={14} className="text-red-500 ml-1" />}
            </div>
            
        </div>
    );
}
