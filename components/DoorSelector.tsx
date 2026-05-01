"use client";

interface Props {
  selectedDoor: string;
  setSelectedDoor: (value: string) => void;
}

const doors = [
  { id: "LIBRARY_01", name: "Library" },
  { id: "SERVER_ROOM_01", name: "Server Room" },
  { id: "ADMIN_OFFICE_01", name: "Admin Office" },
];

export default function DoorSelector({
  selectedDoor,
  setSelectedDoor,
}: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">
        Select Access Point
      </h2>

      {doors.map((door) => (
        <button
          key={door.id}
          onClick={() => setSelectedDoor(door.id)}
          className={`w-full p-4 rounded-lg border ${
            selectedDoor === door.id
              ? "bg-blue-600 text-white"
              : "bg-white"
          }`}
        >
          {door.name}
        </button>
      ))}
    </div>
  );
}