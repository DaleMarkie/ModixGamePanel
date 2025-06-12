const ModNotesModal = ({ mod, onClose }) => {
  if (!mod) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, width: "100%", height: "100%",
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 10001,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1a1a1a", padding: 24, borderRadius: 10, color: "#eee", width: 400,
        }}
      >
        <h2 style={{ marginBottom: 12 }}>📝 Notes for {mod.title}</h2>
        <textarea
          style={{
            width: "100%", height: 150,
            background: "#111", color: "#fff", border: "1px solid #444",
            padding: 8, borderRadius: 6,
          }}
          defaultValue={mod.notes || ""}
        />
        <button
          onClick={onClose}
          style={{
            marginTop: 12, padding: "10px 20px",
            backgroundColor: "#1DB954", border: "none",
            borderRadius: 6, fontWeight: "bold", color: "#111",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ModNotesModal;
