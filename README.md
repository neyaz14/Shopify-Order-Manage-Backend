# 🛒 Multi-Shopify Store Order Fulfillment Manager

A full-stack dashboard application for managing and fulfilling orders across multiple Shopify stores, with integrated courier automation using the Steadfast API.

---

## 🔗 Project Repositories

* **Frontend:** https://github.com/neyaz14/Shopify-Order-Manage-Frontend.git
* **Backend:** https://github.com/neyaz14/Shopify-Order-Manage-Backend.git

---

## 🌐 Live Demo

* **Live App:** https://shopify-order-live.web.app

---

## 🚀 Features

### 🏪 Multi-Store Management

* Connect and manage multiple Shopify stores from a single dashboard.

### 📦 Order Management

* Sync orders from Shopify.
* View, filter, and tag orders.
* Confirm and fulfill orders seamlessly.

### 🚚 Courier Integration

* Integrated with **Steadfast Courier API**.
* Create shipment bookings.
* Track delivery status.

### ⚡ GraphQL Powered Backend

* Efficient queries and mutations.
* Optimized data fetching.

### 💾 Database Management

* Store credentials, orders, and logs using MongoDB.
* Structured schemas with Mongoose.

### 🧱 Scalable Architecture

* Clean MVC structure in backend.
* Modular and maintainable codebase.

### 💻 Modern UI

* Responsive and clean UI.
* Built with React + Tailwind CSS.

---

## 🧰 Tech Stack

### Frontend

* React
* Tailwind CSS

### Backend

* Node.js
* Express.js (MVC Architecture)
* GraphQL

### Database

* MongoDB
* Mongoose

### APIs

* Shopify Admin API (GraphQL)
* Steadfast Courier API

---

## 📁 Project Structure

### Frontend

```
src/
 ├── components/
 ├── pages/
 ├── hooks/
 ├── services/
 └── utils/
```

### Backend

```
src/
 ├── controllers/
 ├── models/
 ├── routes/
 ├── services/
 ├── graphql/
 └── config/
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repositories

```bash
git clone https://github.com/neyaz14/Shopify-Order-Manage-Frontend.git
git clone https://github.com/neyaz14/Shopify-Order-Manage-Backend.git
```

---

### 2️⃣ Setup Backend

```bash
cd Shopify-Order-Manage-Backend
npm install
```

Create a `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_uri
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_secret
STEADFAST_API_KEY=your_steadfast_api_key
```

Run backend:

```bash
npm run dev
```

---

### 3️⃣ Setup Frontend

```bash
cd Shopify-Order-Manage-Frontend
npm install
```

Create a `.env` file:

```
VITE_API_URL=http://localhost:5000
```

Run frontend:

```bash
npm run dev
```

---

## 🔄 How It Works

1. Connect Shopify store(s).
2. Sync orders using Shopify GraphQL API.
3. Manage and update order status.
4. Create courier bookings via Steadfast API.
5. Track shipments directly from dashboard.

---

## 📸 Screenshots (Optional)

*Add screenshots here if needed*

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a new branch (`feature/your-feature`)
3. Commit changes
4. Push and create a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Neyaz**

* GitHub: https://github.com/neyaz14

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
