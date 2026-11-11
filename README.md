# 🌍 WanderLust – Discover Your Next Stay

**WanderLust** is a full-stack accommodation listing web application inspired by Airbnb. It allows users to explore travel destinations, discover unique stays, create their own property listings, and share their experiences through reviews.

🔗 **Live Demo:** https://wanderlust-4k1l.onrender.com/listings

## ✨ Features

- **User Authentication:** Secure user registration and login using Passport.js.
- **Explore Listings:** Browse accommodation listings from different locations.
- **Create Listings:** Authenticated users can create their own property listings.
- **Edit & Delete Listings:** Listing owners can manage their properties.
- **Reviews & Ratings:** Users can share their experiences and rate properties.
- **Authorization:** Restricts listing management to authorized owners.
- **Flash Messages:** Displays success and error notifications.
- **Session Management:** Maintains user sessions across requests.
- **Responsive UI:** User-friendly interface for browsing listings.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Structure |
| CSS3 | Styling |
| Bootstrap | Responsive UI |
| JavaScript | Client-side functionality |
| Node.js | Runtime environment |
| Express.js | Backend framework |
| MongoDB | Database |
| Mongoose | Database modeling |
| EJS | Server-side templating |
| Passport.js | Authentication |
| Express-session | Session management |
| Connect-flash | Flash notifications |
| Render | Deployment |

## 📸 Screenshots

_Add screenshots of your application here._

## ⚙️ Installation & Setup

Follow these steps to run WanderLust locally.

**1. Clone the repository**

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

**2. Navigate to the project directory**

```bash
cd WanderLust
```

**3. Install dependencies**

```bash
npm install
```

**4. Configure environment variables**

Create a `.env` file in the root directory:

```env
ATLASDB_URL=your_mongodb_connection_string
SECRET=your_session_secret
```

**5. Start the development server**

```bash
node app.js
```

Open your browser and visit:

```text
http://localhost:8080/listings
```

## 📁 Project Structure

```text
WanderLust/
│
├── controllers/
├── init/
├── models/
├── public/
│   ├── css/
│   └── js/
│
├── routes/
├── views/
│   ├── includes/
│   ├── layouts/
│   └── listings/
│
├── utils/
├── app.js
├── middleware.js
├── schema.js
├── package.json
└── .gitignore
```

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| ATLASDB_URL | MongoDB Atlas connection URL |
| SECRET | Secret key for session management |

Never commit your `.env` file or expose your database credentials.

## 🚀 Deployment

WanderLust is deployed using **Render**.

Check out the live application:

👉 https://wanderlust-4k1l.onrender.com/listings

## 🎯 Project Objective

The objective of WanderLust is to build a practical full-stack web application while learning backend development, database management, authentication, authorization, CRUD operations, and deployment.

## 👨‍💻 Author

**Mayur Patil**

Computer Science Engineering Student

GitHub:https://github.com/Mayur-patil-5

---

⭐ If you like this project, consider giving it a star!