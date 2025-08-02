'use client';
import { useEffect, useState } from "react";
import { db } from '../utils/firebase';
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { getCurrentPosition } from "../utils/location";

export default function AdminPanel() {
  const [checkIns, setCheckIns] = useState([]);
  const [message, setMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

  const PASSWORD = "5a715h";
  const PASSWORD_KEY = "admin_password";

  useEffect(() => {
    const stored = localStorage.getItem(PASSWORD_KEY);
    if (stored === PASSWORD) {
      setAuthenticated(true);
      fetchCheckIns();
    }
  }, []);

  const fetchCheckIns = async () => {
    const querySnapshot = await getDocs(collection(db, "checkins"));
    const data = [];
    querySnapshot.forEach((docSnap) => {
      data.push({ id: docSnap.id, ...docSnap.data() });
    });
    const sortedData = data.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setCheckIns(sortedData);
  };

  const latestDate =
    checkIns.length > 0
      ? new Date(checkIns[0].timestamp).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : null;

  const confirmPasswordAndExecute = async () => {
    if (password !== PASSWORD) {
      setMessage({ text: "Incorrect password.", success: false });
      setShowModal(true);
      return;
    }

    localStorage.setItem(PASSWORD_KEY, PASSWORD);
    setAuthenticated(true);
    setShowModal(false);
    setPassword("");
    fetchCheckIns();

    if (!pendingAction) return;

    try {
      if (pendingAction === "set") {
        const coords = await getCurrentPosition();
        await setDoc(doc(db, "shop", "location"), {
          lat: coords.latitude,
          lng: coords.longitude,
        });
        setMessage({ text: "Shop location set.", success: true });
      }

      if (pendingAction === "delete") {
        await deleteDoc(doc(db, "shop", "location"));
        setMessage({ text: "Shop location deleted.", success: true });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: `Error performing action.`, success: false });
    }

    setPendingAction(null);
  };

  const handleButtonClick = (action) => {
    const stored = localStorage.getItem(PASSWORD_KEY);

    if (stored === PASSWORD) {
      setPendingAction(action);
      confirmPasswordAndExecute();
    } else {
      setPendingAction(action);
      setShowModal(true);
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem(PASSWORD_KEY);
      setAuthenticated(false);
      setMessage({ text: "Logged out successfully.", success: true });
      setTimeout(() => {
        setMessage(null);
      }, 1000);
    }
  };

  return (
    <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-100 rounded-xl shadow-md mt-8 max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-center">Admin Panel</h3>

      {!authenticated && (
        <div className="w-full flex justify-center">
          <button
            onClick={() => setShowModal(!showModal)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full sm:w-auto"
          >
            LogIn
          </button>
        </div>
      )}

      {message && (
        <div
          className={`mb-4 px-4 py-2 rounded text-sm text-center ${
            message.success
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Password Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
            <h4 className="text-lg font-semibold mb-4">Enter Admin Password</h4>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-2 border rounded mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setPendingAction(null);
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmPasswordAndExecute}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {authenticated && (
        <>
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mb-6 justify-center">
            <button
              onClick={() => handleButtonClick("set")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
            >
              Set Shop Location
            </button>
            <button
              onClick={() => handleButtonClick("delete")}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full sm:w-auto"
            >
              Delete Shop Location
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full sm:w-auto"
            >
              Logout
            </button>
          </div>

          <div className="mt-6">
            <h4 className="text-lg font-medium mb-2 text-center">
              Shop Open/Close Logs
            </h4>
            {latestDate && (
              <p className="text-center text-gray-600 mb-4">
                Latest Entry Date: <strong>{latestDate}</strong>
              </p>
            )}
            <ul className="space-y-2">
              {checkIns.map((entry) => (
                <li
                  key={entry.id}
                  className="bg-white p-3 rounded shadow-sm text-sm border border-gray-200"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div>
                      <span className="font-semibold text-indigo-600">
                        {entry.type.toUpperCase()}
                      </span>{" "}
                      -<span className="ml-1">{entry.staffId}</span> -
                      <span className="ml-1">
                        {new Date(entry.timestamp).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}{" "}
                        {new Date(entry.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="text-right mt-2 md:mt-0 text-emerald-600 font-medium">
                      @{`(${entry.lat.toFixed(4)}, ${entry.lng.toFixed(4)})`}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
