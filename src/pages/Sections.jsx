import api from "../api/client";
import ResourcePage from "../components/ResourcePage";

const fmt = (v) =>
  v ? new Date(v).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

export function Theatres() {
  return (
    <ResourcePage
      title="Theatres"
      endpoint="/admin/theatres/"
      toggleField="is_active"
      columns={[
        { key: "name", label: "Name" },
        { key: "city", label: "City" },
        { key: "address", label: "Address" },
        { key: "screens_count", label: "Screens" },
        { key: "is_active", label: "Status" },
      ]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "city", label: "City", required: true },
        { name: "address", label: "Address", type: "textarea" },
        { name: "is_active", label: "Active", type: "checkbox", default: true },
      ]}
    />
  );
}

export function Movies() {
  return (
    <ResourcePage
      title="Movies"
      endpoint="/admin/movies/"
      toggleField="is_active"
      columns={[
        { key: "title", label: "Title" },
        { key: "language", label: "Language" },
        { key: "duration_minutes", label: "Duration (min)" },
        { key: "rating", label: "Rating" },
        { key: "is_active", label: "Status" },
      ]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "duration_minutes", label: "Duration (minutes)", type: "number", required: true },
        { name: "language", label: "Language" },
        { name: "rating", label: "Rating (U, UA, A)" },
        { name: "release_date", label: "Release date", type: "date" },
        { name: "is_active", label: "Active", type: "checkbox", default: true },
      ]}
    />
  );
}

export function Screens() {
  return (
    <ResourcePage
      title="Screens"
      endpoint="/admin/screens/"
      columns={[
        { key: "name", label: "Screen" },
        { key: "theatre_name", label: "Theatre" },
        { key: "seats_count", label: "Seats" },
      ]}
      fields={[
        {
          name: "theatre",
          label: "Theatre",
          type: "select",
          required: true,
          optionsEndpoint: "/admin/theatres/",
          optionLabel: (o) => o.name,
        },
        { name: "name", label: "Screen name", required: true },
      ]}
      extraActions={[
        {
          label: "Generate seats",
          onClick: async (row, refresh) => {
            const rows = Number(window.prompt("Number of rows (1-26)?", "8"));
            if (!rows) return;
            const perRow = Number(window.prompt("Seats per row?", "12"));
            if (!perRow) return;
            const premium = window.prompt("Premium rows (letters separated by commas, or empty)", "") || "";
            try {
              const { data } = await api.post(`/admin/screens/${row.id}/generate-seats/`, {
                rows,
                seats_per_row: perRow,
                premium_rows: premium.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean),
              });
              window.alert(`This screen now has ${data.total_seats} seats.`);
              refresh();
            } catch {
              window.alert("Could not generate seats.");
            }
          },
        },
      ]}
    />
  );
}

export function Seats() {
  return (
    <ResourcePage
      title="Seats"
      endpoint="/admin/seats/"
      filter={{
        param: "screen",
        label: "All screens",
        endpoint: "/admin/screens/",
        optionLabel: (o) => `${o.theatre_name} - ${o.name}`,
      }}
      columns={[
        { key: "screen_name", label: "Screen" },
        { key: "row_label", label: "Row" },
        { key: "number", label: "Number" },
        { key: "seat_type", label: "Type" },
      ]}
      fields={[
        {
          name: "screen",
          label: "Screen",
          type: "select",
          required: true,
          optionsEndpoint: "/admin/screens/",
          optionLabel: (o) => `${o.theatre_name} - ${o.name}`,
        },
        { name: "row_label", label: "Row letter", required: true },
        { name: "number", label: "Seat number", type: "number", required: true },
        {
          name: "seat_type",
          label: "Type",
          type: "select",
          required: true,
          options: [
            { value: "STANDARD", label: "Standard" },
            { value: "PREMIUM", label: "Premium" },
          ],
        },
      ]}
    />
  );
}

export function Shows() {
  return (
    <ResourcePage
      title="Shows"
      endpoint="/admin/shows/"
      toggleField="is_active"
      columns={[
        { key: "movie_title", label: "Movie" },
        { key: "screen_name", label: "Screen" },
        { key: "starts_at", label: "Starts at", render: (r) => fmt(r.starts_at) },
        { key: "base_price", label: "Price (₹)" },
        { key: "is_active", label: "Status" },
      ]}
      fields={[
        {
          name: "movie",
          label: "Movie",
          type: "select",
          required: true,
          optionsEndpoint: "/admin/movies/",
          optionLabel: (o) => o.title,
        },
        {
          name: "screen",
          label: "Screen",
          type: "select",
          required: true,
          optionsEndpoint: "/admin/screens/",
          optionLabel: (o) => `${o.theatre_name} - ${o.name}`,
        },
        { name: "starts_at", label: "Starts at", type: "datetime", required: true },
        { name: "base_price", label: "Base price (₹)", type: "number", step: "0.01", required: true },
        { name: "is_active", label: "Active", type: "checkbox", default: true },
      ]}
    />
  );
}

export function Bookings() {
  return (
    <ResourcePage
      title="Bookings"
      endpoint="/admin/bookings/"
      canCreate={false}
      canEdit={false}
      canDelete={false}
      columns={[
        { key: "id", label: "#" },
        { key: "username", label: "User" },
        { key: "movie_title", label: "Movie" },
        { key: "starts_at", label: "Show time", render: (r) => fmt(r.starts_at) },
        {
          key: "tickets",
          label: "Seats",
          render: (r) => r.tickets.map((t) => t.seat_label).join(", ") || "—",
        },
        { key: "status", label: "Status" },
        { key: "total", label: "Total (₹)" },
        { key: "created_at", label: "Booked on", render: (r) => fmt(r.created_at) },
      ]}
    />
  );
}

export function Users() {
  return (
    <ResourcePage
      title="Users"
      endpoint="/admin/users/"
      canCreate={false}
      canDelete={false}
      toggleField="is_active"
      columns={[
        { key: "username", label: "Username" },
        { key: "email", label: "Email" },
        { key: "is_staff", label: "Staff" },
        { key: "date_joined", label: "Joined", render: (r) => fmt(r.date_joined) },
        { key: "is_active", label: "Status" },
      ]}
      fields={[
        { name: "email", label: "Email", type: "email" },
        { name: "is_staff", label: "Staff (can use the admin panel)", type: "checkbox" },
        { name: "is_active", label: "Active", type: "checkbox", default: true },
      ]}
    />
  );
}