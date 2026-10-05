import { useNavigate } from 'react-router-dom';

const caregivers = [
  {
    id: 1,
    name: "Zanela S.",
    experience: "4 years experience",
    specialty: "Child care & elderly care",
    image: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    id: 2,
    name: "Marie N.",
    experience: "6 years experience",
    specialty: "Newborn care",
    image: "https://randomuser.me/api/portraits/women/68.jpg"
  },
  {
    id: 3,
    name: "Linda K.",
    experience: "3 years experience",
    specialty: "Special needs care",
    image: "https://randomuser.me/api/portraits/women/65.jpg"
  }
];
function CaregiverList() {
  const navigate = useNavigate(); // 3. Initialisation du hook de navigation

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Bannière de bienvenue */}
      <div className="bg-blue-600 text-white p-10 rounded-2xl mb-8 text-center shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          Find Trusted Caregivers Near You
        </h1>
        <p className="text-lg">
          Book experienced caregivers for your loved ones easily and securely.
        </p>
      </div>
        {/* Liste des caregivers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {caregivers.map((caregiver) => (
          <div
            key={caregiver.id}
            className="bg-white shadow-md rounded-2xl p-5 hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <img
              src={caregiver.image}
              alt={caregiver.name}
              className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-blue-100"
            />

            <h3 className="text-lg font-semibold text-center text-gray-800">
              {caregiver.name}
            </h3>
            <p className="text-gray-500 text-center italic">
              {caregiver.experience} 
            </p>

            <p className="text-sm text-gray-600 text-center mb-4 font-medium">
              Speciality : {caregiver.specialty}
            </p>
             <button
              onClick={() => navigate('/booking')} // 4. Vérifie que ta route dans App.jsx est bien "/book"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold transition"
            >
              Book Now
            </button>
          </div>
        ))}
         </div>
    </div>
  );
}

export default CaregiverList;

