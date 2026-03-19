
# 🚨 Helper App – Emergency Alerting System

A modern and user-friendly **Emergency Alerting System Web App** designed to help users quickly share their live location and alert trusted contacts during critical situations.

---

## 📌 Features

### 🔐 Authentication

* User login with mobile number and OTP verification
* Static OTP validation (for demo purpose)

### 📍 Live Location Tracking

* Fetches user’s real-time location using browser GPS
* Displays latitude and longitude
* Option to open location directly in Google Maps

### 🗺️ Map Integration

* Interactive map using Leaflet.js
* Shows user’s current position with marker
* Recenter button to track live location

### 🚨 SOS Alert System

* Large SOS button for emergency use
* 3-second countdown before triggering alert
* Sends emergency message to top 3 saved contacts
* Message includes:

  * User name
  * Live Google Maps location link

### 📞 Emergency Contacts

* Add, view, and delete contacts
* Maximum 5 contacts allowed
* First 3 contacts prioritized for SOS alerts

### 👤 Profile Management

* Save personal details:

  * Name
  * Blood Group
  * Phone Number
* Data stored locally using browser storage

### 🌙 Theme Support

* Light Mode & Dark Mode toggle
* Smooth UI transitions

### 🔔 Notifications

* Toast messages for user actions
* Success, error, and info alerts

---

## 🛠️ Technologies Used

* HTML5
* Tailwind CSS
* JavaScript (Vanilla JS)
* Leaflet.js (for maps)
* LocalStorage (for data persistence)
* Font Awesome (icons)

---

## 📂 Project Structure

```
Helper-App/
│
├── index.html      # Main UI structure
├── styles.css      # Custom styling
├── script.js       # App logic
└── README.md       # Project documentation
```

---

## 🚀 How to Run

1. Download or clone the repository
2. Open `index.html` in your browser
3. Allow location access when prompted
4. Login using:

   * Any mobile number
   * OTP: (configured in code)

---

## ⚠️ Note

* This project uses a **static OTP** for demonstration purposes
* SMS sending is simulated using device messaging apps
* Location tracking depends on browser permissions

---

## 🔮 Future Improvements

* Real OTP authentication (Firebase / API)
* Real SMS integration (Twilio / Fast2SMS)
* Background location tracking
* Push notifications
* Cloud database for storing contacts
* Emergency call integration

---

## 👨‍💻 Author

**Gnanakannan K**

---

## 📄 License

This project is for educational purposes and personal use.

---

## ⭐ Acknowledgement

Inspired by the need for quick emergency response systems to improve personal safety using modern web technologies.

---
