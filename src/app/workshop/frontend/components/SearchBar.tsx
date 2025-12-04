import React, { useRef } from "react";
import { Mod } from "./ModCard";

interface SearchBarProps {
  input: string;
  setInput: (v: string) => void;
  fetchMods: (query?: string) => void;
  loading: boolean;
  mods: Mod[];
  modlists: Record<string, string[]>;
  addAllToModlist: (listName: string, mods?: Mod[]) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  input,
  setInput,
  fetchMods,
  loading,
  mods,
  modlists,
  addAllToModlist,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isCollectionId = /^\d{6,}$/.test(input.trim());

  return (
    <div className="search-container">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && fetchMods()}
        placeholder="Search mods or enter Collection ID..."
        className="search-input"
      />
      <button
        onClick={() => fetchMods()}
        disabled={loading}
        className="search-button"
      >
        {loading ? "Loading..." : "Search"}
      </button>

      {isCollectionId &&
        mods.length > 0 &&
        (Object.keys(modlists).length > 0 ? (
          <select
            onChange={(e) => {
              addAllToModlist(e.target.value, mods);
              e.target.value = "";
            }}
            defaultValue=""
            className="ml-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-2 py-1 cursor-pointer"
          >
            <option value="">Add Entire Collection to List</option>
            {Object.keys(modlists).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        ) : (
          <button
            onClick={() => alert("Create modlist first")}
            className="ml-2 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-lg"
          >
            ➕ Create list & add collection
          </button>
        ))}
    </div>
  );
};
