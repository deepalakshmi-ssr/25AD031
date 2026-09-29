let selectedOrderId = null;


/* =========================================
   PAGE LOAD
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadBillingData();

});


/* =========================================
   LOAD ALL BILLING DATA
   ========================================= */

async function loadBillingData() {

    await loadOpenOrders();

    await loadBills();

}


/* =========================================
   LOAD OPEN ORDERS
   ========================================= */

async function loadOpenOrders() {

    const container =
        document.getElementById("openOrdersContainer");

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


        const openOrders =
            orders.filter(order =>
                order.status &&
                order.status.toUpperCase() === "OPEN"
            );


        if (openOrders.length === 0) {

            container.innerHTML = `
                <tr>
                    <td colspan="6" class="loading">
                        No open orders available for billing.
                    </td>
                </tr>
            `;

            return;
        }


        container.innerHTML =
            openOrders.map(order => {

                const tableNumber =
                    order.restaurantTable
                        ? order.restaurantTable.tableNumber
                        : "N/A";


                return `
                    <tr>

                        <td>
                            <strong>
                                #${order.id}
                            </strong>
                        </td>


                        <td>
                            ${escapeHtml(tableNumber)}
                        </td>


                        <td>
                            ${formatDateTime(
                    order.orderDate
                )}
                        </td>


                        <td>

                            <span class="status-badge status-occupied">
                                OPEN
                            </span>

                        </td>


                        <td>
                            ${formatCurrency(
                    order.totalAmount
                )}
                        </td>


                        <td>

                            <button
                                class="primary-button"
                                onclick="openBillModal(
                                    ${order.id}
                                )">

                                Generate Bill

                            </button>

                        </td>

                    </tr>
                `;

            }).join("");


    } catch (error) {

        console.error(
            "Failed to load open orders:",
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
   OPEN BILL MODAL
   ========================================= */

async function openBillModal(orderId) {

    selectedOrderId = orderId;


    try {

        const order =
            await apiRequest(
                `/orders/${orderId}`
            );


        const tableNumber =
            order.restaurantTable
                ? order.restaurantTable.tableNumber
                : "N/A";


        document.getElementById(
            "billOrderId"
        ).textContent =
            `#${order.id}`;


        document.getElementById(
            "billTable"
        ).textContent =
            tableNumber;


        document.getElementById(
            "billAmount"
        ).textContent =
            formatCurrency(
                order.totalAmount
            );


        document.getElementById(
            "billModal"
        ).classList.add("show");


    } catch (error) {

        console.error(
            "Failed to load order:",
            error
        );


        alert(
            error.message
        );

        selectedOrderId = null;
    }
}


/* =========================================
   CLOSE BILL MODAL
   ========================================= */

function closeBillModal() {

    document.getElementById(
        "billModal"
    ).classList.remove("show");


    selectedOrderId = null;
}


/* =========================================
   GENERATE BILL
   ========================================= */

async function generateBill() {

    if (!selectedOrderId) {

        alert(
            "No order selected."
        );

        return;
    }


    try {

        const bill =
            await apiRequest(
                `/bills/order/${selectedOrderId}`,
                {
                    method: "POST"
                }
            );


        alert(
            `Bill ${bill.billNumber} generated successfully.`
        );


        closeBillModal();


        await loadBillingData();


    } catch (error) {

        console.error(
            "Failed to generate bill:",
            error
        );


        alert(
            error.message
        );
    }
}


/* =========================================
   LOAD GENERATED BILLS
   ========================================= */

async function loadBills() {

    const container =
        document.getElementById(
            "billsContainer"
        );


    try {

        container.innerHTML = `
            <tr>
                <td colspan="6" class="loading">
                    Loading bills...
                </td>
            </tr>
        `;


        const bills =
            await apiRequest("/bills");


        updateBillingStatistics(
            bills
        );


        if (!bills || bills.length === 0) {

            container.innerHTML = `
                <tr>
                    <td colspan="6" class="loading">
                        No bills generated yet.
                    </td>
                </tr>
            `;

            return;
        }


        container.innerHTML =
            bills.map(bill => {

                const paymentStatus =
                    bill.paymentStatus
                        ? bill.paymentStatus.toUpperCase()
                        : "UNKNOWN";


                let statusClass =
                    "status-reserved";


                if (
                    paymentStatus === "PAID"
                ) {

                    statusClass =
                        "status-free";

                }


                return `
                    <tr>

                        <td>
                            ${bill.id}
                        </td>


                        <td>
                            <strong>
                                ${escapeHtml(
                    bill.billNumber
                )}
                            </strong>
                        </td>


                        <td>
                            #${bill.order
                    ? bill.order.id
                    : "N/A"}
                        </td>


                        <td>
                            ${formatDateTime(
                    bill.billDate
                )}
                        </td>


                        <td>
                            ${formatCurrency(
                    bill.totalAmount
                )}
                        </td>


                        <td>

                            <span
                                class="status-badge ${statusClass}">

                                ${escapeHtml(
                    paymentStatus
                )}

                            </span>

                        </td>

                    </tr>
                `;

            }).join("");


    } catch (error) {

        console.error(
            "Failed to load bills:",
            error
        );


        container.innerHTML = `
            <tr>
                <td colspan="6" class="loading">
                    Unable to load bills.
                </td>
            </tr>
        `;
    }
}


/* =========================================
   BILLING STATISTICS
   ========================================= */

function updateBillingStatistics(bills) {

    const totalBills =
        bills.length;


    const paidBills =
        bills.filter(bill =>
            bill.paymentStatus &&
            bill.paymentStatus.toUpperCase() === "PAID"
        ).length;


    const totalRevenue =
        bills.reduce(
            (sum, bill) =>
                sum +
                (Number(bill.totalAmount) || 0),
            0
        );


    document.getElementById(
        "totalBills"
    ).textContent =
        totalBills;


    document.getElementById(
        "paidBills"
    ).textContent =
        paidBills;


    document.getElementById(
        "billingRevenue"
    ).textContent =
        formatCurrency(
            totalRevenue
        );
}


/* =========================================
   CURRENCY FORMAT
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


/* =========================================
   DATE FORMAT
   ========================================= */

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