'use client';
import { useEffect, useState } from 'react';
import { db } from '../utils/firebase';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { getCurrentPosition, isWithinRadius } from '../utils/location';

export default function CheckInButtons() {
  const [staffId, setStaffId] = useState(null);
  const [inputStaffId, setInputStaffId] = useState('');
  const [message, setMessage] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const storedId = localStorage.getItem('staff_id');
    if (storedId) setStaffId(storedId);
  }, []);

  const handleSaveStaffId = () => {
    if (inputStaffId.trim() === '') {
      setMessage({ text: 'Please enter a valid Staff ID.', success: false });
      return;
    }
    localStorage.setItem('staff_id', inputStaffId.trim());
    setStaffId(inputStaffId.trim());
    setInputStaffId('');
    setMessage(null);
  };

  const handleClick = async (type) => {
    if (!staffId) {
      setMessage({ text: 'Staff ID not set.', success: false });
      return;
    }

    try {
      const coords = await getCurrentPosition();
      const shopRef = doc(db, 'shop', 'location');
      const shopSnap = await getDoc(shopRef);

      if (!shopSnap.exists()) {
        setMessage({ text: 'Shop location not set.', success: false });
        return;
      }

      const shop = shopSnap.data();
      const inside = isWithinRadius(
        coords.latitude,
        coords.longitude,
        shop.lat,
        shop.lng
      );

      if (!inside) {
        setMessage({ text: 'You are not at the shop location.', success: false });
        return;
      }

      await addDoc(collection(db, 'checkins'), {
        staffId,
        type,
        timestamp: new Date().toISOString(),
        lat: coords.latitude,
        lng: coords.longitude
      });

      setMessage({
        text: `${type === 'open' ? '✅ Shop opened' : '🕓 Shop closed'} successfully.`,
        success: true
      });
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Error: ' + err.message, success: false });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('staff_id');
    setStaffId(null);
    setMessage({ text: 'Logged out successfully.', success: true });
    setShowLogoutConfirm(false);
  };

  return (
    <div className="bg-gradient-to-r from-indigo-100 to-blue-100 p-6 rounded-xl shadow-md max-w-md mx-auto mt-6">
      <h2 className="text-lg font-semibold mb-4 text-center">Check-In/Check-Out</h2>

      {message && (
        <div
          className={`mb-4 px-4 py-2 rounded text-sm text-center ${
            message.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {!staffId ? (
        <div className="mb-4">
          <input
            type="text"
            value={inputStaffId}
            onChange={(e) => setInputStaffId(e.target.value)}
            placeholder="Enter your Staff ID"
            className="w-full px-4 py-2 border rounded mb-2"
          />
          <button
            onClick={handleSaveStaffId}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Staff ID
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 justify-center mb-4">
            <button
              onClick={() => handleClick('open')}
              className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Open Shop
            </button>
            <button
              onClick={() => handleClick('close')}
              className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Close Shop
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="text-sm text-blue-600 underline hover:text-blue-800"
            >
              Log Out ({staffId})
            </button>
          </div>
        </>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
            <h4 className="text-lg font-semibold mb-4 text-center">Confirm Logout</h4>
            <p className="mb-4 text-center text-gray-600">Are you sure you want to log out?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
