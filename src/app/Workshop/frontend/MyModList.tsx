import React, { useEffect, useState } from "react";
import MyModListCard from "./MyModListCard";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Folder, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const MyModList = () => {
  const [modFolders, setModFolders] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/mymods")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch mod folders");
        return res.json();
      })
      .then((data) => {
        setModFolders(data);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-10 h-10 text-green-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-950/40 border border-red-500/30 text-red-400 rounded-2xl shadow-md">
        <CardContent className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <span>{error}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Folder className="w-6 h-6 text-green-500" />
        <h2 className="text-xl font-semibold text-green-500">
          Local Mod Folders
        </h2>
      </div>

      {modFolders.length === 0 ? (
        <p className="text-gray-400 text-sm italic">
          No mod folders found. Try adding some mods!
        </p>
      ) : (
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
          {modFolders.map((folder, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <MyModListCard folderName={folder} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyModList;
