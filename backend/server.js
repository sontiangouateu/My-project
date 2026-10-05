const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;
const nodemailer = require("nodemailer");

app.use(cors({
  origin: "http://localhost:5173", // L'URL de ton React
  methods: ["GET", "POST", "DELETE"],
  credentials: true
}));
app.use(express.json());

const BOOKINGS_FILE = path.join(__dirname, "bookings.json");

// Load bookings from file or create empty array
let bookings = [];
try {
  if (fs.existsSync(BOOKINGS_FILE)) {
    const data = fs.readFileSync(BOOKINGS_FILE, "utf8");
    bookings = data ? JSON.parse(data) : [];
  }
} catch (err) {
  console.error("Erreur de lecture du fichier JSON, réinitialisation...");
  bookings = [];
}
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).send(); 
});
app.get("/", (req, res) => {
  res.send("Le serveur Caregiver App est en ligne ! Accédez à /bookings pour les données.");
});

const transporter = nodemailer.createTransport({
  service: "gmail",
 auth: {
   user: "sontiangouateu@gmail.com",
   pass: "npjexrinurwhwvpp", // NOT your normal password 
 },
  //logger: true, 
  //debug: true,  
});
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Erreur de configuration Gmail :", error);
  } else {
    console.log("✅ Serveur prêt à envoyer des emails ! 🚀");
  }
});

// GET all bookings
app.get("/bookings", (req, res) => {
  res.json(bookings);
});
app.delete("/bookings/:id", (req, res) => {
  const { id } = req.params;
  bookings = bookings.filter((b) => b.id !== parseInt(id));
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  res.status(204).send();
});
app.get("/availability", (req, res) => {
  const { date } = req.query;
    console.log("Requested date:", date);
  const takenSlots = bookings
    .filter((b) => b.date === date)
    .map((b) => b.time);
     console.log("Taken slots:", takenSlots);
     
  res.json({ takenSlots });
});
app.put("/bookings/:id/cancel", (req, res) => {
  const id = Number(req.params.id);

  const booking = bookings.find(
    (b) => b.id === id
  );

  if (!booking) {
    return res.status(404).json({
      message: "Booking not found"
    });
  }

  booking.status = "cancelled";

  fs.writeFileSync(
    BOOKINGS_FILE,
    JSON.stringify(bookings, null, 2)
  );

  res.json({
    message: "Booking cancelled successfully"
  });
});
// POST new booking
app.post("/bookings", async (req, res) => {
  const newBooking = {
  id: Date.now(),
  name: req.body.name,
  email: req.body.email,
  date: req.body.date,
  time: req.body.time,
  details: req.body.details,
  status: "confirmed",
  createdAt: new Date().toISOString()
};
  const alreadyBooked = bookings.some(
    (b) =>
      b.date === newBooking.date &&
      b.time === newBooking.time
  );
  
  if (alreadyBooked) {
    return res.status(409).json({
      message: "Ce créneau est déjà réservé."
    });
  }

  // 1. Essai de sauvegarde (si ça échoue, on continue quand même pour le mail)
  try {
    bookings.push(newBooking);
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
    console.log("📝 Réservation sauvegardée dans le fichier JSON.");
  } catch (fsError) {
    console.error("❌ Erreur écriture fichier JSON :", fsError);
  }

  // 2. Préparation des enveloppes e-mails
  const clientMail = {
    from: "sontiangouateu@gmail.com",
    to: newBooking.email,
    subject: "Confirmation de votre réservation ✅",
    html: `<h3>Bonjour ${newBooking.name},</h3><p>Votre rendez-vous est confirmé pour le ${newBooking.date} à ${newBooking.time}.</p>`
  };

  const adminMail = {
    from: "sontiangouateu@gmail.com",
    to: "sontiangouateu@gmail.com",
    subject: "🔔 Nouvelle réservation reçue !",
   html: `
<h3>Bonjour ${newBooking.name},</h3>

<p>
Votre réservation est confirmée pour
<b>${newBooking.date}</b> à
<b>${newBooking.time}</b>.
</p>

<p>
Si vous souhaitez annuler votre rendez-vous :
</p>

<a
 href="http://localhost:5173/cancel/${newBooking.id}"
 style="
   background:#dc2626;
   color:white;
   padding:10px 20px;
   text-decoration:none;
   border-radius:8px;
 "
>
Annuler le rendez-vous
</a>
`
  };

  // 3. Envoi des e-mails
  try {
    console.log("🚀 Lancement du protocole d'envoi SMTP...");
    
    const clientInfo = await transporter.sendMail(clientMail);
    console.log("-> Mail client traité par Google. ID:", clientInfo.messageId);

    const adminInfo = await transporter.sendMail(adminMail);
    console.log("-> Mail admin traité par Google. ID:", adminInfo.messageId);

    res.status(201).json(newBooking);
  } catch (emailError) {
    console.error("❌ Erreur critique lors de l'envoi SMTP :", emailError);
    res.status(201).json(newBooking); // On renvoie quand même le succès à React
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});