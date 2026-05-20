// app/exercises/page.tsx
"use client";
import { useState } from "react";

export default function ExercisesPage() {
  const [keyword, setKeyword] = useState("");
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    const res = await fetch(
      `/api/exercises?keyword=${encodeURIComponent(keyword)}`,
    );
    const data = await res.json();
    setExercises(data);
    setLoading(false);
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Exercises</h1>
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Search exercises..."
          className="border rounded px-3 py-2 flex-1"
        />
        <button
          onClick={search}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>
      {loading && <p className="text-gray-500">Loading...</p>}
      <div className="space-y-4">
        {exercises.map((exercise: any) => (
          <div key={exercise.id} className="border rounded p-4">
            <h2 className="text-lg font-semibold">{exercise.name}</h2>
            {exercise.category && (
              <p className="text-sm text-gray-500">{exercise.category.name}</p>
            )}
            <div className="mt-2 flex gap-2 flex-wrap">
              {exercise.muscles.map(({ muscle }: any) => (
                <span
                  key={muscle.id}
                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                >
                  {muscle.name}
                </span>
              ))}
            </div>
            <div className="mt-2 flex gap-2 flex-wrap">
              {exercise.equipment.map(({ equipment }: any) => (
                <span
                  key={equipment.id}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                >
                  {equipment.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
