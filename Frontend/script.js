const API_BASE = "http://127.0.0.1:8000";

// ================= GLOBAL HELPERS & AUTH =================

function getLoggedInUser() {
    const userStr = localStorage.getItem("taxi_user");
    return userStr ? JSON.parse(userStr) : null;
}

function setLoggedInUser(user) {
    localStorage.setItem("taxi_user", JSON.stringify(user));
}

function logout() {
    localStorage.removeItem("taxi_user");
    showToast("Logged out successfully", "info");
    setTimeout(() => {
        window.location.href = "login.html";
    }, 1000);
}

// Check auth and redirect if needed
function checkAuth(allowedRoles = []) {
    const user = getLoggedInUser();
    if (!user) {
        window.location.href = "login.html";
        return null;
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        showToast("Unauthorized access", "error");
        setTimeout(() => {
            if (user.role === 'customer') window.location.href = "customer_dashboard.html";
            else if (user.role === 'driver') window.location.href = "driver_dashboard.html";
            else if (user.role === 'admin') window.location.href = "admin_dashboard.html";
        }, 1500);
        return null;
    }
    return user;
}

// Show animated Toast notifications
function showToast(message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "notification-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add("show"), 10);

    // Remove toast
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Generate Common Navbar Dynamically
function renderNavbar() {
    const user = getLoggedInUser();
    const nav = document.getElementById("main-nav");
    if (!nav) return;

    let navLinksHTML = `<a href="index.html" class="nav-link" id="nav-home">Home</a>`;

    if (user) {
        if (user.role === "customer") {
            navLinksHTML += `
                <a href="booking.html" class="nav-link" id="nav-booking">Book Ride</a>
                <a href="ride_history.html" class="nav-link" id="nav-history">Ride History</a>
                <a href="customer_dashboard.html" class="nav-link" id="nav-cust-dash">Dashboard</a>
            `;
        } else if (user.role === "driver") {
            navLinksHTML += `
                <a href="driver_dashboard.html" class="nav-link" id="nav-driver-dash">Console</a>
            `;
        } else if (user.role === "admin") {
            navLinksHTML += `
                <a href="admin_dashboard.html" class="nav-link" id="nav-admin-dash">Admin Dashboard</a>
            `;
        }
        navLinksHTML += `<a href="drivers.html" class="nav-link" id="nav-drivers">Drivers Directory</a>`;
    } else {
        navLinksHTML += `
            <a href="login.html" class="nav-link" id="nav-login">Login</a>
            <a href="register.html" class="nav-link" id="nav-register">Register</a>
        `;
    }

    let userHTML = "";
    if (user) {
        const displayName = user.full_name || user.driver_name || "Administrator";
        userHTML = `
            <div class="nav-user">
                <span>Hello, <span class="nav-user-name">${displayName}</span> (${user.role})</span>
                <button onclick="logout()" class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">Logout</button>
            </div>
        `;
    }

    nav.innerHTML = `
        <a href="index.html" class="nav-brand">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
            Go<span>Taxi</span>
        </a>
        <div class="nav-links">
            ${navLinksHTML}
        </div>
        ${userHTML}
    `;

    // Highlight current link
    const page = window.location.pathname.split("/").pop();
    if (page === "index.html" || page === "") document.getElementById("nav-home")?.classList.add("active");
    else if (page === "login.html") document.getElementById("nav-login")?.classList.add("active");
    else if (page === "register.html") document.getElementById("nav-register")?.classList.add("active");
    else if (page === "booking.html") document.getElementById("nav-booking")?.classList.add("active");
    else if (page === "ride_history.html") document.getElementById("nav-history")?.classList.add("active");
    else if (page === "customer_dashboard.html") document.getElementById("nav-cust-dash")?.classList.add("active");
    else if (page === "driver_dashboard.html") document.getElementById("nav-driver-dash")?.classList.add("active");
    else if (page === "admin_dashboard.html") document.getElementById("nav-admin-dash")?.classList.add("active");
    else if (page === "drivers.html") document.getElementById("nav-drivers")?.classList.add("active");
}

// Helper to make fetch requests
async function apiFetch(endpoint, method = "GET", body = null) {
    const url = `${API_BASE}${endpoint}`;
    const options = {
        method,
        headers: {
            "Content-Type": "application/json"
        }
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`API Fetch Error [${method} ${endpoint}]:`, error);
        throw error;
    }
}

// Initializer
document.addEventListener("DOMContentLoaded", () => {
    renderNavbar();
    initializePage();
});

// ================= PAGE-SPECIFIC INITIALIZATION =================

function initializePage() {
    const path = window.location.pathname.split("/").pop();
    
    if (path === "login.html") {
        initLoginPage();
    } else if (path === "register.html") {
        initRegisterPage();
    } else if (path === "booking.html") {
        initBookingPage();
    } else if (path === "payments.html") {
        initPaymentsPage();
    } else if (path === "ride_history.html") {
        initRideHistoryPage();
    } else if (path === "customer_dashboard.html") {
        initCustomerDashboard();
    } else if (path === "driver_dashboard.html") {
        initDriverDashboard();
    } else if (path === "admin_dashboard.html") {
        initAdminDashboard();
    } else if (path === "drivers.html") {
        initDriversPage();
    } else if (path === "index.html" || path === "") {
        initHomePage();
    }
}

// ================= HOME PAGE =================
function initHomePage() {
    const quickBookBtn = document.getElementById("quick-book-btn");
    if (quickBookBtn) {
        quickBookBtn.addEventListener("click", () => {
            const user = getLoggedInUser();
            if (user && user.role === 'customer') {
                window.location.href = "booking.html";
            } else {
                showToast("Please login as a customer to book a ride.", "info");
                setTimeout(() => window.location.href = "login.html", 1500);
            }
        });
    }
}

// ================= LOGIN PAGE =================
function initLoginPage() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;

        try {
            const res = await apiFetch("/api/login/", "POST", { email, password, role });
            showToast("Login successful!", "success");
            setLoggedInUser(res.user);
            
            setTimeout(() => {
                if (res.user.role === 'customer') window.location.href = "customer_dashboard.html";
                else if (res.user.role === 'driver') window.location.href = "driver_dashboard.html";
                else if (res.user.role === 'admin') window.location.href = "admin_dashboard.html";
            }, 1000);
        } catch (err) {
            showToast(err.message || "Invalid credentials", "error");
        }
    });
}

// ================= REGISTER PAGE =================
function initRegisterPage() {
    const registerForm = document.getElementById("registerForm");
    if (!registerForm) return;

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const role = document.getElementById("reg-role").value;
        const name = document.getElementById("reg-name").value;
        const email = document.getElementById("reg-email").value;
        const phone = document.getElementById("reg-phone").value;
        const password = document.getElementById("reg-password").value;
        const address = document.getElementById("reg-address")?.value || "";

        try {
            if (role === "customer") {
                await apiFetch("/customers/add/", "POST", {
                    full_name: name,
                    email,
                    phone,
                    address,
                    password
                });
                showToast("Customer registered successfully!", "success");
            } else {
                // Driver role
                const license = document.getElementById("reg-license").value;
                const experience = parseInt(document.getElementById("reg-experience").value);
                const vehicleModel = document.getElementById("reg-vehicle-model").value;
                const vehicleNo = document.getElementById("reg-vehicle-no").value;
                const vehicleType = document.getElementById("reg-vehicle-type").value;
                const capacity = parseInt(document.getElementById("reg-vehicle-capacity").value);

                // Add driver
                const driverRes = await apiFetch("/drivers/add/", "POST", {
                    driver_name: name,
                    email,
                    phone,
                    license_number: license,
                    experience,
                    availability: "Available"
                });

                // Add associated vehicle
                await apiFetch("/vehicles/add/", "POST", {
                    driver_name: name,
                    vehicle_type: vehicleType,
                    vehicle_number: vehicleNo,
                    seating_capacity: capacity,
                    model: vehicleModel
                });
                showToast("Driver and Vehicle registered successfully!", "success");
            }
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        } catch (err) {
            showToast(err.message || "Registration failed", "error");
        }
    });

    // Toggle extra fields based on role
    const roleSelect = document.getElementById("reg-role");
    const driverFields = document.getElementById("driver-only-fields");
    const custFields = document.getElementById("customer-only-fields");

    roleSelect.addEventListener("change", () => {
        if (roleSelect.value === "driver") {
            driverFields.style.display = "block";
            custFields.style.display = "none";
            document.querySelectorAll("#driver-only-fields input, #driver-only-fields select").forEach(el => el.required = true);
            document.querySelectorAll("#customer-only-fields input").forEach(el => el.required = false);
        } else {
            driverFields.style.display = "none";
            custFields.style.display = "block";
            document.querySelectorAll("#driver-only-fields input, #driver-only-fields select").forEach(el => el.required = false);
            document.querySelectorAll("#customer-only-fields input").forEach(el => el.required = true);
        }
    });
}

// ================= RIDE BOOKING PAGE =================
let bookingFare = 0;
function initBookingPage() {
    const user = checkAuth(['customer']);
    if (!user) return;

    const calcBtn = document.getElementById("calc-fare-btn");
    const bookBtn = document.getElementById("book-ride-btn");
    const estimateBox = document.getElementById("fare-estimate-box");
    const fareValue = document.getElementById("fare-value");

    calcBtn.addEventListener("click", () => {
        const pickup = document.getElementById("pickup").value;
        const drop = document.getElementById("drop").value;
        const vtype = document.getElementById("vehicle_type").value;

        if (!pickup || !drop) {
            showToast("Please enter pickup and drop-off locations", "error");
            return;
        }

        // Simulating a calculation based on vehicle type and string values
        let base = 100;
        if (vtype === "SUV") base = 250;
        else if (vtype === "Luxury") base = 500;
        else if (vtype === "Hatchback") base = 120;
        else if (vtype === "Auto") base = 70;
        else if (vtype === "Bike") base = 40;

        const distanceMultiplier = Math.floor(Math.random() * 20) + 5; // Simulating random distance 5-25km
        bookingFare = base + (distanceMultiplier * 10);
        
        fareValue.innerText = `₹${bookingFare}`;
        estimateBox.style.display = "block";
        bookBtn.style.display = "flex";
        showToast("Fare calculated successfully!", "info");
    });

    bookBtn.addEventListener("click", async () => {
        const pickup = document.getElementById("pickup").value;
        const drop = document.getElementById("drop").value;
        const vtype = document.getElementById("vehicle_type").value;

        try {
            // Find available drivers matching this vehicle type
            // 1. Fetch all vehicles to find the ones matching vehicle_type
            const vehicles = await apiFetch(`/vehicles/?vehicle_type=${vtype}`);
            
            // 2. Fetch all drivers who are available
            const drivers = await apiFetch(`/drivers/?availability=Available`);
            
            // 3. Match driver_name
            let assignedDriver = "Pending Assign";
            if (vehicles.length > 0 && drivers.length > 0) {
                const availableDriverNames = drivers.map(d => d.driver_name);
                const match = vehicles.find(v => availableDriverNames.includes(v.driver_name));
                if (match) {
                    assignedDriver = match.driver_name;
                    // Update matching driver status to "Busy"
                    const drvToUpdate = drivers.find(d => d.driver_name === match.driver_name);
                    if (drvToUpdate) {
                        await apiFetch(`/drivers/update/${drvToUpdate.driver_id}/`, "PUT", {
                            availability: "Busy"
                        });
                    }
                }
            }

            const today = new Date().toISOString().split('T')[0];
            const booking = await apiFetch("/bookings/add/", "POST", {
                customer_name: user.full_name,
                driver_name: assignedDriver,
                pickup_location: pickup,
                drop_location: drop,
                booking_date: today,
                fare: bookingFare,
                ride_status: assignedDriver !== "Pending Assign" ? "Accepted" : "Requested"
            });

            showToast("Ride Booked successfully!", "success");
            
            // Save active booking details for checkout redirect
            localStorage.setItem("active_booking", JSON.stringify(booking.booking || booking));
            
            setTimeout(() => {
                window.location.href = "payments.html";
            }, 1500);
        } catch (err) {
            showToast(err.message || "Booking failed", "error");
        }
    });
}

// ================= PAYMENTS PAGE =================
function initPaymentsPage() {
    const user = checkAuth(['customer']);
    if (!user) return;

    const bookingStr = localStorage.getItem("active_booking");
    if (!bookingStr) {
        showToast("No active booking found to pay.", "warning");
        setTimeout(() => window.location.href = "booking.html", 1500);
        return;
    }

    const booking = JSON.parse(bookingStr);
    
    // Fill elements
    document.getElementById("pay-booking-id").innerText = booking.booking_id;
    document.getElementById("pay-route").innerText = `${booking.pickup_location} ➔ ${booking.drop_location}`;
    document.getElementById("pay-driver").innerText = booking.driver_name;
    document.getElementById("pay-fare").innerText = `₹${booking.fare}`;
    
    const payForm = document.getElementById("payForm");
    payForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const method = document.getElementById("payment_method").value;
        const txnId = "TXN" + Math.floor(Math.random() * 900000000000 + 100000000000);
        const today = new Date().toISOString().split('T')[0];

        try {
            // Create payment record
            await apiFetch("/payments/add/", "POST", {
                booking_id: booking.booking_id,
                customer_name: user.full_name,
                amount: booking.fare,
                payment_method: method,
                payment_status: "Success",
                transaction_id: txnId,
                payment_date: today
            });

            // Update booking status to In Progress
            await apiFetch(`/bookings/update/${booking.booking_id}/`, "PUT", {
                ride_status: "In Progress"
            });

            showToast("Payment Successful! Your ride is in progress.", "success");
            localStorage.removeItem("active_booking");
            
            setTimeout(() => {
                window.location.href = "ride_history.html";
            }, 2000);
        } catch (err) {
            showToast(err.message || "Payment processing failed", "error");
        }
    });
}

// ================= RIDE HISTORY PAGE =================
async function initRideHistoryPage() {
    const user = checkAuth(['customer']);
    if (!user) return;

    const tbody = document.getElementById("history-tbody");
    if (!tbody) return;

    try {
        const bookings = await apiFetch(`/bookings/?customer_name=${user.full_name}`);
        const payments = await apiFetch(`/payments/?customer_name=${user.full_name}`);

        tbody.innerHTML = "";
        
        if (bookings.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No rides booked yet.</td></tr>`;
            return;
        }

        // Sort by booking_id descending
        bookings.sort((a, b) => b.booking_id - a.booking_id);

        bookings.forEach(b => {
            const pay = payments.find(p => p.booking_id === b.booking_id);
            const payStatus = pay ? pay.payment_status : "Unpaid";
            const badgeClass = b.ride_status.toLowerCase().replace(" ", "-");
            const payBadgeClass = payStatus.toLowerCase();

            tbody.innerHTML += `
                <tr>
                    <td>#${b.booking_id}</td>
                    <td>${b.booking_date}</td>
                    <td>${b.driver_name}</td>
                    <td>${b.pickup_location} ➔ ${b.drop_location}</td>
                    <td>₹${b.fare}</td>
                    <td><span class="badge badge-${badgeClass}">${b.ride_status}</span></td>
                    <td><span class="badge badge-${payBadgeClass}">${payStatus}</span></td>
                </tr>
            `;
        });
    } catch (err) {
        showToast("Failed to load ride history", "error");
    }
}

// ================= CUSTOMER DASHBOARD =================
async function initCustomerDashboard() {
    const user = checkAuth(['customer']);
    if (!user) return;

    try {
        const bookings = await apiFetch(`/bookings/?customer_name=${user.full_name}`);
        const payments = await apiFetch(`/payments/?customer_name=${user.full_name}`);

        // Set text name
        document.getElementById("cust-dashboard-title").innerText = `${user.full_name}'s Dashboard`;

        // Calculate Stats
        const total = bookings.length;
        const completed = bookings.filter(b => b.ride_status === 'Completed').length;
        const upcoming = bookings.filter(b => ['Requested', 'Accepted', 'In Progress'].includes(b.ride_status)).length;

        document.getElementById("stat-total-rides").innerText = total;
        document.getElementById("stat-completed-rides").innerText = completed;
        document.getElementById("stat-upcoming-rides").innerText = upcoming;

        // Render Recent Payments
        const payTbody = document.getElementById("recent-payments-tbody");
        payTbody.innerHTML = "";
        
        if (payments.length === 0) {
            payTbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No payments processed.</td></tr>`;
            return;
        }

        payments.slice(-5).reverse().forEach(p => {
            const badgeClass = p.payment_status.toLowerCase();
            payTbody.innerHTML += `
                <tr>
                    <td>#${p.payment_id}</td>
                    <td>#${p.booking_id}</td>
                    <td>₹${p.amount}</td>
                    <td>${p.payment_method}</td>
                    <td><span class="badge badge-${badgeClass}">${p.payment_status}</span></td>
                </tr>
            `;
        });

    } catch (err) {
        showToast("Failed to load dashboard metrics", "error");
    }
}

// ================= DRIVER DASHBOARD =================
async function initDriverDashboard() {
    const user = checkAuth(['driver']);
    if (!user) return;

    // Set side panel availability toggle
    try {
        // Fetch current driver object to get status
        const drivers = await apiFetch(`/drivers/?driver_id=${user.driver_id}`);
        if (drivers.length > 0) {
            const driverObj = drivers[0];
            document.getElementById("driver-avail-status").value = driverObj.availability;
            document.getElementById("driver-rating-val").innerText = "4.8 ★ (12 rides)"; // Static demo rating
            
            // Set name
            document.getElementById("driver-dashboard-title").innerText = `${driverObj.driver_name}'s Control Console`;
        }

        // Toggle handler
        const selectAvail = document.getElementById("driver-avail-status");
        selectAvail.addEventListener("change", async () => {
            try {
                await apiFetch(`/drivers/update/${user.driver_id}/`, "PUT", {
                    availability: selectAvail.value
                });
                showToast("Availability status updated!", "success");
            } catch (err) {
                showToast("Failed to update status", "error");
            }
        });

        // Load trips
        await loadDriverTrips(user.driver_name);
    } catch (err) {
        showToast("Error loading driver settings", "error");
    }
}

async function loadDriverTrips(driverName) {
    try {
        const bookings = await apiFetch(`/bookings/?driver_name=${driverName}`);
        
        // Calculate earnings
        const completedTrips = bookings.filter(b => b.ride_status === 'Completed');
        const earnings = completedTrips.reduce((acc, curr) => acc + curr.fare, 0);

        document.getElementById("stat-driver-completed").innerText = completedTrips.length;
        document.getElementById("stat-driver-earnings").innerText = `₹${earnings}`;

        // Populate table
        const tbody = document.getElementById("assigned-trips-tbody");
        tbody.innerHTML = "";

        if (bookings.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No assigned rides.</td></tr>`;
            return;
        }

        // Sort bookings by status
        bookings.forEach(b => {
            const badgeClass = b.ride_status.toLowerCase().replace(" ", "-");
            
            let actionButtons = "";
            if (b.ride_status === "Requested") {
                actionButtons = `<button class="btn btn-success" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick="updateTripStatus(${b.booking_id}, 'Accepted')">Accept</button>`;
            } else if (b.ride_status === "Accepted") {
                actionButtons = `<button class="btn btn-primary" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick="updateTripStatus(${b.booking_id}, 'In Progress')">Start Trip</button>`;
            } else if (b.ride_status === "In Progress") {
                actionButtons = `<button class="btn btn-success" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick="completeTrip(${b.booking_id}, '${driverName}')">Complete</button>`;
            } else {
                actionButtons = `<span style="color: var(--text-muted);">None</span>`;
            }

            tbody.innerHTML += `
                <tr>
                    <td>#${b.booking_id}</td>
                    <td>${b.customer_name}</td>
                    <td>${b.pickup_location} ➔ ${b.drop_location}</td>
                    <td>₹${b.fare}</td>
                    <td><span class="badge badge-${badgeClass}">${b.ride_status}</span></td>
                    <td>${actionButtons}</td>
                </tr>
            `;
        });

    } catch (err) {
        showToast("Failed to load driver trips", "error");
    }
}

async function updateTripStatus(bookingId, status) {
    try {
        await apiFetch(`/bookings/update/${bookingId}/`, "PUT", { ride_status: status });
        showToast(`Trip status updated to ${status}!`, "success");
        // Reload page data
        const user = getLoggedInUser();
        if (user) await loadDriverTrips(user.driver_name);
    } catch (err) {
        showToast(err.message || "Failed to update trip status", "error");
    }
}

async function completeTrip(bookingId, driverName) {
    try {
        // Update booking status
        await apiFetch(`/bookings/update/${bookingId}/`, "PUT", { ride_status: 'Completed' });
        
        // Mark driver back as Available
        const drivers = await apiFetch(`/drivers/?driver_name=${driverName}`);
        if (drivers.length > 0) {
            await apiFetch(`/drivers/update/${drivers[0].driver_id}/`, "PUT", { availability: "Available" });
            const selectAvail = document.getElementById("driver-avail-status");
            if (selectAvail) selectAvail.value = "Available";
        }
        
        showToast("Trip completed! Great job.", "success");
        const user = getLoggedInUser();
        if (user) await loadDriverTrips(user.driver_name);
    } catch (err) {
        showToast(err.message || "Failed to complete trip", "error");
    }
}

// ================= DRIVERS PAGE =================
async function initDriversPage() {
    const tbody = document.getElementById("drivers-directory-tbody");
    if (!tbody) return;

    try {
        const drivers = await apiFetch("/drivers/");
        const vehicles = await apiFetch("/vehicles/");

        tbody.innerHTML = "";

        if (drivers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No drivers on platform yet.</td></tr>`;
            return;
        }

        drivers.forEach(d => {
            const v = vehicles.find(vh => vh.driver_name === d.driver_name);
            const vModel = v ? `${v.model} (${v.vehicle_type})` : "No vehicle";
            const vNo = v ? v.vehicle_number : "-";
            const badgeClass = d.availability.toLowerCase();
            
            tbody.innerHTML += `
                <tr>
                    <td>#${d.driver_id}</td>
                    <td>${d.driver_name}</td>
                    <td>${d.email}</td>
                    <td>${vModel}</td>
                    <td>${vNo}</td>
                    <td>${d.experience} Years</td>
                    <td><span class="badge badge-${badgeClass}">${d.availability}</span></td>
                </tr>
            `;
        });
    } catch (err) {
        showToast("Failed to load driver directories", "error");
    }
}

// ================= ADMIN DASHBOARD =================
let activeTab = "customers";

function initAdminDashboard() {
    const user = checkAuth(['admin']);
    if (!user) return;

    // Set up tabs click handlers
    const tabs = document.querySelectorAll(".tab-btn");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            
            activeTab = tab.dataset.tab;
            document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));
            document.getElementById(activeTab).classList.add("active");
            
            loadAdminData();
        });
    });

    loadAdminData();

    // Setup Modals and forms
    const addBtn = document.getElementById("admin-add-btn");
    addBtn.addEventListener("click", () => showAdminFormModal());

    const modalForm = document.getElementById("adminModalForm");
    modalForm.addEventListener("submit", handleAdminFormSubmit);
}

async function loadAdminData() {
    const user = getLoggedInUser();
    if (!user || user.role !== "admin") return;

    try {
        if (activeTab === "customers") {
            const data = await apiFetch("/customers/");
            const tbody = document.getElementById("admin-customers-tbody");
            tbody.innerHTML = "";
            data.forEach(c => {
                tbody.innerHTML += `
                    <tr>
                        <td>#${c.customer_id}</td>
                        <td>${c.full_name}</td>
                        <td>${c.email}</td>
                        <td>${c.phone}</td>
                        <td>${c.address}</td>
                        <td>
                            <button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="showAdminFormModal('customers', ${JSON.stringify(c).replace(/"/g, '&quot;')})">Edit</button>
                            <button class="btn btn-danger" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="deleteAdminItem('customers', ${c.customer_id})">Delete</button>
                        </td>
                    </tr>
                `;
            });
        } else if (activeTab === "drivers") {
            const data = await apiFetch("/drivers/");
            const tbody = document.getElementById("admin-drivers-tbody");
            tbody.innerHTML = "";
            data.forEach(d => {
                const badgeClass = d.availability.toLowerCase();
                tbody.innerHTML += `
                    <tr>
                        <td>#${d.driver_id}</td>
                        <td>${d.driver_name}</td>
                        <td>${d.email}</td>
                        <td>${d.phone}</td>
                        <td>${d.license_number}</td>
                        <td>${d.experience} Yrs</td>
                        <td><span class="badge badge-${badgeClass}">${d.availability}</span></td>
                        <td>
                            <button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="showAdminFormModal('drivers', ${JSON.stringify(d).replace(/"/g, '&quot;')})">Edit</button>
                            <button class="btn btn-danger" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="deleteAdminItem('drivers', ${d.driver_id})">Delete</button>
                        </td>
                    </tr>
                `;
            });
        } else if (activeTab === "vehicles") {
            const data = await apiFetch("/vehicles/");
            const tbody = document.getElementById("admin-vehicles-tbody");
            tbody.innerHTML = "";
            data.forEach(v => {
                tbody.innerHTML += `
                    <tr>
                        <td>#${v.vehicle_id}</td>
                        <td>${v.driver_name}</td>
                        <td>${v.model}</td>
                        <td>${v.vehicle_type}</td>
                        <td>${v.vehicle_number}</td>
                        <td>${v.seating_capacity} seats</td>
                        <td>
                            <button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="showAdminFormModal('vehicles', ${JSON.stringify(v).replace(/"/g, '&quot;')})">Edit</button>
                            <button class="btn btn-danger" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="deleteAdminItem('vehicles', ${v.vehicle_id})">Delete</button>
                        </td>
                    </tr>
                `;
            });
        } else if (activeTab === "bookings") {
            const data = await apiFetch("/bookings/");
            const tbody = document.getElementById("admin-bookings-tbody");
            tbody.innerHTML = "";
            data.forEach(b => {
                const badgeClass = b.ride_status.toLowerCase().replace(" ", "-");
                tbody.innerHTML += `
                    <tr>
                        <td>#${b.booking_id}</td>
                        <td>${b.customer_name}</td>
                        <td>${b.driver_name}</td>
                        <td>${b.pickup_location} ➔ ${b.drop_location}</td>
                        <td>${b.booking_date}</td>
                        <td>₹${b.fare}</td>
                        <td><span class="badge badge-${badgeClass}">${b.ride_status}</span></td>
                        <td>
                            <button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="showAdminFormModal('bookings', ${JSON.stringify(b).replace(/"/g, '&quot;')})">Edit</button>
                            <button class="btn btn-danger" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="deleteAdminItem('bookings', ${b.booking_id})">Delete</button>
                        </td>
                    </tr>
                `;
            });
        } else if (activeTab === "payments") {
            const data = await apiFetch("/payments/");
            const tbody = document.getElementById("admin-payments-tbody");
            tbody.innerHTML = "";
            data.forEach(p => {
                const badgeClass = p.payment_status.toLowerCase();
                tbody.innerHTML += `
                    <tr>
                        <td>#${p.payment_id}</td>
                        <td>#${p.booking_id}</td>
                        <td>${p.customer_name}</td>
                        <td>₹${p.amount}</td>
                        <td>${p.payment_method}</td>
                        <td><span class="badge badge-${badgeClass}">${p.payment_status}</span></td>
                        <td>
                            <button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="showAdminFormModal('payments', ${JSON.stringify(p).replace(/"/g, '&quot;')})">Edit</button>
                            <button class="btn btn-danger" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="deleteAdminItem('payments', ${p.payment_id})">Delete</button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        showToast(`Failed to load ${activeTab} data`, "error");
    }
}

// Modal management
function closeModal() {
    document.getElementById("adminModal").style.display = "none";
}

function showAdminFormModal(type = activeTab, item = null) {
    const modal = document.getElementById("adminModal");
    const title = document.getElementById("modal-title");
    const container = document.getElementById("modal-form-fields");
    
    title.innerText = item ? `Edit ${type.slice(0, -1)} (#${item[type.slice(0, -1) + '_id']})` : `Add New ${type.slice(0, -1)}`;
    modal.dataset.type = type;
    modal.dataset.mode = item ? "edit" : "add";
    modal.dataset.id = item ? item[type.slice(0, -1) + '_id'] : "";

    let fieldsHTML = "";

    if (type === "customers") {
        fieldsHTML = `
            ${!item ? `<div class="form-group"><label class="form-label">Customer ID</label><input type="number" id="field-customer_id" class="form-control" placeholder="e.g. 101"></div>` : ""}
            <div class="form-group"><label class="form-label">Full Name</label><input type="text" id="field-full_name" class="form-control" value="${item ? item.full_name : ''}" required></div>
            <div class="form-group"><label class="form-label">Email</label><input type="email" id="field-email" class="form-control" value="${item ? item.email : ''}" required></div>
            <div class="form-group"><label class="form-label">Phone</label><input type="text" id="field-phone" class="form-control" value="${item ? item.phone : ''}" required></div>
            <div class="form-group"><label class="form-label">Address</label><input type="text" id="field-address" class="form-control" value="${item ? item.address : ''}" required></div>
            <div class="form-group"><label class="form-label">Password</label><input type="password" id="field-password" class="form-control" value="${item ? item.password : ''}" required></div>
        `;
    } else if (type === "drivers") {
        fieldsHTML = `
            ${!item ? `<div class="form-group"><label class="form-label">Driver ID</label><input type="number" id="field-driver_id" class="form-control" placeholder="e.g. 201"></div>` : ""}
            <div class="form-group"><label class="form-label">Driver Name</label><input type="text" id="field-driver_name" class="form-control" value="${item ? item.driver_name : ''}" required></div>
            <div class="form-group"><label class="form-label">Email</label><input type="email" id="field-email" class="form-control" value="${item ? item.email : ''}" required></div>
            <div class="form-group"><label class="form-label">Phone</label><input type="text" id="field-phone" class="form-control" value="${item ? item.phone : ''}" required></div>
            <div class="form-group"><label class="form-label">License Number</label><input type="text" id="field-license_number" class="form-control" value="${item ? item.license_number : ''}" required></div>
            <div class="form-group"><label class="form-label">Experience (Years)</label><input type="number" id="field-experience" class="form-control" value="${item ? item.experience : '0'}" required></div>
            <div class="form-group">
                <label class="form-label">Availability</label>
                <select id="field-availability" class="form-control">
                    <option value="Available" ${item && item.availability === 'Available' ? 'selected' : ''}>Available</option>
                    <option value="Busy" ${item && item.availability === 'Busy' ? 'selected' : ''}>Busy</option>
                    <option value="Offline" ${item && item.availability === 'Offline' ? 'selected' : ''}>Offline</option>
                </select>
            </div>
        `;
    } else if (type === "vehicles") {
        fieldsHTML = `
            ${!item ? `<div class="form-group"><label class="form-label">Vehicle ID</label><input type="number" id="field-vehicle_id" class="form-control" placeholder="e.g. 301"></div>` : ""}
            <div class="form-group"><label class="form-label">Driver Name</label><input type="text" id="field-driver_name" class="form-control" value="${item ? item.driver_name : ''}" required></div>
            <div class="form-group"><label class="form-label">Model</label><input type="text" id="field-model" class="form-control" value="${item ? item.model : ''}" required></div>
            <div class="form-group">
                <label class="form-label">Vehicle Type</label>
                <select id="field-vehicle_type" class="form-control">
                    <option value="Sedan" ${item && item.vehicle_type === 'Sedan' ? 'selected' : ''}>Sedan</option>
                    <option value="Hatchback" ${item && item.vehicle_type === 'Hatchback' ? 'selected' : ''}>Hatchback</option>
                    <option value="SUV" ${item && item.vehicle_type === 'SUV' ? 'selected' : ''}>SUV</option>
                    <option value="Auto" ${item && item.vehicle_type === 'Auto' ? 'selected' : ''}>Auto</option>
                    <option value="Bike" ${item && item.vehicle_type === 'Bike' ? 'selected' : ''}>Bike</option>
                    <option value="Luxury" ${item && item.vehicle_type === 'Luxury' ? 'selected' : ''}>Luxury</option>
                </select>
            </div>
            <div class="form-group"><label class="form-label">Vehicle Number</label><input type="text" id="field-vehicle_number" class="form-control" value="${item ? item.vehicle_number : ''}" required></div>
            <div class="form-group"><label class="form-label">Seating Capacity</label><input type="number" id="field-seating_capacity" class="form-control" value="${item ? item.seating_capacity : '4'}" required></div>
        `;
    } else if (type === "bookings") {
        fieldsHTML = `
            ${!item ? `<div class="form-group"><label class="form-label">Booking ID</label><input type="number" id="field-booking_id" class="form-control" placeholder="e.g. 401"></div>` : ""}
            <div class="form-group"><label class="form-label">Customer Name</label><input type="text" id="field-customer_name" class="form-control" value="${item ? item.customer_name : ''}" required></div>
            <div class="form-group"><label class="form-label">Driver Name</label><input type="text" id="field-driver_name" class="form-control" value="${item ? item.driver_name : ''}" required></div>
            <div class="form-group"><label class="form-label">Pickup Location</label><input type="text" id="field-pickup_location" class="form-control" value="${item ? item.pickup_location : ''}" required></div>
            <div class="form-group"><label class="form-label">Drop Location</label><input type="text" id="field-drop_location" class="form-control" value="${item ? item.drop_location : ''}" required></div>
            <div class="form-group"><label class="form-label">Booking Date (YYYY-MM-DD)</label><input type="date" id="field-booking_date" class="form-control" value="${item ? item.booking_date : ''}" required></div>
            <div class="form-group"><label class="form-label">Fare (₹)</label><input type="number" id="field-fare" class="form-control" value="${item ? item.fare : ''}" required></div>
            <div class="form-group">
                <label class="form-label">Ride Status</label>
                <select id="field-ride_status" class="form-control">
                    <option value="Requested" ${item && item.ride_status === 'Requested' ? 'selected' : ''}>Requested</option>
                    <option value="Accepted" ${item && item.ride_status === 'Accepted' ? 'selected' : ''}>Accepted</option>
                    <option value="In Progress" ${item && item.ride_status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Completed" ${item && item.ride_status === 'Completed' ? 'selected' : ''}>Completed</option>
                    <option value="Cancelled" ${item && item.ride_status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </div>
        `;
    } else if (type === "payments") {
        fieldsHTML = `
            ${!item ? `<div class="form-group"><label class="form-label">Payment ID</label><input type="number" id="field-payment_id" class="form-control" placeholder="e.g. 501"></div>` : ""}
            <div class="form-group"><label class="form-label">Booking ID</label><input type="number" id="field-booking_id" class="form-control" value="${item ? item.booking_id : ''}" required></div>
            <div class="form-group"><label class="form-label">Customer Name</label><input type="text" id="field-customer_name" class="form-control" value="${item ? item.customer_name : ''}" required></div>
            <div class="form-group"><label class="form-label">Amount (₹)</label><input type="number" id="field-amount" class="form-control" value="${item ? item.amount : ''}" required></div>
            <div class="form-group">
                <label class="form-label">Payment Method</label>
                <select id="field-payment_method" class="form-control">
                    <option value="UPI" ${item && item.payment_method === 'UPI' ? 'selected' : ''}>UPI</option>
                    <option value="Credit Card" ${item && item.payment_method === 'Credit Card' ? 'selected' : ''}>Credit Card</option>
                    <option value="Debit Card" ${item && item.payment_method === 'Debit Card' ? 'selected' : ''}>Debit Card</option>
                    <option value="Wallet" ${item && item.payment_method === 'Wallet' ? 'selected' : ''}>Wallet</option>
                    <option value="Cash" ${item && item.payment_method === 'Cash' ? 'selected' : ''}>Cash</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Payment Status</label>
                <select id="field-payment_status" class="form-control">
                    <option value="Success" ${item && item.payment_status === 'Success' ? 'selected' : ''}>Success</option>
                    <option value="Pending" ${item && item.payment_status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Failed" ${item && item.payment_status === 'Failed' ? 'selected' : ''}>Failed</option>
                </select>
            </div>
            <div class="form-group"><label class="form-label">Transaction ID</label><input type="text" id="field-transaction_id" class="form-control" value="${item ? item.transaction_id : ''}" required></div>
            <div class="form-group"><label class="form-label">Payment Date (YYYY-MM-DD)</label><input type="date" id="field-payment_date" class="form-control" value="${item ? item.payment_date : ''}" required></div>
        `;
    }

    container.innerHTML = fieldsHTML;
    modal.style.display = "flex";
}

async function handleAdminFormSubmit(e) {
    e.preventDefault();
    const modal = document.getElementById("adminModal");
    const type = modal.dataset.type;
    const mode = modal.dataset.mode;
    const id = modal.dataset.id;

    // Collect field values
    const payload = {};
    const inputs = document.querySelectorAll("#modal-form-fields input, #modal-form-fields select");
    inputs.forEach(input => {
        const key = input.id.replace("field-", "");
        if (input.type === "number") {
            payload[key] = parseFloat(input.value);
        } else {
            payload[key] = input.value;
        }
    });

    try {
        if (mode === "add") {
            await apiFetch(`/${type}/add/`, "POST", payload);
            showToast("Item added successfully!", "success");
        } else {
            await apiFetch(`/${type}/update/${id}/`, "PUT", payload);
            showToast("Item updated successfully!", "success");
        }
        closeModal();
        loadAdminData();
    } catch (err) {
        showToast(err.message || "Operation failed", "error");
    }
}

async function deleteAdminItem(type, id) {
    if (!confirm(`Are you sure you want to delete this ${type.slice(0, -1)} (#${id})?`)) return;
    try {
        await apiFetch(`/${type}/delete/${id}/`, "DELETE");
        showToast("Item deleted successfully", "success");
        loadAdminData();
    } catch (err) {
        showToast(err.message || "Failed to delete item", "error");
    }
}
