import React from "react";

const RBACPage = () => {
  return (
    <div className="min-h-screen bg-[#36393f] text-white p-6">
      <h1 className="text-2xl font-bold mb-4">
        Role-Based Access Control (RBAC)
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Roles Section */}
        <div className="bg-[#2f3136] p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Roles</h2>
          {/* TODO: List and manage roles */}
        </div>

        {/* Permissions Section */}
        <div className="bg-[#2f3136] p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Permissions</h2>
          {/* TODO: Define and assign permissions */}
        </div>

        {/* Users Section */}
        <div className="bg-[#2f3136] p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Users</h2>
          {/* TODO: Assign roles to users */}
        </div>
      </div>
    </div>
  );
};
