import React, { useEffect, useState } from "react";
import MyModListCard from "./MyModListCard";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Folder, AlertCircle, PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MyModList: React.FC = () => {
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

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-12 h-12 text-green-500" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="p-6 bg-red-950/50 border border-red-500/40 text-red-400 rounded-2xl shadow-lg backdrop-blur-sm">
        <CardContent className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <span>{error}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Folder className="w-6 h-6 text-green-500" />
        <h2 className="text-2xl font-bold text-green-500">Local Mod Folders</h2>
      </div>

      {/* Empty state */}
      {modFolders.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
          <PlusCircle className="w-10 h-10 mb-2 animate-bounce text-gray-400" />
          <p className="text-sm italic">
            No mod folders found. Try adding some mods!
          </p>
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
          <AnimatePresence>
            {modFolders.map((folder, idx) => (
              <motion.div
                key={folder}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.03 }}
              >
                <MyModListCard folderName={folder} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default MyModList;
