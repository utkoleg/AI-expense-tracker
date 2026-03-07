import { colors, radii, safe } from "../theme";

export default function ImageStaging({ images, onAddMore, onRemove, onAnalyze, onCancel }) {
  return (
    <div style={{
      position: "fixed",
      bottom: `calc(58px + ${safe.bot})`,
      left: 0,
      right: 0,
      zIndex: 150,
      background: "rgba(19,15,42,0.97)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderTop: `1px solid ${colors.border}`,
      borderRadius: `${radii.xl}px ${radii.xl}px 0 0`,
      padding: "16px 16px 20px",
      boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
      animation: "slideUp 0.25s cubic-bezier(0.34,1.2,0.64,1)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>
          {images.length} {images.length === 1 ? "photo" : "photos"} ready
        </div>
        <button
          onClick={onCancel}
          style={{
            background: "none", border: "none",
            color: colors.muted, fontSize: 14, cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Cancel
        </button>
      </div>

      {/* Thumbnails */}
      <div style={{ display: "flex", gap: 10, overflowX: "auto", marginBottom: 16, paddingBottom: 2 }}>
        {images.map((img, i) => (
          <div key={i} style={{ position: "relative", flexShrink: 0 }}>
            <img
              src={`data:${img.mediaType};base64,${img.b64}`}
              alt={`Page ${i + 1}`}
              style={{
                width: 80, height: 80,
                objectFit: "cover",
                borderRadius: radii.md,
                border: `1.5px solid ${colors.border}`,
                display: "block",
              }}
            />
            <button
              onClick={() => onRemove(i)}
              style={{
                position: "absolute", top: -7, right: -7,
                width: 22, height: 22,
                background: colors.danger,
                border: "2px solid rgba(19,15,42,0.9)",
                borderRadius: "50%",
                color: "#fff", fontSize: 13, lineHeight: 1,
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700,
              }}
            >
              ×
            </button>
            <div style={{
              position: "absolute", bottom: 4, left: 0, right: 0,
              textAlign: "center",
              fontSize: 11, fontWeight: 700, color: "#fff",
              textShadow: "0 1px 4px rgba(0,0,0,0.9)",
            }}>
              {i + 1}
            </div>
          </div>
        ))}

        {/* Add more */}
        <button
          onClick={onAddMore}
          style={{
            width: 80, height: 80, flexShrink: 0,
            background: "none",
            border: `1.5px dashed ${colors.border}`,
            borderRadius: radii.md,
            color: colors.muted,
            fontSize: 30, lineHeight: 1,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          +
        </button>
      </div>

      {/* Analyze button */}
      <button
        onClick={onAnalyze}
        style={{
          width: "100%",
          background: colors.accent,
          border: "none",
          borderRadius: radii.md,
          color: "#fff",
          fontSize: 16, fontWeight: 700,
          cursor: "pointer",
          padding: "15px",
          boxShadow: "0 4px 20px rgba(167,139,250,0.45)",
          fontFamily: "inherit",
        }}
      >
        Analyze {images.length} {images.length === 1 ? "photo" : "photos"}
      </button>
    </div>
  );
}
