export default function ModListAndModal() {
  const [mods, setMods] = useState([]);
  const [selectedMod, setSelectedMod] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const modIds = parseModsFromIni(reader.result);
      const fetchedMods = await Promise.all(
        modIds.map(async (id) => {
          try {
            const res = await fetch(`/api/mods/${id}`);
            if (!res.ok) throw new Error("Not found");
            const data = await res.json();
            return data;
          } catch {
            return {
              workshopId: id,
              title: `Mod ${id}`,
              description: "No info found",
            };
          }
        })
      );
      setMods(fetchedMods);
    };
    reader.readAsText(file);
  };

  return (
    <div style={pageStyle}>
      <h1 style={{ color: "#1DB954" }}>My Mods</h1>
      <input
        type="file"
        accept=".ini"
        onChange={handleFileChange}
        style={{ marginBottom: 20 }}
      />
      <div style={modGridStyle}>
        {mods.map((mod) => (
          <div
            key={mod.workshopId}
            onClick={() => setSelectedMod(mod)}
            style={modCardStyle}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1b1b1b")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#222")}
          >
            <h2 style={{ fontSize: 20 }}>{mod.title || mod.workshopId}</h2>
          </div>
        ))}
      </div>
      {selectedMod && (
        <ModModal
          mod={selectedMod}
          onClose={() => setSelectedMod(null)}
          inMyMods={mods.some((m) => m.workshopId === selectedMod.workshopId)}
        />
      )}
    </div>
  );
}
