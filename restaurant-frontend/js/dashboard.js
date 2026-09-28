document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
    displayCurrentDate();
});

async function loadDashboard() {
    try {
        const [tables, orders, bills] = await Promise.all([
            apiRequest("/tables"),
            apiRequest("/orders"),
            apiRequest("/bills")
        ]);

        updateStatistics(tables, orders, bills);
        displayTables(tables);
        displayRecentOrders(orders);

    } catch (error) {
        console.error("Dashboard loading failed:", error);

        document.getElementById("tableStatusContainer").innerHTML = `
            <div class="loading">
                Unable to load table data.
            </div>
        `;

        document.getElementById("recentOrders").innerHTML = `
            <div class="loading">
                Unable to load order data.
            </div>
        `;
    }
}

function updateStatistics(tables, orders, bills) {

    const totalTables = tables.length;

    const availableTables = tables.filter(
        table => table.status &&
            table.status.toUpperCase() === "FREE"
    ).length;

    const openOrders = orders.filter(
        order => order.status &&
            order.status.toUpperCase() === "OPEN"
    ).length;

    const totalRevenue = bills.reduce(
        (sum, bill) => sum + (Number(bill.totalAmount) || 0),
        0
    );

    document.getElementById("totalTables").textContent =
        totalTables;

    document.getElementById("availableTables").textContent =
        availableTables;

    document.getElementById("openOrders").textContent =
        openOrders;

    document.getElementById("totalRevenue").textContent =
        formatCurrency(totalRevenue);
}

function displayTables(tables) {

    const container =
        document.getElementById("tableStatusContainer");

    if (!tables || tables.length === 0) {
        container.innerHTML = `
            <div class="loading">
                No tables found.
            </div>
        `;
        return;
    }

    container.innerHTML = tables.map(table => {

        const status =
            table.status
                ? table.status.toUpperCase()
                : "UNKNOWN";

        let statusClass = "status-reserved";

        if (status === "FREE") {
            statusClass = "status-free";
        } else if (status === "OCCUPIED") {
            statusClass = "status-occupied";
        }

        return `
            <div class="table-status">

                <div class="table-status-number">
                    ${escapeHtml(table.tableNumber)}
                </div>

                <div class="table-status-capacity">
                    Capacity: ${table.capacity}
                </div>

                <span class="status-badge ${statusClass}">
                    ${escapeHtml(status)}
                </span>

            </div>
        `;

    }).join("");
}

function displayRecentOrders(orders) {

    const container =
        document.getElementById("recentOrders");

    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div class="loading">
                No orders found.
            </div>
        `;
        return;
    }

    const recentOrders = [...orders]
        .sort((a, b) => {

            const dateA =
                new Date(a.orderDate || 0).getTime();

            const dateB =
                new Date(b.orderDate || 0).getTime();

            return dateB - dateA;
        })
        .slice(0, 5);

    container.innerHTML = recentOrders.map(order => {

        const tableNumber =
            order.restaurantTable
                ? order.restaurantTable.tableNumber
                : "N/A";

        return `
            <div class="order-row">

                <div class="order-info">

                    <strong>
                        Order #${order.id}
                    </strong>

                    <span>
                        Table ${escapeHtml(tableNumber)}
                        •
                        ${escapeHtml(order.status || "UNKNOWN")}
                    </span>

                </div>

                <div class="order-amount">
                    ${formatCurrency(order.totalAmount)}
                </div>

            </div>
        `;

    }).join("");
}

function formatCurrency(amount) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(Number(amount) || 0);
}

function displayCurrentDate() {

    const dateElement =
        document.getElementById("currentDate");

    if (!dateElement) {
        return;
    }

    const today = new Date();

    dateElement.textContent =
        today.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
}

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}