import React, { useState, useEffect, useRef } from 'react';
import { Send, Heart, Star, User, MessageSquare, Video, Lock, Play, Square, RefreshCw, Trash2, X, Eye, EyeOff, Pencil } from 'lucide-react';

// Firebase integrations
import { db, storage, isFirebaseConfigured } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// IndexedDB Helper functions for storage of large raw video blobs
const DB_NAME = "tribute_videos_db";
const DB_VERSION = 1;
const STORE_NAME = "video_messages";

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

function saveVideoMessage(message) {
  return initDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(message);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

function loadVideoMessages() {
  return initDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = () => reject(request.error);
    });
  });
}

function deleteVideoMessage(id) {
  return initDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

export default function Guestbook() {
  // Sticky Notes States
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [noteColor, setNoteColor] = useState("#fef3c7");
  const [avatar, setAvatar] = useState("🧸");
  const [notePasscode, setNotePasscode] = useState("");
  const [showNotePasscode, setShowNotePasscode] = useState(false);

  // Video Guestbook States
  const [videoMessages, setVideoMessages] = useState([]);
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState("");
  
  // Edit Sticky Note States
  const [isEditNoteModalOpen, setIsEditNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editName, setEditName] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editColor, setEditColor] = useState("");

  // Lock Prompt States (For playing/deleting locked videos or editing/deleting notes)
  const [isLockPromptOpen, setIsLockPromptOpen] = useState(false);
  const [lockPromptTarget, setLockPromptTarget] = useState(null);
  const [lockPromptAction, setLockPromptAction] = useState(""); // "play", "delete", "delete_note", "edit_note"
  const [passcodeInput, setPasscodeInput] = useState("");
  const [lockError, setLockError] = useState("");

  // Recording Specific States
  const [recorderStream, setRecorderStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState("idle"); // "idle" | "ready" | "recording" | "finished" | "error"
  const [recordingError, setRecordingError] = useState("");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [senderName, setSenderName] = useState("");
  const [videoPasscode, setVideoPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [isSavingVideo, setIsSavingVideo] = useState(false);

  // Refs for HTML5 Video tags and recording control
  const livePreviewRef = useRef(null);
  const recordedPreviewRef = useRef(null);
  const recorderStreamRef = useRef(null);
  const durationIntervalRef = useRef(null);

  const colors = [
    { name: "Yellow", hex: "#fef3c7" },
    { name: "Pink", hex: "#fce7f3" },
    { name: "Blue", hex: "#dbeafe" },
    { name: "Green", hex: "#d1fae5" },
    { name: "Violet", hex: "#f3e8ff" }
  ];

  const avatars = ["🧸", "🌸", "⭐", "🦋", "🍪", "🐱", "🎒", "✨"];

  // Load sticky notes (real-time from Firestore if configured, otherwise localStorage)
  useEffect(() => {
    let unsubscribeNotes = () => {};

    if (isFirebaseConfigured) {
      try {
        const q = query(collection(db, "notes"), orderBy("id", "desc"));
        unsubscribeNotes = onSnapshot(q, (snapshot) => {
          const notesList = [];
          snapshot.forEach((doc) => {
            notesList.push({ ...doc.data(), docId: doc.id });
          });
          setMessages(notesList);
        }, (error) => {
          console.error("Firestore onSnapshot notes error:", error);
        });
      } catch (err) {
        console.error("Error setting up notes real-time listener:", err);
      }
    } else {
      // Local fallback
      const saved = localStorage.getItem("tribute_guestbook");
      let initialNotes = [];
      if (saved) {
        const parsed = JSON.parse(saved);
        initialNotes = parsed.filter(msg => msg.id !== 1 && msg.id !== 2);
        localStorage.setItem("tribute_guestbook", JSON.stringify(initialNotes));
      }
      setMessages(initialNotes);
    }

    return () => {
      unsubscribeNotes();
    };
  }, []);

  // Load video messages (load local IndexedDB ones, AND real-time from Firestore if configured)
  useEffect(() => {
    let unsubscribeVideos = () => {};

    // 1. Fetch local IndexedDB videos first
    loadVideoMessages().then(localMsgs => {
      setVideoMessages(prev => {
        const merged = [...prev];
        localMsgs.forEach(lv => {
          if (!merged.some(v => v.id === lv.id)) {
            merged.push(lv);
          }
        });
        return merged.sort((a, b) => b.id - a.id);
      });
    }).catch(err => {
      console.error("IndexedDB load error:", err);
    });

    // 2. Fetch real-time Firestore videos if configured
    if (isFirebaseConfigured) {
      try {
        const q = query(collection(db, "videos"), orderBy("id", "desc"));
        unsubscribeVideos = onSnapshot(q, (snapshot) => {
          const cloudList = [];
          snapshot.forEach((doc) => {
            cloudList.push({ ...doc.data(), docId: doc.id });
          });
          
          setVideoMessages(prev => {
            // Keep local videos (those without docId), and merge with cloud videos
            const localOnly = prev.filter(v => !v.docId);
            cloudList.forEach(cv => {
              const index = localOnly.findIndex(item => item.id === cv.id);
              if (index > -1) {
                localOnly[index] = cv;
              } else {
                localOnly.push(cv);
              }
            });
            return localOnly.sort((a, b) => b.id - a.id);
          });
        }, (error) => {
          console.error("Firestore onSnapshot videos error (likely Storage/billing issue):", error);
        });
      } catch (err) {
        console.error("Error setting up videos real-time listener:", err);
      }
    }

    return () => {
      unsubscribeVideos();
    };
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (recorderStreamRef.current) {
        recorderStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  // STICKY NOTES LOGIC
  const saveMessages = (newMsgs) => {
    setMessages(newMsgs);
    localStorage.setItem("tribute_guestbook", JSON.stringify(newMsgs));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    const newMsg = {
      id: Date.now(),
      name: name.trim(),
      content: content.trim(),
      color: noteColor,
      avatar: avatar,
      hearts: 0,
      stars: 0,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      angle: `${(Math.random() - 0.5) * 6}deg`,
      passcode: notePasscode.trim() || null
    };

    if (isFirebaseConfigured) {
      try {
        await addDoc(collection(db, "notes"), newMsg);
      } catch (err) {
        console.error("Error adding note to Firestore:", err);
        alert("Failed to pin note to cloud storage. Running in offline/fallback mode.");
      }
    } else {
      const updated = [newMsg, ...messages];
      saveMessages(updated);
    }

    setName("");
    setContent("");
    setNotePasscode("");
    setShowNotePasscode(false);
  };

  const handleReact = async (id, type) => {
    if (isFirebaseConfigured) {
      const msg = messages.find(m => m.id === id);
      if (msg && msg.docId) {
        try {
          const noteRef = doc(db, "notes", msg.docId);
          await updateDoc(noteRef, {
            hearts: type === 'heart' ? (msg.hearts || 0) + 1 : msg.hearts || 0,
            stars: type === 'star' ? (msg.stars || 0) + 1 : msg.stars || 0
          });
        } catch (err) {
          console.error("Error updating note reaction in Firestore:", err);
        }
      }
    } else {
      const updated = messages.map(msg => {
        if (msg.id === id) {
          return {
            ...msg,
            hearts: type === 'heart' ? msg.hearts + 1 : msg.hearts,
            stars: type === 'star' ? msg.stars + 1 : msg.stars
          };
        }
        return msg;
      });
      saveMessages(updated);
    }
  };

  // Delete note
  const handleDeleteNoteClick = (msg, e) => {
    e.stopPropagation();
    if (msg.passcode) {
      setLockPromptTarget({ ...msg, type: 'note' });
      setLockPromptAction("delete_note");
      setPasscodeInput("");
      setLockError("");
      setIsLockPromptOpen(true);
    } else {
      if (window.confirm(`Are you sure you want to delete the note from ${msg.name}?`)) {
        deleteNoteDirectly(msg.id);
      }
    }
  };

  const deleteNoteDirectly = async (id) => {
    if (isFirebaseConfigured) {
      const msg = messages.find(m => m.id === id);
      if (msg && msg.docId) {
        try {
          await deleteDoc(doc(db, "notes", msg.docId));
        } catch (err) {
          console.error("Error deleting note from Firestore:", err);
          alert("Failed to delete note from cloud storage.");
        }
      }
    } else {
      const updated = messages.filter(msg => msg.id !== id);
      saveMessages(updated);
    }
  };

  // Edit note
  const handleEditNoteClick = (msg, e) => {
    e.stopPropagation();
    if (msg.passcode) {
      setLockPromptTarget({ ...msg, type: 'note' });
      setLockPromptAction("edit_note");
      setPasscodeInput("");
      setLockError("");
      setIsLockPromptOpen(true);
    } else {
      openEditNoteModalDirectly(msg);
    }
  };

  const openEditNoteModalDirectly = (msg) => {
    setEditingNote(msg);
    setEditName(msg.name);
    setEditContent(msg.content);
    setEditAvatar(msg.avatar);
    setEditColor(msg.color);
    setIsEditNoteModalOpen(true);
  };

  const handleSaveEditNote = async (e) => {
    e.preventDefault();
    if (!editingNote) return;

    if (isFirebaseConfigured) {
      if (editingNote.docId) {
        try {
          const noteRef = doc(db, "notes", editingNote.docId);
          await updateDoc(noteRef, {
            name: editName.trim(),
            content: editContent.trim(),
            avatar: editAvatar,
            color: editColor
          });
        } catch (err) {
          console.error("Error editing note in Firestore:", err);
          alert("Failed to save changes to cloud storage.");
        }
      }
    } else {
      const updated = messages.map(msg => {
        if (msg.id === editingNote.id) {
          return {
            ...msg,
            name: editName.trim(),
            content: editContent.trim(),
            avatar: editAvatar,
            color: editColor
          };
        }
        return msg;
      });
      saveMessages(updated);
    }

    setIsEditNoteModalOpen(false);
    setEditingNote(null);
  };

  // VIDEO RECORDING LOGIC
  const openRecordingModal = async () => {
    setIsRecordingModalOpen(true);
    setRecordingStatus("idle");
    setRecordedBlob(null);
    setSenderName("");
    setVideoPasscode("");
    setShowPasscode(false);
    setRecordingDuration(0);
    setRecordingError("");

    setTimeout(() => {
      startCamera();
    }, 100);
  };

  const startCamera = async () => {
    try {
      setRecordingError("");
      setRecordingStatus("ready");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 }, 
        audio: true 
      });
      setRecorderStream(stream);
      recorderStreamRef.current = stream;
      if (livePreviewRef.current) {
        livePreviewRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setRecordingError("Webcam/microphone access was denied or is unavailable. Please grant permissions in your browser.");
      setRecordingStatus("error");
    }
  };

  const startRecording = () => {
    if (!recorderStream) return;
    setRecordingDuration(0);

    let options = { mimeType: 'video/webm;codecs=vp9' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/webm;codecs=vp8' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = { mimeType: '' }; 
        }
      }
    }

    try {
      const recorder = new MediaRecorder(recorderStream, options);
      const chunks = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(finalBlob);
        setRecordingStatus("finished");
        
        setTimeout(() => {
          if (recordedPreviewRef.current) {
            recordedPreviewRef.current.src = URL.createObjectURL(finalBlob);
          }
        }, 150);
      };

      setMediaRecorder(recorder);
      recorder.start(1000); 
      setRecordingStatus("recording");

      const timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      durationIntervalRef.current = timer;
    } catch (err) {
      console.error("MediaRecorder start error:", err);
      setRecordingError("Failed to initiate recorder. Browser may not support webm capture.");
      setRecordingStatus("error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  };

  const retakeRecording = () => {
    setRecordedBlob(null);
    setRecordingStatus("idle");
    setRecordingDuration(0);
    startCamera();
  };

  const closeRecordingModal = () => {
    stopCameraTracks();
    setIsRecordingModalOpen(false);
  };

  const stopCameraTracks = () => {
    if (recorderStreamRef.current) {
      recorderStreamRef.current.getTracks().forEach(track => track.stop());
      recorderStreamRef.current = null;
    }
    setRecorderStream(null);
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    setMediaRecorder(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveVideo = async () => {
    if (!senderName.trim() || !recordedBlob) return;
    
    setIsSavingVideo(true);
    const id = Date.now();
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const passcodeVal = videoPasscode.trim() || null;

    if (isFirebaseConfigured) {
      try {
        // 1. Try to upload raw video webm binary to Firebase Cloud Storage with a 4-second timeout
        const fileRef = storageRef(storage, `guestbook_videos/${id}.webm`);
        const uploadPromise = uploadBytes(fileRef, recordedBlob);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Storage upload timed out")), 4000)
        );
        const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
        const downloadUrl = await getDownloadURL(snapshot.ref);

        // 2. Add video document metadata to Firestore
        const newVideo = {
          id: id,
          name: senderName.trim(),
          url: downloadUrl,
          storagePath: `guestbook_videos/${id}.webm`,
          passcode: passcodeVal,
          date: dateStr
        };

        await addDoc(collection(db, "videos"), newVideo);
        closeRecordingModal();
      } catch (err) {
        console.error("Error saving video capsule to Firebase Storage, falling back to local storage:", err);
        // Fallback: save to IndexedDB locally so the user doesn't lose their recording!
        const message = {
          id: id,
          name: senderName.trim(),
          blob: recordedBlob,
          passcode: passcodeVal,
          date: dateStr
        };
        try {
          await saveVideoMessage(message);
          setVideoMessages(prev => {
            const merged = prev.filter(v => v.id !== id);
            merged.push(message);
            return merged.sort((a, b) => b.id - a.id);
          });
          closeRecordingModal();
          alert("Note: Because your Firebase Storage plan requires a billing upgrade, this video has been successfully saved locally in your browser instead! 🔒");
        } catch (localErr) {
          console.error("Local save failed:", localErr);
          alert("Failed to save video both to cloud and locally.");
        }
      } finally {
        setIsSavingVideo(false);
      }
    } else {
      const message = {
        id: id,
        name: senderName.trim(),
        blob: recordedBlob,
        passcode: passcodeVal,
        date: dateStr
      };

      try {
        await saveVideoMessage(message);
        const msgs = await loadVideoMessages();
        setVideoMessages(msgs);
        closeRecordingModal();
      } catch (err) {
        console.error("Error saving video capsule to IndexedDB:", err);
      } finally {
        setIsSavingVideo(false);
      }
    }
  };

  // PLAYBACK & SECURITY LOGIC FOR VIDEOS
  const handlePlayVideoMessage = (msg) => {
    if (msg.passcode) {
      setLockPromptTarget({ ...msg, type: 'video' });
      setLockPromptAction("play");
      setPasscodeInput("");
      setLockError("");
      setIsLockPromptOpen(true);
    } else {
      playVideoDirectly(msg);
    }
  };

  const playVideoDirectly = (msg) => {
    const url = msg.url ? msg.url : URL.createObjectURL(msg.blob);
    setActiveVideoUrl(url);
    setActiveVideo(msg);
    setIsVideoPlayerOpen(true);
  };

  const closeVideoPlayer = () => {
    setIsVideoPlayerOpen(false);
    if (activeVideoUrl) {
      if (activeVideoUrl.startsWith("blob:")) {
        URL.revokeObjectURL(activeVideoUrl);
      }
      setActiveVideoUrl("");
    }
    setActiveVideo(null);
  };

  const handleDeleteVideoMessage = (msg, e) => {
    e.stopPropagation(); 
    if (msg.passcode) {
      setLockPromptTarget({ ...msg, type: 'video' });
      setLockPromptAction("delete");
      setPasscodeInput("");
      setLockError("");
      setIsLockPromptOpen(true);
    } else {
      if (window.confirm(`Are you sure you want to delete the video message from ${msg.name}?`)) {
        deleteVideoDirectly(msg.id);
      }
    }
  };

  const deleteVideoDirectly = async (id) => {
    const msg = videoMessages.find(m => m.id === id);
    if (!msg) return;

    if (msg.docId && isFirebaseConfigured) {
      try {
        // 1. Delete document from Firestore
        await deleteDoc(doc(db, "videos", msg.docId));

        // 2. Delete file from Storage
        if (msg.storagePath) {
          const fileRef = storageRef(storage, msg.storagePath);
          await deleteObject(fileRef);
        }
      } catch (err) {
        console.error("Error deleting video from Firebase:", err);
        alert("Failed to delete video message from cloud storage.");
      }
    } else {
      // Local or fallback deletion
      try {
        await deleteVideoMessage(id);
        setVideoMessages(prev => prev.filter(v => v.id !== id));
      } catch (err) {
        console.error("Error deleting video capsule from IndexedDB:", err);
      }
    }
  };

  const handleLockPromptSubmit = (e) => {
    e.preventDefault();
    if (!lockPromptTarget) return;

    if (passcodeInput === lockPromptTarget.passcode) {
      setIsLockPromptOpen(false);
      if (lockPromptAction === 'play') {
        playVideoDirectly(lockPromptTarget);
      } else if (lockPromptAction === 'delete') {
        deleteVideoDirectly(lockPromptTarget.id);
      } else if (lockPromptAction === 'delete_note') {
        deleteNoteDirectly(lockPromptTarget.id);
      } else if (lockPromptAction === 'edit_note') {
        openEditNoteModalDirectly(lockPromptTarget);
      }
    } else {
      setLockError("Incorrect passcode! 🔒");
    }
  };

  return (
    <div className="section-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h2 className="section-title serif-title">Guestbook Messages 📖</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '20px', maxWidth: '600px', marginInline: 'auto' }}>
        Leave a warm message, wish, or inside joke on the sticky note board! Let's cover her dashboard with kindness.
      </p>

      {/* Cloud Sync Status Badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
        {isFirebaseConfigured ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: 'var(--success-color)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.05)'
          }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success-color)', animation: 'recordingBlink 1.5s infinite alternate' }} />
            Cloud Sync Active ☁️ (Synced Across Devices)
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-muted)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8' }} />
            Local Sandbox Mode 🔒 (Saved to this Browser)
          </div>
        )}
      </div>

      {/* STICKY NOTES INTERFACE */}
      <div style={{
        display: 'flex',
        gap: '40px',
        width: '100%',
        maxWidth: '1080px',
        margin: '0 auto',
        flexWrap: 'wrap',
        marginBottom: '20px'
      }}>
        
        {/* Form Container */}
        <div 
          className="glass-card"
          style={{
            flex: '1 1 360px',
            padding: '28px',
            borderRadius: '24px',
            border: '1px solid var(--glass-border)',
            background: 'var(--glass-bg)',
            height: 'fit-content',
            boxShadow: '0 8px 30px var(--glass-shadow)',
            textAlign: 'left'
          }}
        >
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} color="var(--accent-color)" /> Write a Note
          </h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Name Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g., Senior, Friend, Classmate..."
                required
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-solid)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-sans)',
                  outline: 'none'
                }}
              />
            </div>

            {/* Note Content Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Your Message</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your wishes or funny memory here..."
                rows={4}
                required
                maxLength={200}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-solid)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-sans)',
                  outline: 'none',
                  resize: 'none'
                }}
              />
            </div>

            {/* Avatar Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Choose Avatar</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {avatars.map(av => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setAvatar(av)}
                    style={{
                      fontSize: '1.2rem',
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: avatar === av ? 'var(--accent-soft)' : 'transparent',
                      border: avatar === av ? '1.5px solid var(--accent-color)' : '1px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Select Paper Color</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {colors.map(col => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => setNoteColor(col.hex)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: col.hex,
                      border: noteColor === col.hex ? '2px solid var(--accent-color)' : '1px solid rgba(0,0,0,0.1)',
                      cursor: 'pointer'
                    }}
                    title={col.name}
                  />
                ))}
              </div>
            </div>

            {/* Note Passcode (Optional) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Set Optional Passcode</label>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>For editing or deleting later</span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNotePasscode ? "text" : "password"}
                  value={notePasscode}
                  onChange={(e) => setNotePasscode(e.target.value)}
                  placeholder="Leave blank for public, or enter password..."
                  maxLength={12}
                  style={{
                    padding: '10px 14px',
                    paddingRight: '40px',
                    borderRadius: '10px',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--bg-solid)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    width: '100%'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNotePasscode(!showNotePasscode)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showNotePasscode ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '8px' }}>
              Pin Note <Send size={14} />
            </button>
          </form>
        </div>

        {/* Board Display Area */}
        <div 
          style={{
            flex: '2 1 500px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '20px',
            maxHeight: '580px',
            overflowY: 'auto',
            padding: '10px'
          }}
          className="hidden-scrollbar"
        >
          {messages.length === 0 ? (
            <div className="glass-card" style={{ gridColumn: '1 / -1', height: '240px', border: '1px dashed var(--glass-border)', background: 'var(--glass-bg)', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', padding: '24px' }}>
              <MessageSquare size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p style={{ fontSize: '1.05rem', fontWeight: 500 }}>Guestbook is empty.</p>
              <p style={{ fontSize: '0.86rem', marginTop: '4px' }}>Be the first one to pin a sticky note! ✍️🌸</p>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className="sticky-note"
                style={{
                  background: msg.color,
                  color: '#2d263b',
                  padding: '20px',
                  borderRadius: '16px',
                  transform: `rotate(${msg.angle})`,
                  boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  textAlign: 'left',
                  height: 'fit-content',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  border: '1px solid rgba(0,0,0,0.05)',
                  position: 'relative'
                }}
              >
                {/* Control Panel in top right */}
                <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px', opacity: 0.7 }} className="note-controls">
                  <button
                    onClick={(e) => handleEditNoteClick(msg, e)}
                    style={{ background: 'none', border: 'none', color: '#2d263b', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                    title="Edit Note"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteNoteClick(msg, e)}
                    style={{ background: 'none', border: 'none', color: '#2d263b', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                    title="Delete Note"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', paddingRight: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.4rem' }}>{msg.avatar}</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{msg.name}</span>
                      <span style={{ fontSize: '0.68rem', opacity: 0.6 }}>{msg.date}</span>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.88rem', lineHeight: 1.4, flexGrow: 1, wordBreak: 'break-word', fontStyle: 'italic' }}>
                  "{msg.content}"
                </p>

                {/* Reaction Buttons and password indicator */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => handleReact(msg.id, 'heart')}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#ec4899',
                        fontSize: '0.78rem',
                        fontWeight: 500
                      }}
                    >
                      <Heart size={14} fill={msg.hearts > 0 ? '#ec4899' : 'none'} />
                      {msg.hearts}
                    </button>

                    <button
                      onClick={() => handleReact(msg.id, 'star')}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#eab308',
                        fontSize: '0.78rem',
                        fontWeight: 500
                      }}
                    >
                      <Star size={14} fill={msg.stars > 0 ? '#eab308' : 'none'} />
                      {msg.stars}
                    </button>
                  </div>

                  {msg.passcode && (
                    <span style={{ fontSize: '0.68rem', color: '#2d263b', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '2px' }} title="Password Protected">
                      Locked <Lock size={9} />
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Decorative Gradient Divider */}
      <hr style={{ border: 'none', height: '1px', background: 'linear-gradient(90deg, transparent, var(--glass-border), transparent)', margin: '60px 0 40px 0', width: '100%' }} />

      {/* VIDEO TIME CAPSULE COLLECTION SECTION */}
      <div style={{ width: '100%', maxWidth: '1080px', margin: '0 auto', textAlign: 'center' }}>
        <h2 className="serif-title" style={{ fontSize: '2.2rem', marginBottom: '12px', background: 'linear-gradient(135deg, var(--accent-color) 0%, var(--pink-color) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
          Video Memories Capsule 📹
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', maxWidth: '600px', marginInline: 'auto' }}>
          Record a live video message or wish, set a secret password, and drop it in this time capsule box!
        </p>

        {/* Record Trigger Button */}
        <button 
          onClick={openRecordingModal} 
          className="btn-primary" 
          style={{ marginBottom: '40px', gap: '10px', padding: '14px 32px' }}
        >
          <Video size={18} /> Record Video Message
        </button>

        {/* Video Capsules Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '24px',
          width: '100%',
          marginBottom: '40px'
        }}>
          {videoMessages.length === 0 ? (
            <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '50px 30px', border: '1px dashed var(--glass-border)', background: 'var(--glass-bg)', borderRadius: '24px', color: 'var(--text-muted)' }}>
              <Video size={40} style={{ marginInline: 'auto', marginBottom: '16px', opacity: 0.5 }} />
              <p style={{ fontSize: '1.05rem', fontWeight: 500 }}>No video capsules dropped yet.</p>
              <p style={{ fontSize: '0.86rem', marginTop: '6px' }}>Be the first one to record a video greeting! 🎥✨</p>
            </div>
          ) : (
            videoMessages.map(msg => (
              <div 
                key={msg.id}
                onClick={() => handlePlayVideoMessage(msg)}
                className="glass-card video-capsule-card"
                style={{
                  padding: '24px',
                  borderRadius: '20px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--glass-bg)',
                  boxShadow: '0 8px 30px var(--glass-shadow)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '14px',
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Visual Icon representing the video tape/capsule */}
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
                  border: `2.5px solid ${msg.passcode ? 'var(--pink-color)' : 'var(--accent-color)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: msg.passcode ? 'var(--pink-color)' : 'var(--accent-color)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                  position: 'relative',
                  transition: 'transform 0.3s ease'
                }} className="capsule-icon-wrapper">
                  <Play size={24} style={{ marginLeft: '4px' }} />
                  {msg.passcode && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '-6px', 
                      right: '-6px', 
                      width: '22px', 
                      height: '22px', 
                      borderRadius: '50%', 
                      background: 'var(--pink-color)', 
                      color: '#fff', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)' 
                    }}>
                      <Lock size={10} />
                    </div>
                  )}
                </div>

                {/* Sender metadata */}
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                    From {msg.name}
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {msg.date}
                  </span>
                </div>

                {/* Lock Status Text Indicator */}
                {msg.passcode ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--pink-color)', background: 'rgba(236, 72, 153, 0.08)', padding: '4px 10px', borderRadius: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Locked <Lock size={10} />
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--success-color)', background: 'rgba(16, 185, 129, 0.08)', padding: '4px 10px', borderRadius: '12px', fontWeight: 500 }}>
                    Public 🌍
                  </span>
                )}

                {/* Delete trash button */}
                <button
                  onClick={(e) => handleDeleteVideoMessage(msg, e)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    transition: 'color 0.2s',
                    zIndex: 2
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  title="Delete Video Capsule"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 🎥 WEBCAM RECORDING MODAL OVERLAY */}
      {isRecordingModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(10, 8, 20, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000000,
          padding: '20px'
        }}>
          <div 
            className="glass-card" 
            style={{
              width: '100%',
              maxWidth: '460px',
              padding: '30px',
              borderRadius: '28px',
              border: '1.5px solid var(--accent-color)',
              background: 'var(--glass-bg)',
              boxShadow: '0 25px 60px rgba(168, 85, 247, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              position: 'relative'
            }}
          >
            {/* Close modal */}
            <button 
              onClick={closeRecordingModal}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.06)',
                border: 'none',
                color: 'var(--text-primary)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <h3 className="serif-title" style={{ fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Video size={20} color="var(--accent-color)" /> Record Memory Capsule
            </h3>

            {/* Webcam viewport preview container */}
            <div style={{ position: 'relative', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)', background: '#000' }}>
              
              {/* Live stream view */}
              {recordingStatus !== "finished" && (
                <video 
                  ref={livePreviewRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  style={{
                    width: '100%',
                    height: '260px',
                    display: 'block',
                    objectFit: 'cover',
                    background: '#000',
                    transform: 'scaleX(-1)' // Mirror webcam locally
                  }} 
                />
              )}

              {/* Recorded review player */}
              {recordingStatus === "finished" && (
                <video 
                  ref={recordedPreviewRef} 
                  controls 
                  style={{
                    width: '100%',
                    height: '260px',
                    display: 'block',
                    objectFit: 'contain',
                    background: '#000'
                  }} 
                />
              )}

              {/* Recording badge overlay */}
              {recordingStatus === "recording" && (
                <div style={{ 
                  position: 'absolute', 
                  top: '12px', 
                  left: '12px', 
                  background: 'rgba(239, 68, 68, 0.85)', 
                  color: '#fff', 
                  padding: '4px 10px', 
                  borderRadius: '20px', 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  animation: 'recordingBlink 1s infinite alternate'
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} /> REC {formatTime(recordingDuration)}
                </div>
              )}

              {recordingStatus === "ready" && (
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(16, 185, 129, 0.85)', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                  Camera Ready
                </div>
              )}

              {recordingError && (
                <div style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  background: 'rgba(15, 11, 28, 0.95)', 
                  color: '#ef4444', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  padding: '20px', 
                  textAlign: 'center', 
                  fontSize: '0.85rem' 
                }}>
                  <p style={{ fontWeight: 600, marginBottom: '6px' }}>Camera Access Required</p>
                  <p style={{ opacity: 0.8, fontSize: '0.8rem' }}>{recordingError}</p>
                </div>
              )}
            </div>

            {/* Controls panel */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              {recordingStatus === "ready" && (
                <button onClick={startRecording} className="btn-primary" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }}>
                  <Play size={15} /> Start Recording
                </button>
              )}

              {recordingStatus === "recording" && (
                <button onClick={stopRecording} className="btn-primary" style={{ background: 'linear-gradient(135deg, #4b5563 0%, #374151 100%)', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
                  <Square size={14} fill="#fff" /> Stop Recording
                </button>
              )}

              {recordingStatus === "finished" && (
                <button onClick={retakeRecording} className="btn-secondary" style={{ gap: '6px' }}>
                  <RefreshCw size={14} /> Retake Video
                </button>
              )}
            </div>

            {/* Metadata Save Fields */}
            {recordingStatus === "finished" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px', textAlign: 'left' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Your Name</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Enter your name..."
                    required
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--glass-border)',
                      background: 'var(--bg-solid)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Set Optional Passcode</label>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Locks this video message</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPasscode ? "text" : "password"}
                      value={videoPasscode}
                      onChange={(e) => setVideoPasscode(e.target.value)}
                      placeholder="Leave blank for public, or set a password..."
                      maxLength={12}
                      style={{
                        padding: '10px 14px',
                        paddingRight: '40px',
                        borderRadius: '10px',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--bg-solid)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        width: '100%'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasscode(!showPasscode)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      {showPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleSaveVideo} 
                  disabled={!senderName.trim() || isSavingVideo} 
                  className="btn-primary" 
                  style={{ 
                    justifyContent: 'center', 
                    marginTop: '6px', 
                    opacity: (senderName.trim() && !isSavingVideo) ? 1 : 0.5,
                    cursor: (senderName.trim() && !isSavingVideo) ? 'pointer' : 'not-allowed',
                    gap: '8px'
                  }}
                >
                  {isSavingVideo ? (
                    <>
                      <span className="spinner" style={{
                        display: 'inline-block',
                        width: '14px',
                        height: '14px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderRadius: '50%',
                        borderTopColor: '#fff',
                        animation: 'spin 1s ease-in-out infinite'
                      }} />
                      Uploading to Cloud...
                    </>
                  ) : (
                    "Save Video Capsule 📥"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🔒 SECURITY PASSWORD PROMPT OVERLAY */}
      {isLockPromptOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(10, 8, 20, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000005,
          padding: '20px'
        }}>
          <form 
            onSubmit={handleLockPromptSubmit}
            className="glass-card" 
            style={{
              width: '100%',
              maxWidth: '340px',
              padding: '28px',
              borderRadius: '24px',
              border: '1.5px solid var(--pink-color)',
              background: 'var(--glass-bg)',
              boxShadow: '0 20px 45px rgba(236, 72, 153, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            {/* Close modal */}
            <button 
              type="button"
              onClick={() => setIsLockPromptOpen(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'rgba(236,72,153,0.1)',
              color: 'var(--pink-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginInline: 'auto'
            }}>
              <Lock size={20} />
            </div>

            <div>
              <h3 className="serif-title" style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                Password Protected
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                Enter the passcode to {lockPromptAction.includes('delete') ? 'delete' : 'unlock'} {lockPromptTarget?.name}'s {lockPromptTarget?.type === 'note' ? 'sticky note' : 'video message'}.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Enter passcode..."
                autoFocus
                required
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-solid)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  textAlign: 'center'
                }}
              />

              {lockError && (
                <span style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 600, animation: 'shake 0.4s ease' }}>
                  {lockError}
                </span>
              )}

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', background: 'linear-gradient(135deg, var(--pink-color) 0%, var(--accent-color) 100%)' }}>
                Confirm Passcode
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 📺 HIGH FIDELITY VIDEO PLAYBACK PLAYER OVERLAY */}
      {isVideoPlayerOpen && activeVideo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(10, 8, 20, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000010,
          padding: '20px'
        }}>
          <div 
            className="glass-card" 
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '24px',
              borderRadius: '28px',
              border: '1.5px solid var(--glass-border)',
              background: 'var(--glass-bg)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative'
            }}
          >
            {/* Close Video Player */}
            <button 
              onClick={closeVideoPlayer}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.06)',
                border: 'none',
                color: 'var(--text-primary)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <X size={16} />
            </button>

            {/* Video Player wrapper */}
            <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', background: '#000', border: '1px solid var(--glass-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
              <video 
                src={activeVideoUrl} 
                controls 
                autoPlay 
                style={{
                  width: '100%',
                  maxHeight: '380px',
                  display: 'block'
                }} 
              />
            </div>

            {/* Sender and meta details */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>
                  Message from {activeVideo.name}
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Recorded on {activeVideo.date}
                </span>
              </div>
              {activeVideo.passcode && (
                <span style={{ fontSize: '0.72rem', color: 'var(--pink-color)', background: 'rgba(236,72,153,0.08)', padding: '3px 8px', borderRadius: '10px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  Locked <Lock size={8} />
                </span>
              )}
            </div>

            <button
              onClick={closeVideoPlayer}
              style={{
                marginTop: '8px',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                border: '1px solid var(--glass-border)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'var(--pink-color)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
              }}
            >
              <X size={14} /> Close & Go Back
            </button>
          </div>
        </div>
      )}

      {/* 📝 EDIT NOTE MODAL */}
      {isEditNoteModalOpen && editingNote && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(10, 8, 20, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000000,
          padding: '20px'
        }}>
          <div 
            className="glass-card" 
            style={{
              width: '100%',
              maxWidth: '420px',
              padding: '30px',
              borderRadius: '24px',
              border: '1.5px solid var(--accent-color)',
              background: 'var(--glass-bg)',
              boxShadow: '0 25px 60px rgba(168, 85, 247, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              position: 'relative',
              textAlign: 'left'
            }}
          >
            {/* Close button */}
            <button 
              onClick={() => {
                setIsEditNoteModalOpen(false);
                setEditingNote(null);
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.06)',
                border: 'none',
                color: 'var(--text-primary)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <h3 className="serif-title" style={{ fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Pencil size={20} color="var(--accent-color)" /> Edit Sticky Note
            </h3>

            <form onSubmit={handleSaveEditNote} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Edit Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Your Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--bg-solid)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Edit Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Your Message</label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={4}
                  required
                  maxLength={200}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--bg-solid)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              {/* Edit Avatar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Choose Avatar</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {avatars.map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setEditAvatar(av)}
                      style={{
                        fontSize: '1.2rem',
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: editAvatar === av ? 'var(--accent-soft)' : 'transparent',
                        border: editAvatar === av ? '1.5px solid var(--accent-color)' : '1px solid transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Edit Color */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Select Paper Color</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {colors.map(col => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => setEditColor(col.hex)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: col.hex,
                        border: editColor === col.hex ? '2px solid var(--accent-color)' : '1px solid rgba(0,0,0,0.1)',
                        cursor: 'pointer'
                      }}
                      title={col.name}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '8px' }}>
                Save Changes <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* COMPONENT SCOPED CUSTOM STYLES */}
      <style>{`
        .sticky-note:hover {
          transform: rotate(0deg) scale(1.04) !important;
          box-shadow: 0 12px 24px rgba(0,0,0,0.12) !important;
          z-index: 10;
        }
        .note-controls {
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .sticky-note:hover .note-controls {
          opacity: 0.8;
        }
        .note-controls button:hover {
          transform: scale(1.2);
        }
        .video-capsule-card:hover {
          transform: translateY(-8px) scale(1.03);
          border-color: var(--accent-color) !important;
          box-shadow: 0 15px 35px rgba(168, 85, 247, 0.15) !important;
        }
        .video-capsule-card:hover .capsule-icon-wrapper {
          transform: rotate(15deg) scale(1.08);
        }
        @keyframes recordingBlink {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
