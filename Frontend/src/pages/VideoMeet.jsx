import React, { useContext, useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import io from "socket.io-client";
import {
    Video, VideoOff, PhoneOff, Mic, MicOff,
    MonitorUp, MonitorOff, MessageSquare, X, Send, Users, Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import server from '../environment';
import { AuthContext } from '../contexts/AuthContext.js';
import api from '../utils/api';
import VideoTile from '../components/VideoTile';

const server_url = server;
// moved connections to useRef inside component

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" },
        { "urls": "stun:stun1.l.google.com:19302" },
        { "urls": "stun:global.stun.twilio.com:3478" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();
    let connectionsRef = useRef({});

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [video, setVideo] = useState(true);
    let [audio, setAudio] = useState(true);
    let [screen, setScreen] = useState();
    let [showModal, setModal] = useState(false);
    let [screenAvailable, setScreenAvailable] = useState();
    let [messages, setMessages] = useState([]);
    let [message, setMessage] = useState("");
    let [newMessages, setNewMessages] = useState(0);

    let [joinStep, setJoinStep] = useState('loading'); // loading, lobby, meeting, error
    let [joinError, setJoinError] = useState("");
    let [username, setUsername] = useState("");

    let [videos, setVideos] = useState([])

    const { user, isAuthenticated, addToUserHistory } = useContext(AuthContext);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { meetingCode } = useParams();

    // Validate meeting and initialize name
    useEffect(() => {
        const validateMeeting = async () => {
            try {
                if (meetingCode) {
                    await api.post("/api/meeting/join", { meetingCode });
                }

                const guestName = searchParams.get('guest');
                if (isAuthenticated && user) {
                    setUsername(user.name || user.username);
                } else if (guestName) {
                    setUsername(decodeURIComponent(guestName));
                }

                setJoinStep('lobby');
            } catch (err) {
                setJoinError(err.response?.data?.message || "Invalid meeting code.");
                setJoinStep('error');
            }
        };

        validateMeeting();

        // Cleanup: disconnect socket and close all peer connections on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }

            // Close all active WebRTC connections
            // Use local variable to satisfy exhaustive-deps and ensure correct ref value on cleanup
            // eslint-disable-next-line react-hooks/exhaustive-deps
            const currentConnections = connectionsRef.current;
            for (let id in currentConnections) {
                if (currentConnections[id]) {
                    currentConnections[id].close();
                }
                delete currentConnections[id];
            }

            // Stop all local tracks
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isAuthenticated, user, searchParams, meetingCode]);

    // getDislayMedia legacy function removed safely

    const getPermissions = async () => {
        try {
            // Safari/Firefox standard: Request once batched.
            const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

            // Explicitly ensure audio is enabled
            userMediaStream.getAudioTracks().forEach(track => { track.enabled = true; });
            console.log("[WebRTC] Initial audio track enabled:", userMediaStream.getAudioTracks().length > 0 ? userMediaStream.getAudioTracks()[0].enabled : "No track");
            console.log("[WebRTC] Initial video track enabled:", userMediaStream.getVideoTracks().length > 0 ? userMediaStream.getVideoTracks()[0].enabled : "No track");

            setVideoAvailable(true);
            setAudioAvailable(true);
            setVideo(true);
            setAudio(true);

            window.localStream = userMediaStream;
            if (localVideoref.current) {
                localVideoref.current.srcObject = userMediaStream;
            }

            // Check Screen device availability softly
            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

        } catch (error) {
            console.log("Media Access Error:", error.name, error.message);

            // Fallback: If camera is broken/in-use, try Audio only
            if (error.name === "NotReadableError" || error.name === "OverconstrainedError" || error.name === "NotFoundError") {
                try {
                    const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                    audioOnlyStream.getAudioTracks().forEach(track => { track.enabled = true; });
                    console.log("[WebRTC] Fallback audio track enabled:", audioOnlyStream.getAudioTracks()[0]?.enabled);

                    setVideoAvailable(false);
                    setAudioAvailable(true);
                    setVideo(false);
                    setAudio(true);

                    window.localStream = audioOnlyStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = audioOnlyStream;
                    }
                    if (navigator.mediaDevices.getDisplayMedia) setScreenAvailable(true);
                } catch (audioError) {
                    console.log("Audio Fallback Error:", audioError);
                    alert("Could not access camera or microphone. Please check your permissions.");
                    setVideoAvailable(false);
                    setAudioAvailable(false);
                }
            } else if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
                // User explicitly clicked "Deny"
                alert("You have denied media permissions. You can still join, but others won't see or hear you.");
                setVideoAvailable(false);
                setAudioAvailable(false);
                setVideo(false);
                setAudio(false);
            }
        }
    };

    // Removed problematic useEffect that recursively called getUserMedia
    // Instead of completely reconstructing the stream, we just toggle track.enabled in handleAudio/handleVideo

    let getMedia = () => {
        // Assume connectToSocketServer is called only after resolving the initial media prompt
        connectToSocketServer();
    }

    // getUserMediaSuccess removed as it is now integrated directly into connectToSocketServer logic or no longer needed.

    // Removed unused getUserMedia refresh helper to simplify WebRTC logic and satisfy ESLint.

    // getDislayMediaSuccess legacy function removed safely

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connectionsRef.current[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connectionsRef.current[fromId].createAnswer().then((description) => {
                            connectionsRef.current[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connectionsRef.current[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connectionsRef.current[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, {
            secure: false,
            transports: ["websocket", "polling"]
        })

        socketRef.current.on('signal', gotMessageFromServer)

        // Register chat-message listener ONCE (outside 'connect' event)
        socketRef.current.on('chat-message', addMessage)

        socketRef.current.on('user-left', (id) => {
            console.log(`[WebRTC] User left: ${id}. Cleaning up connection.`);

            // Properly close the peer connection to avoid memory leaks
            if (connectionsRef.current[id]) {
                connectionsRef.current[id].close();
                delete connectionsRef.current[id];
            }

            setVideos((videos) => videos.filter((video) => video.socketId !== id))
        })

        socketRef.current.on('connect', () => {
            console.log("[Socket] Connected. Joining call...");
            // Send username directly to the backend mapping on join
            socketRef.current.emit('join-call', meetingCode, username)
            socketIdRef.current = socketRef.current.id
        })

        socketRef.current.on('user-joined', (id, clients) => {
            console.log(`[Socket] User joined event: ${id}`);
            clients.forEach((clientInfo) => {
                let socketListId = typeof clientInfo === 'string' ? clientInfo : clientInfo.socketId;
                let clientUsername = typeof clientInfo === 'string' ? "Participant" : clientInfo.username;

                if (connectionsRef.current[socketListId]) return; // Skip if already connected

                console.log(`[WebRTC] Initializing PeerConnection for: ${socketListId}`);
                connectionsRef.current[socketListId] = new RTCPeerConnection(peerConfigConnections)

                // Wait for their ice candidate       
                connectionsRef.current[socketListId].onicecandidate = function (event) {
                    if (event.candidate != null) {
                        socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                    }
                }

                // Wait for their video/audio stream
                connectionsRef.current[socketListId].ontrack = (event) => {
                    const track = event.track;
                    console.log(`[WebRTC] Received remote track:`, track.kind, track.id);
                    console.log(`[WebRTC] Track state: ${track.readyState}, muted: ${track.muted}, enabled: ${track.enabled}`);

                    setVideos(prevVideos => {
                        let existingVideoIndex = prevVideos.findIndex(v => v.socketId === socketListId);

                        if (existingVideoIndex !== -1) {
                            // Accumulate new track into the existing video stream safely
                            const existingVid = prevVideos[existingVideoIndex];
                            let existingStream = existingVid.stream;

                            // Ensure the track is NOT already in the stream (check by ID)
                            const hasTrack = existingStream.getTracks().some(t => t.id === track.id);
                            if (!hasTrack) {
                                existingStream.addTrack(track);
                                console.log(`[WebRTC] Appended new ${track.kind} track to stream for ${socketListId}`);
                            }

                            // Also sync any other tracks in the event's streams if present
                            if (event.streams && event.streams[0]) {
                                event.streams[0].getTracks().forEach(t => {
                                    if (!existingStream.getTracks().some(et => et.id === t.id)) {
                                        existingStream.addTrack(t);
                                        console.log(`[WebRTC] Appended bundled ${t.kind} track to ${socketListId}`);
                                    }
                                });
                            }

                            // CRITICAL Chrome Fix: Create a FRESH MediaStream instance to force re-binding of srcObject
                            // This "nudges" the browser to activate the audio engine for an already playing element.
                            const refreshedStream = new MediaStream(existingStream.getTracks());

                            const updatedVideos = [...prevVideos];
                            updatedVideos[existingVideoIndex] = {
                                ...existingVid,
                                stream: refreshedStream
                            };

                            console.log(`[WebRTC] Forced stream refresh for ${socketListId} to activate ${track.kind} track.`);

                            // Nudge video playback after React re-renders with the new stream ref.
                            // Video stays muted — remote audio is handled by Web Audio API in VideoTile.
                            setTimeout(() => {
                                const vidEl = document.querySelector(`video[data-socket="${socketListId}"]`);
                                if (vidEl) {
                                    vidEl.play().catch(e => {
                                        if (e.name !== 'AbortError') {
                                            console.warn("[WebRTC] Delayed track play failed:", e.name);
                                        }
                                    });
                                }
                            }, 150);

                            return updatedVideos;
                        } else {
                            // First track arriving for this participant
                            console.log(`[WebRTC] Creating new participant UI for ${socketListId} starting with ${track.kind}`);

                            let remoteStream = (event.streams && event.streams[0]) ? event.streams[0] : new MediaStream([track]);
                            let newVideo = {
                                socketId: socketListId,
                                stream: remoteStream,
                                username: clientUsername,
                                autoplay: true,
                                playsinline: true,
                                autoplayFailed: false
                            };

                            return [...prevVideos, newVideo];
                        }
                    });
                };

                // Add the local video stream using modern addTrack iteration.
                if (window.localStream !== undefined && window.localStream !== null) {
                    window.localStream.getTracks().forEach(track => {
                        connectionsRef.current[socketListId].addTrack(track, window.localStream);
                    });
                } else {
                    let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                    window.localStream = blackSilence()
                    window.localStream.getTracks().forEach(track => {
                        connectionsRef.current[socketListId].addTrack(track, window.localStream);
                    });
                }
            })

            // If WE are the one who just joined, initiate offers to everyone else
            if (id === socketIdRef.current) {
                console.log("[WebRTC] We joined. Initiating offers to all existing peers.");
                for (let id2 in connectionsRef.current) {
                    if (id2 === socketIdRef.current) continue

                    try {
                        window.localStream.getTracks().forEach(track => {
                            connectionsRef.current[id2].addTrack(track, window.localStream);
                        });
                    } catch (e) {
                        console.error("[WebRTC] Error adding local track to peer:", e);
                    }

                    connectionsRef.current[id2].createOffer().then((description) => {
                        connectionsRef.current[id2].setLocalDescription(description)
                            .then(() => {
                                socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connectionsRef.current[id2].localDescription }))
                            })
                            .catch(e => console.log(e))
                    })
                }
            }
        })
    }

    let silence = () => {
        if (!window.audioCtx) {
            window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        let ctx = window.audioCtx;
        if (ctx.state === 'suspended') ctx.resume();

        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = () => {
        setVideo(!video);
        if (window.localStream) {
            window.localStream.getVideoTracks().forEach(track => {
                track.enabled = !video; // Toggle state
            });
            console.log("[WebRTC] Video track enabled:", !video);
        }
    }
    let handleAudio = () => {
        setAudio(!audio);
        if (window.localStream) {
            window.localStream.getAudioTracks().forEach(track => {
                track.enabled = !audio; // Toggle state
            });
            console.log("[WebRTC] Audio track enabled:", !audio);
        }
        // Interaction trigger to ensure audio engine is active
        unlockAudio();
    }

    let stopScreenShare = async () => {
        try {
            console.log("[WebRTC] Stopping screen share, restoring camera...");
            // Re-acquire camera stream natively
            const cameraStream = await navigator.mediaDevices.getUserMedia({
                video: video, // Respect current video toggle state
                audio: true   // Always request audio to ensure we get a fresh track
            });
            const cameraTrack = cameraStream.getVideoTracks()[0];
            const cameraAudioTrack = cameraStream.getAudioTracks()[0];

            // Hot-swap BOTH video AND audio senders for all remote peers
            for (let id in connectionsRef.current) {
                if (id === socketIdRef.current) continue;
                const senders = connectionsRef.current[id].getSenders();

                // Replace video sender with camera track
                const videoSender = senders.find(s => s.track && s.track.kind === "video");
                if (videoSender && cameraTrack) {
                    await videoSender.replaceTrack(cameraTrack);
                }

                // Replace audio sender with the new audio track
                const audioSender = senders.find(s => s.track && s.track.kind === "audio");
                if (audioSender && cameraAudioTrack) {
                    await audioSender.replaceTrack(cameraAudioTrack);
                    console.log(`[WebRTC] Replaced audio track for peer: ${id}`);
                }
            }

            // Now safe to stop old tracks — peers have been given the new ones
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop());
            }

            // Build new local stream for UI
            const newStream = new MediaStream();
            if (cameraTrack) newStream.addTrack(cameraTrack);
            if (cameraAudioTrack) newStream.addTrack(cameraAudioTrack);

            window.localStream = newStream;
            setScreen(false);

            // Respect the user's current audio toggle
            if (!audio && cameraAudioTrack) {
                cameraAudioTrack.enabled = false;
            }

            console.log("[WebRTC] Camera stream restored successfully.");
        } catch (error) {
            console.error("[WebRTC] Failed to restore camera after screen share", error);
            setScreen(false);
        }
    };

    let handleScreen = async () => {
        if (!screen) {
            try {
                console.log("[WebRTC] Initiating screen share...");
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const screenTrack = screenStream.getVideoTracks()[0];

                // Auto-stop if user clicks "Stop sharing" in browser UI
                screenTrack.onended = () => {
                    console.log("[WebRTC] Screen track ended via browser UI.");
                    stopScreenShare();
                };

                // Hot-swap screen track into all active peer connections
                for (let id in connectionsRef.current) {
                    if (id === socketIdRef.current) continue;
                    const senders = connectionsRef.current[id].getSenders();
                    const videoSender = senders.find(s => s.track && s.track.kind === "video");
                    if (videoSender) {
                        await videoSender.replaceTrack(screenTrack);
                        console.log(`[WebRTC] Replaced video track with screen for: ${id}`);
                    }
                }

                // Update local preview with a FRESH MediaStream reference
                const newLocalStream = new MediaStream([screenTrack]);
                // Preserve audio if possible
                const audioTrack = window.localStream?.getAudioTracks()[0];
                if (audioTrack) newLocalStream.addTrack(audioTrack);

                // Stop old video tracks
                if (window.localStream) {
                    window.localStream.getVideoTracks().forEach(t => t.stop());
                }

                window.localStream = newLocalStream;
                setScreen(true);
                console.log("[WebRTC] Screen sharing active.");
            } catch (error) {
                console.error("[WebRTC] Screen share initiation failed:", error);
                setScreen(false);
            }
        } else {
            stopScreenShare();
        }
    };

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (err) {
            console.error("[WebRTC] Error stopping tracks on end call:", err);
        }

        // Route according to user identity, avoiding a hard reload that might reset context
        if (isAuthenticated) {
            navigate("/home");
        } else {
            navigate("/");
        }
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }
    let closeChat = () => {
        setModal(false);
    }
    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };

    let sendMessage = (e) => {
        if (e) e.preventDefault();
        if (!message.trim()) return;
        // We do not need to send username in payload anymore, backend uses identity mapping
        socketRef.current.emit('chat-message', message)
        setMessage("");
    }

    const unlockAudio = () => {
        // Resume AudioContext if suspended (for silence() track generator)
        if (window.audioCtx && window.audioCtx.state === 'suspended') {
            window.audioCtx.resume().then(() => {
                console.log("[WebRTC] AudioContext resumed successfully.");
            });
        }

        // Unmute and play all REMOTE video elements (they carry audio)
        document.querySelectorAll("video[data-socket]").forEach(v => {
            if (v.muted) {
                v.muted = false;
                v.volume = 1.0;
                v.play().then(() => {
                    console.log("[WebRTC] Unmuted remote video via user gesture.");
                }).catch(e => {
                    if (e.name !== 'AbortError') {
                        console.warn("[WebRTC] Unmute failed, re-muting:", e.name);
                        v.muted = true;
                        v.play().catch(() => { });
                    }
                });
            }
        });
    };

    // Chrome Autoplay Policy / Audio Unlock mechanism
    // Use a PERSISTENT listener (not {once: true}) because remote streams may arrive
    // after the first user click. The listener stays active for the entire meeting.
    useEffect(() => {
        const handler = () => unlockAudio();
        document.addEventListener("click", handler);
        document.addEventListener("keydown", handler, { once: true });
        return () => {
            document.removeEventListener("click", handler);
            document.removeEventListener("keydown", handler);
        };
    }, []);

    let connect = async () => {
        if (!username.trim()) return;

        // Initialize/Resume AudioContext early
        try {
            if (!window.audioCtx) {
                window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (window.audioCtx.state === 'suspended') {
                window.audioCtx.resume();
            }
            console.log("[WebRTC] Initialized/Resumed global AudioContext for meeting.");
        } catch (e) { console.error("AudioContext init failed", e); }

        // Save to history if authenticated
        if (isAuthenticated) {
            try {
                await addToUserHistory(meetingCode);
            } catch (err) {
                console.error("Failed to add to history:", err);
            }
        }

        setJoinStep('meeting');
        await getPermissions();
        getMedia();
    }

    // ─── Render Logic ──────────────────────────────────────────

    if (joinStep === 'loading') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-navy-900 text-white">
                <svg className="animate-spin h-10 w-10 text-teal mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <h2 className="text-xl font-medium text-white-muted">Preparing Meeting Room...</h2>
            </div>
        );
    }

    if (joinStep === 'error') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-navy-900 text-white p-4 text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <X size={32} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">{joinError}</h2>
                <p className="text-white-muted mb-8 max-w-md">There was a problem accessing this meeting room. Please ensure the link is correct.</p>
                <button
                    onClick={() => navigate('/home')}
                    className="px-6 py-3 bg-teal hover:bg-teal-hover text-navy-900 font-bold rounded-lg transition-colors"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    if (joinStep === 'lobby') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3"></div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border border-accent shadow-sm w-full max-w-md p-8 rounded-2xl relative z-10"
                >
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 shadow-sm">
                            <Video size={24} />
                        </div>
                        <h1 className="text-2xl font-bold text-textMain mb-2">Join Meeting</h1>
                        <p className="text-sm text-textMuted">Room Code: <span className="font-mono text-primary font-bold">{meetingCode}</span></p>
                    </div>

                    {isAuthenticated && user ? (
                        <div className="space-y-6">
                            <div className="bg-background border border-accent rounded-xl p-4 flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-primary font-bold shadow-inner">
                                    {username.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-textMuted font-medium">Joining as</p>
                                    <p className="font-bold text-textMain">{username}</p>
                                </div>
                            </div>
                            <button
                                onClick={connect}
                                className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-sm"
                            >
                                Enter Room Now
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <p className="text-center text-sm text-textMuted mb-2 font-medium">You are joining as a guest. Please enter your name.</p>
                            <div>
                                <label className="block text-sm font-semibold text-textMain mb-1.5">Your Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-white border border-accent rounded-xl focus:ring-2 focus:ring-primary text-textMain outline-none transition-all shadow-sm placeholder-textMuted"
                                    placeholder="Enter your name"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <button
                                onClick={connect}
                                disabled={!username.trim()}
                                className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Join as Guest
                            </button>
                            <p className="text-center mt-4 text-sm text-textMuted">
                                Have an account? <span className="text-primary hover:text-primary-hover cursor-pointer font-bold transition-colors" onClick={() => navigate(`/auth?returnTo=/meeting/${meetingCode}`)}>Sign In</span>
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        );
    }

    let handleAutoplayFailure = (socketId) => {
        setVideos(prev => prev.map(v => v.socketId === socketId ? { ...v, autoplayFailed: true } : v));
    };

    let retryAutoplay = (socketId) => {
        const vidElement = document.querySelector(`video[data-socket="${socketId}"]`);
        if (vidElement) {
            vidElement.play().then(() => {
                setVideos(prev => prev.map(v => v.socketId === socketId ? { ...v, autoplayFailed: false } : v));
            }).catch(console.error);
        }
    };

    // ACTIVE MEETING UI
    return (
        <div className="h-screen w-full bg-background overflow-hidden flex flex-col relative">

            {/* Header / Info bar (Floating) */}
            <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md border border-accent px-4 py-2 rounded-lg flex items-center gap-3 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                <span className="font-mono text-textMain text-sm font-bold tracking-widest">{meetingCode}</span>
            </div>

            {/* Main Video Area */}
            <div className={`flex-1 flex overflow-hidden ${showModal ? 'w-[calc(100%-350px)]' : 'w-full'} transition-all duration-300`}>
                <div className="flex-1 p-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr items-center justify-center content-center w-full h-[calc(100vh-80px)]">

                    {/* Local Video Component Implementation */}
                    <VideoTile
                        isLocal={true}
                        username={username}
                        videoAvailable={videoAvailable}
                        audioAvailable={audioAvailable}
                    />

                    {/* Remote Videos */}
                    {videos.map((vid) => (
                        <VideoTile
                            key={vid.socketId}
                            vid={vid}
                            retryAutoplay={retryAutoplay}
                            onAutoplayFailure={handleAutoplayFailure}
                            isLocal={false}
                        />
                    ))}
                </div>
            </div>

            {/* Side Chat Panel */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ x: 350, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 350, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute right-0 top-0 w-[350px] h-[calc(100vh-80px)] bg-white border-l border-accent flex flex-col shadow-2xl z-20"
                    >
                        <div className="p-4 border-b border-accent flex justify-between items-center bg-background">
                            <h2 className="text-textMain font-bold flex items-center gap-2">
                                <MessageSquare size={18} className="text-primary" /> In-call Messages
                            </h2>
                            <button onClick={closeChat} className="text-textMuted hover:text-textMain transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-textMuted opacity-60">
                                    <MessageSquare size={32} className="mb-2" />
                                    <p className="text-sm font-medium">No messages yet.</p>
                                    <p className="text-xs mt-1">Say hi to everyone!</p>
                                </div>
                            ) : (
                                messages.map((item, index) => {
                                    const isMe = item.sender === username;
                                    return (
                                        <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <span className="text-xs text-textMuted mb-1 ml-1 font-semibold">{isMe ? "You" : item.sender}</span>
                                            <div className={`px-4 py-2 rounded-2xl max-w-[85%] shadow-sm ${isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-background border border-accent text-textMain rounded-tl-sm'}`}>
                                                <p className="text-sm break-words">{item.data}</p>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        <div className="p-4 bg-background border-t border-accent">
                            <form onSubmit={sendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={handleMessage}
                                    placeholder="Send a message..."
                                    className="flex-1 bg-white border border-accent rounded-lg px-3 py-2 text-textMain text-sm focus:outline-none focus:border-primary transition-colors shadow-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim()}
                                    className="bg-primary hover:bg-primary-hover text-white p-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Control Bar */}
            <div className="h-[80px] w-full bg-white border-t border-accent flex items-center justify-center px-4 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
                    {/* Audio */}
                    <button
                        onClick={handleAudio}
                        className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-sm ${audio ? 'bg-accent hover:bg-accent-darker text-textMain' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'}`}
                        title={audio ? "Mute Microphone" : "Unmute Microphone"}
                    >
                        {audio ? <Mic size={22} /> : <MicOff size={22} />}
                    </button>

                    {/* Video */}
                    <button
                        onClick={handleVideo}
                        className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-sm ${video ? 'bg-accent hover:bg-accent-darker text-textMain' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'}`}
                        title={video ? "Turn Off Camera" : "Turn On Camera"}
                    >
                        {video ? <Video size={22} /> : <VideoOff size={22} />}
                    </button>

                    {/* Screen Share */}
                    {screenAvailable && (
                        <button
                            onClick={handleScreen}
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-sm hidden sm:flex ${screen ? 'bg-primary text-white hover:bg-primary-hover shadow-primary/30' : 'bg-accent hover:bg-accent-darker text-textMain'}`}
                            title={screen ? "Stop Sharing" : "Share Screen"}
                        >
                            {screen ? <MonitorOff size={22} /> : <MonitorUp size={22} />}
                        </button>
                    )}

                    {/* Chat */}
                    <button
                        onClick={() => {
                            if (showModal) closeChat();
                            else openChat();
                        }}
                        className={`relative w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-sm ${showModal ? 'bg-primary text-white border-white' : 'bg-accent hover:bg-accent-darker text-textMain'}`}
                        title="Chat"
                    >
                        <MessageSquare size={22} />
                        {newMessages > 0 && !showModal && (
                            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white transform translate-x-1 -translate-y-1">
                                {newMessages > 9 ? '9+' : newMessages}
                            </span>
                        )}
                    </button>

                    <div className="w-[1px] h-8 bg-accent-darker mx-2"></div>

                    {/* Leave Call */}
                    <button
                        onClick={handleEndCall}
                        className="px-6 h-12 md:h-14 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center gap-2 font-bold shadow-md transition-all"
                        title="Leave Call"
                    >
                        <PhoneOff size={22} />
                        <span className="hidden md:block">Leave Call</span>
                    </button>
                </div>
            </div>

        </div>
    )
}