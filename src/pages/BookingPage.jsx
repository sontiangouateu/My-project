import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import Calendar from "react-calendar";
import confetti from "canvas-confetti"; 
import "react-calendar/dist/Calendar.css";
import "react-toastify/dist/ReactToastify.css";

function BookingPage() {
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState(""); // Réintégration du champ détails
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

  // Charger les réservations existantes pour bloquer les créneaux déjà pris
 useEffect(() => {
  const formattedDate = date.toLocaleDateString("fr-FR");

  fetch(`http://localhost:5000/availability?date=${formattedDate}`)
    .then((res) => res.json())
    .then((data) => {
      setBookings(
        data.takenSlots.map((time) => ({
          date: formattedDate,
          time,
        }))
      );
    })
    .catch((err) =>
      console.error("Erreur de synchronisation backend:", err)
    );
}, [date]);

  const isTimeTaken = (time) => {
    const formattedDate = date.toLocaleDateString('fr-FR');
    return bookings.some(b => b.date === formattedDate && b.time === time);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTime) return toast.warn("Choisissez une heure");

    setIsLoading(true);
    const formattedDate = date.toLocaleDateString('fr-FR');
    
    // Objet complet correspondant exactement aux attentes de ton serveur
    const booking = { name, date: formattedDate, time: selectedTime, email, details };

    try {
      const res = await fetch("http://localhost:5000/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      });

      if (res.status === 409) {
  toast.error("Ce créneau vient d'être réservé par quelqu'un d'autre.");
  return;
}

if (res.ok) {
        const newBooking = await res.json();
            
        
        // Mise à jour locale pour griser immédiatement le créneau pour les suivants
        setBookings((prev) => [...prev, newBooking]);
        
        // Déclenchement de la pluie de confettis
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });

        setIsConfirmed(true);
        setName("");
        setEmail("");
        setDetails("");
        setSelectedTime("");
        toast.success("Réservation enregistrée ! ✅");
      } else {
        toast.error("Le serveur a refusé la réservation ❌");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur de connexion au serveur ❌");
    } finally {
      setIsLoading(false);
    }
  };

  // --- VUE 1 : PAGE DE REMERCIEMENT ---
  if (isConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            ✓
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Merci {name} !</h2>
          <p className="text-gray-600 mb-6">
            Votre réservation pour un soignant le <span className="font-bold text-blue-600">{date.toLocaleDateString('fr-FR')}</span> à <span className="font-bold text-blue-600">{selectedTime}</span> est confirmée.
          </p>
          <div className="bg-blue-50 p-4 rounded-xl mb-8 text-sm text-blue-800 text-left">
            <strong>Prochaine étape :</strong> Un e-mail de confirmation a été envoyé à {email}.
          </div>
          <button 
            onClick={() => { setIsConfirmed(false); setName(""); setSelectedTime(""); setDetails(""); setEmail(""); }}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            Faire une autre réservation
          </button>
        </div>
      </div>
    );
  }

  // --- VUE 2 : FORMULAIRE CLASSIQUE ---
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <ToastContainer theme="colored" />
      <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600 font-serif">Réserver un Soignant</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Calendar onChange={(d) => { setDate(d); setSelectedTime(""); }} value={date} minDate={new Date()} />

          <div>
            <label className="block text-sm font-bold mb-2 text-center text-gray-700 italic">Disponibilités :</label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => {
                const taken = isTimeTaken(time);
                return (
                  <button
                    key={time}
                    type="button"
                    disabled={taken || isLoading}
                    onClick={() => setSelectedTime(time)}
                    className={`p-2 text-xs rounded-lg border transition-all ${
                      taken ? "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200" :
                      selectedTime === time ? "bg-blue-600 text-white shadow-md scale-105" : 
                      "bg-white hover:border-blue-400 text-gray-700"
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>

          <input type="text" placeholder="Nom complet" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border-b-2 outline-none focus:border-blue-600" required disabled={isLoading} />
          <input type="email" placeholder="Votre Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border-b-2 outline-none focus:border-blue-600" required disabled={isLoading} />
          <textarea placeholder="Détails importants (optionnel)" value={details} onChange={(e) => setDetails(e.target.value)} className="w-full p-2 border rounded outline-none focus:border-blue-600 text-sm" disabled={isLoading} />
          
          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg text-white ${
              isLoading ? "bg-blue-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Envoi en cours..." : "Valider la réservation"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BookingPage;
