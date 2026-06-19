import React, { useState, useEffect } from 'react';
import { Send, Heart, Star, User, MessageSquare, Lock, Trash2, X, Eye, EyeOff, Pencil } from 'lucide-react';

// Firebase integrations
import { db, isFirebaseConfigured } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function Guestbook() {
  // Sticky Notes States
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [noteColor, setNoteColor] = useState("#fef3c7");
  const [avatar, setAvatar] = useState("🧸");
  const [notePasscode, setNotePasscode] = useState("");
  const [showNotePasscode, setShowNotePasscode] = useState(false);

  // Edit Sticky Note States
  const [isEditNoteModalOpen, setIsEditNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editName, setEditName] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editColor, setEditColor] = useState("");

  // Lock Prompt States (For editing/deleting notes)
  const [isLockPromptOpen, setIsLockPromptOpen] = useState(false);
  const [lockPromptTarget, setLockPromptTarget] = useState(null);
  const [lockPromptAction, setLockPromptAction] = useState(""); // "delete_note", "edit_note"
  const [passcodeInput, setPasscodeInput] = useState("");
  const [lockError, setLockError] = useState("");

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

  const handleLockPromptSubmit = (e) => {
    e.preventDefault();
    if (!lockPromptTarget) return;

    if (passcodeInput === lockPromptTarget.passcode) {
      setIsLockPromptOpen(false);
      if (lockPromptAction === 'delete_note') {
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
                Enter the passcode to {lockPromptAction.includes('delete') ? 'delete' : 'edit'} {lockPromptTarget?.name}'s sticky note.
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
