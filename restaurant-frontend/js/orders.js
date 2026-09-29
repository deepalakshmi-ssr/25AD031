let currentOrderId = null;

document.addEventListener("DOMContentLoaded", () => {

    loadOrders();

    const orderForm =
        document.getElementById("orderForm");

    orderForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        await createOrder();
    });

});


/* =========================================
   LOAD ORDERS
   ========================================= */

async function loadOrders() {

    const container =
        document.getElementById("ordersContainer");

    try {

        container.innerHTML = `
            <tr>
                <td colspan="6" class="loading">
                    Loading orders...
                </td>
            </tr>
        `;

        const orders =
            await apiRequest("/orders");

        displayOrders(orders);

        updateOrderStatistics(orders);

    } catch (error) {

        console.error(
            "Failed to load orders:",
            error
        );

        container.innerHTML = `
            <tr>
                <td colspan="6" class="loading">
                    Unable to load orders.
                </td>
            </tr>
        `;
    }
}


/* =========================================
   DISPLAY ORDERS
   ========================================= */

function displayOrders(orders) {

    const container =
        document.getElementById("ordersContainer");

    if (!orders || orders.length === 0) {

        container.innerHTML = `
            <tr>
                <td colspan="6" class="loading">
                    No orders found.
                </td>
            </tr>
        `;

        return;
    }


    container.innerHTML =
        orders.map(order => {

            const tableNumber =
                order.restaurantTable
                    ? order.restaurantTable.tableNumber
                    : "N/A";


            const status =
                order.status
                    ? order.status.toUpperCase()
                    : "UNKNOWN";


            let statusClass =
                "status-reserved";


            if (status === "OPEN") {
                statusClass = "status-occupied";
            }


            if (status === "COMPLETED") {
                statusClass = "status-free";
            }


            return `
                <tr>

                    <td>
                        ${order.id}
                    </td>


                    <td>
                        <strong>
                            ${escapeHtml(tableNumber)}
                        </strong>
                    </td>


                    <td>
                        ${formatDateTime(
                order.orderDate
            )}
                    </td>


                    <td>

                        <span
                            class="status-badge ${statusClass}">

                            ${escapeHtml(status)}

                        </span>

                    </td>


                    <td>
                        ${formatCurrency(
                order.totalAmount
            )}
                    </td>


                    <td>

                        <div class="action-buttons">

                            <button
                                class="view-items-button"
                                onclick="openItemsModal(
                                    ${order.id}
                                )">

                                Items

                            </button>

                        </div>

                    </td>

                </tr>
            `;

        }).join("");
}


/* =========================================
   ORDER STATISTICS
   ========================================= */

function updateOrderStatistics(orders) {

    const totalOrders =
        orders.length;


    const openOrders =
        orders.filter(
            order =>
                order.status &&
                order.status.toUpperCase() === "OPEN"
        ).length;


    const orderValue =
        orders.reduce(
            (sum, order) =>
                sum +
                (Number(order.totalAmount) || 0),
            0
        );


    document.getElementById(
        "totalOrders"
    ).textContent =
        totalOrders;


    document.getElementById(
        "openOrders"
    ).textContent =
        openOrders;


    document.getElementById(
        "orderValue"
    ).textContent =
        formatCurrency(orderValue);
}


/* =========================================
   OPEN CREATE ORDER MODAL
   ========================================= */

async function openOrderModal() {

    document.getElementById(
        "orderForm"
    ).reset();


    await loadFreeTables();


    document.getElementById(
        "orderModal"
    ).classList.add("show");
}


/* =========================================
   LOAD FREE TABLES
   ========================================= */

async function loadFreeTables() {

    const select =
        document.getElementById("orderTable");

    try {

        const tables =
            await apiRequest("/tables");


        select.innerHTML = `
            <option value="">
                Select Table
            </option>
        `;


        tables
            .filter(table =>
                table.status &&
                table.status.toUpperCase() === "FREE"
            )
            .forEach(table => {

                const option =
                    document.createElement("option");

                option.value =
                    table.id;

                option.textContent =
                    `${table.tableNumber} - Capacity ${table.capacity}`;

                select.appendChild(option);

            });


        if (
            select.options.length === 1
        ) {

            select.innerHTML = `
                <option value="">
                    No free tables available
                </option>
            `;
        }

    } catch (error) {

        console.error(
            "Failed to load tables:",
            error
        );

        select.innerHTML = `
            <option value="">
                Unable to load tables
            </option>
        `;
    }
}


/* =========================================
   CREATE ORDER
   ========================================= */

async function createOrder() {

    const tableId =
        document.getElementById(
            "orderTable"
        ).value;


    if (!tableId) {

        alert(
            "Please select a table."
        );

        return;
    }


    try {

        const order =
            await apiRequest(
                `/orders/table/${tableId}`,
                {
                    method: "POST"
                }
            );


        alert(
            `Order #${order.id} created successfully.`
        );


        closeOrderModal();


        await loadOrders();

    } catch (error) {

        alert(error.message);

    }
}


/* =========================================
   CLOSE ORDER MODAL
   ========================================= */

function closeOrderModal() {

    document.getElementById(
        "orderModal"
    ).classList.remove("show");
}


/* =========================================
   OPEN ORDER ITEMS MODAL
   ========================================= */

async function openItemsModal(orderId) {

    currentOrderId = orderId;


    document.getElementById(
        "itemsOrderInfo"
    ).textContent =
        `Add food items to Order #${orderId}`;


    document.getElementById(
        "itemName"
    ).value = "";


    document.getElementById(
        "itemQuantity"
    ).value = 1;


    document.getElementById(
        "itemPrice"
    ).value = "";


    document.getElementById(
        "itemsModal"
    ).classList.add("show");


    await loadOrderItems(orderId);
}


/* =========================================
   CLOSE ITEMS MODAL
   ========================================= */

function closeItemsModal() {

    document.getElementById(
        "itemsModal"
    ).classList.remove("show");

    currentOrderId = null;
}


/* =========================================
   LOAD ORDER ITEMS
   ========================================= */

async function loadOrderItems(orderId) {

    const container =
        document.getElementById(
            "orderItemsContainer"
        );


    try {

        container.innerHTML = `
            <div class="loading">
                Loading items...
            </div>
        `;


        const items =
            await apiRequest(
                `/order-items/order/${orderId}`
            );


        if (
            !items ||
            items.length === 0
        ) {

            container.innerHTML = `
                <div class="loading">
                    No items added yet.
                </div>
            `;

            return;
        }


        let total = 0;


        container.innerHTML =
            items.map(item => {

                const itemTotal =
                    Number(item.totalPrice) || 0;

                total += itemTotal;


                return `
                    <div class="order-item-row">

                        <div class="order-item-info">

                            <strong>
                                ${escapeHtml(
                    item.itemName
                )}
                            </strong>

                            <span>
                                ${item.quantity}
                                ×
                                ${formatCurrency(
                    item.unitPrice
                )}
                            </span>

                        </div>


                        <div class="order-item-total">

                            ${formatCurrency(
                    itemTotal
                )}

                        </div>

                    </div>
                `;

            }).join("");


        container.innerHTML += `
            <div class="order-total-box">

                <span>
                    Current Order Total
                </span>

                <span>
                    ${formatCurrency(total)}
                </span>

            </div>
        `;

    } catch (error) {

        console.error(
            "Failed to load order items:",
            error
        );

        container.innerHTML = `
            <div class="loading">
                Unable to load order items.
            </div>
        `;
    }
}


/* =========================================
   ADD ORDER ITEM
   ========================================= */

async function addOrderItem() {

    if (!currentOrderId) {

        alert(
            "No order selected."
        );

        return;
    }


    const itemName =
        document.getElementById(
            "itemName"
        ).value.trim();


    const quantity =
        Number(
            document.getElementById(
                "itemQuantity"
            ).value
        );


    const unitPrice =
        Number(
            document.getElementById(
                "itemPrice"
            ).value
        );


    if (!itemName) {

        alert(
            "Item name is required."
        );

        return;
    }


    if (
        !quantity ||
        quantity <= 0
    ) {

        alert(
            "Quantity must be greater than zero."
        );

        return;
    }


    if (
        isNaN(unitPrice) ||
        unitPrice < 0
    ) {

        alert(
            "Unit price cannot be negative."
        );

        return;
    }


    const itemData = {

        itemName: itemName,

        quantity: quantity,

        unitPrice: unitPrice

    };


    try {

        await apiRequest(
            `/order-items/order/${currentOrderId}`,
            {
                method: "POST",

                body: JSON.stringify(
                    itemData
                )
            }
        );


        alert(
            "Order item added successfully."
        );


        document.getElementById(
            "itemName"
        ).value = "";


        document.getElementById(
            "itemQuantity"
        ).value = 1;


        document.getElementById(
            "itemPrice"
        ).value = "";


        await loadOrderItems(
            currentOrderId
        );


        await loadOrders();

    } catch (error) {

        alert(error.message);

    }
}


/* =========================================
   FORMATTING
   ========================================= */

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }
    ).format(
        Number(amount) || 0
    );
}


function formatDateTime(value) {

    if (!value) {
        return "N/A";
    }


    const date =
        new Date(value);


    if (isNaN(date.getTime())) {
        return value;
    }


    return date.toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}


/* =========================================
   HTML ESCAPE
   ========================================= */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}