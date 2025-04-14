import { useState } from "react";

export default function DashboardPage() {
    const [overview, setOverview] = useState([
        { name: "Total Instances", value: 10 },
        { name: "Total Networks", value: 5 },
        { name: "Total Volumes", value: 15 },
        { name: "Total Users", value: 20 },
    ]);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Dashboard</h2>

                {/* Display overview statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {overview.map((item, index) => (
                        <div
                            key={index}
                            className="p-6 bg-blue-600 text-white rounded-lg shadow-lg flex flex-col items-center"
                        >
                            <h3 className="text-xl font-semibold">{item.name}</h3>
                            <p className="text-2xl font-bold">{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
