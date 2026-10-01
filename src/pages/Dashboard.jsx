import { useQuery } from "@tanstack/react-query";
import api from "../api/client";

const cards = [
  ["theatres", "Total Theatres"],
  ["movies", "Total Movies"],
  ["shows", "Total Shows"],
  ["bookings", "Total Bookings"],
  ["users", "Registered Users"],
  ["todays_bookings", "Today's Bookings"],
  ["revenue", "Revenue"],
];

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/admin/dashboard/").then((r) => r.data),
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="error">Could not load the dashboard.</p>;

  return (
    <>
      <h2>Dashboard</h2>
      <div className="cards">
        {cards.map(([key, label]) => (
          <div className="card" key={key}>
            <div className="muted">{label}</div>
            <div className="value">
              {key === "revenue" ? `₹${Number(data[key]).toLocaleString("en-IN")}` : data[key]}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}