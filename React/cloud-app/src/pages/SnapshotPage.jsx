import React from "react";
import { Link } from "react-router-dom";

const SnapshotPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold text-center mb-6">Chọn loại Snapshot</h2>
      <div className="space-y-4 text-center">
        <Link
          to="/service/snapshots/volume"
          className="block text-xl bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Snapshot Volume
        </Link>
        <Link
          to="/service/snapshots/instance"
          className="block text-xl bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Snapshot Instance
        </Link>
      </div>
    </div>
  );
};

export default SnapshotPage;
