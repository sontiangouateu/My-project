import { useEffect } from "react";
import { useParams } from "react-router-dom";

function CancelBooking() {
  const { id } = useParams();

  useEffect(() => {
    fetch(
      `http://localhost:5000/bookings/${id}/cancel`,
      {
        method: "PUT",
      }
    );
  }, [id]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-red-600">
          Appointment Cancelled
        </h1>

        <p className="mt-3">
          Your booking has been cancelled successfully.
        </p>
      </div>
    </div>
  );
}

export default CancelBooking;