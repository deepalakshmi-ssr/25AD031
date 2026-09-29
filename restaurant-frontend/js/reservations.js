let editingReservationId = null;

document.addEventListener("DOMContentLoaded", () => {

    loadReservations();
    loadTables();

    const form = document.getElementById("reservationForm");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        await saveReservation();
    });

});


/* =========================================
   LOAD RESERVATIONS
   ========================================= */

async function loadReservations() {

    const container =
        document.getElementById("reservationsContainer");

    try {

        container.innerHTML = `
            <tr>
                <td colspan="9" class="loading">
                    Loading reservations...
                </td>
            </tr>
        `;

        const reservations =
            await apiRequest("/reservations");

        displayReservations(reservations);

        updateReservationStatistics(reservations);

    } catch (error) {

        console.error(
            "Failed to load reservations:",
            error
        );

        container.innerHTML = `
            <tr>
                <td colspan="9" class="loading">
                    Unable to load reservations.
                </td>
            </tr>
        `;
    }
}


/* =========================================
   DISPLAY RESERVATIONS
   ========================================= */

function displayReservations(reservations) {

    const container =
        document.getElementById("reservationsContainer");

    if (!reservations || reservations.length === 0) {

        container.innerHTML = `
            <tr>
                <td colspan="9" class="loading">
                    No reservations found.
                </td>
            </tr>
        `;

        return;
    }


    container.innerHTML =
        reservations.map(reservation => {

            const tableNumber =
                reservation.restaurantTable
                    ? reservation.restaurantTable.tableNumber
                    : "N/A";


            const status =
                reservation.status
                    ? reservation.status.toUpperCase()
                    : "UNKNOWN";


            let statusClass = "status-reserved";


            if (status === "CONFIRMED") {
                statusClass = "status-free";
            }


            if (status === "CANCELLED") {
                statusClass = "status-occupied";
            }


            return `
                <tr>

                    <td>
                        ${reservation.id}
                    </td>


                    <td>
                        <strong>
                            ${escapeHtml(
                reservation.customerName
            )}
                        </strong>
                    </td>


                    <td>
                        ${escapeHtml(
                reservation.phone
            )}
                    </td>


                    <td>
                        ${escapeHtml(tableNumber)}
                    </td>


                    <td>
                        ${escapeHtml(
                reservation.reservationDate
            )}
                    </td>


                    <td>
                        ${escapeHtml(
                reservation.startTime
            )}
                        -
                        ${escapeHtml(
                reservation.endTime
            )}
                    </td>


                    <td>
                        ${reservation.partySize}
                    </td>


                    <td>

                        <span
                            class="status-badge ${statusClass}">
                            ${escapeHtml(status)}
                        </span>

                    </td>


                    <td>

                        <div class="action-buttons">

                            <button
                                class="edit-button"
                                onclick="editReservation(
                                    ${reservation.id}
                                )">

                                Edit

                            </button>


                            <button
                                class="delete-button"
                                onclick="deleteReservation(
                                    ${reservation.id}
                                )">

                                Delete

                            </button>

                        </div>

                    </td>

                </tr>
            `;

        }).join("");
}


/* =========================================
   STATISTICS
   ========================================= */

function updateReservationStatistics(
    reservations
) {

    const totalReservations =
        reservations.length;


    const confirmedReservations =
        reservations.filter(
            reservation =>
                reservation.status &&
                reservation.status.toUpperCase() ===
                "CONFIRMED"
        ).length;


    const totalGuests =
        reservations.reduce(
            (sum, reservation) =>
                sum +
                (Number(reservation.partySize) || 0),
            0
        );


    document.getElementById(
        "totalReservations"
    ).textContent =
        totalReservations;


    document.getElementById(
        "confirmedReservations"
    ).textContent =
        confirmedReservations;


    document.getElementById(
        "totalGuests"
    ).textContent =
        totalGuests;
}


/* =========================================
   LOAD TABLES
   ========================================= */

async function loadTables() {

    const select =
        document.getElementById("reservationTable");

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

                option.value = table.id;

                option.textContent =
                    `${table.tableNumber} - Capacity ${table.capacity}`;

                select.appendChild(option);

            });

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
   OPEN RESERVATION MODAL
   ========================================= */

function openReservationModal() {

    editingReservationId = null;


    document.getElementById(
        "reservationModalTitle"
    ).textContent =
        "New Reservation";


    document.getElementById(
        "reservationForm"
    ).reset();


    document.getElementById(
        "reservationId"
    ).value = "";


    document.getElementById(
        "reservationStatus"
    ).value = "CONFIRMED";


    loadTables();


    document.getElementById(
        "reservationModal"
    ).classList.add("show");
}


/* =========================================
   CLOSE MODAL
   ========================================= */

function closeReservationModal() {

    document.getElementById(
        "reservationModal"
    ).classList.remove("show");
}


/* =========================================
   EDIT RESERVATION
   ========================================= */

async function editReservation(id) {

    try {

        const reservation =
            await apiRequest(
                `/reservations/${id}`
            );


        editingReservationId = id;


        document.getElementById(
            "reservationModalTitle"
        ).textContent =
            "Edit Reservation";


        document.getElementById(
            "reservationId"
        ).value =
            reservation.id;


        document.getElementById(
            "customerName"
        ).value =
            reservation.customerName;


        document.getElementById(
            "phone"
        ).value =
            reservation.phone;


        document.getElementById(
            "reservationDate"
        ).value =
            reservation.reservationDate;


        document.getElementById(
            "startTime"
        ).value =
            reservation.startTime;


        document.getElementById(
            "endTime"
        ).value =
            reservation.endTime;


        document.getElementById(
            "partySize"
        ).value =
            reservation.partySize;


        document.getElementById(
            "reservationStatus"
        ).value =
            reservation.status || "CONFIRMED";


        await loadTables();


        document.getElementById(
            "reservationTable"
        ).value =
            reservation.restaurantTable
                ? reservation.restaurantTable.id
                : "";


        document.getElementById(
            "reservationModal"
        ).classList.add("show");

    } catch (error) {

        alert(error.message);

    }
}


/* =========================================
   SAVE RESERVATION
   ========================================= */

async function saveReservation() {

    const customerName =
        document.getElementById(
            "customerName"
        ).value.trim();


    const phone =
        document.getElementById(
            "phone"
        ).value.trim();


    const tableId =
        document.getElementById(
            "reservationTable"
        ).value;


    const reservationDate =
        document.getElementById(
            "reservationDate"
        ).value;


    const startTime =
        document.getElementById(
            "startTime"
        ).value;


    const endTime =
        document.getElementById(
            "endTime"
        ).value;


    const partySize =
        Number(
            document.getElementById(
                "partySize"
            ).value
        );


    const status =
        document.getElementById(
            "reservationStatus"
        ).value;


    /* BASIC FRONTEND VALIDATION */

    if (!customerName) {

        alert("Customer name is required.");

        return;
    }


    if (!phone) {

        alert("Phone number is required.");

        return;
    }


    if (!tableId) {

        alert("Please select a table.");

        return;
    }


    if (!reservationDate) {

        alert("Reservation date is required.");

        return;
    }


    if (!startTime || !endTime) {

        alert("Start time and end time are required.");

        return;
    }


    if (endTime <= startTime) {

        alert(
            "End time must be after start time."
        );

        return;
    }


    if (!partySize || partySize < 1) {

        alert(
            "Number of guests must be at least 1."
        );

        return;
    }


    const reservationData = {

        customerName: customerName,

        phone: phone,

        reservationDate: reservationDate,

        startTime: startTime,

        endTime: endTime,

        partySize: partySize,

        status: status

    };


    try {

        if (editingReservationId) {

            /*
             * Current backend update API does not
             * change the associated table.
             */

            await apiRequest(
                `/reservations/${editingReservationId}`,
                {
                    method: "PUT",
                    body: JSON.stringify(
                        reservationData
                    )
                }
            );


            alert(
                "Reservation updated successfully."
            );

        } else {

            await apiRequest(
                `/reservations/table/${tableId}`,
                {
                    method: "POST",
                    body: JSON.stringify(
                        reservationData
                    )
                }
            );


            alert(
                "Reservation created successfully."
            );
        }


        closeReservationModal();

        await loadReservations();

        await loadTables();

    } catch (error) {

        alert(error.message);

    }
}


/* =========================================
   DELETE RESERVATION
   ========================================= */

async function deleteReservation(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this reservation?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            `/reservations/${id}`,
            {
                method: "DELETE"
            }
        );


        alert(
            "Reservation deleted successfully."
        );


        await loadReservations();

        await loadTables();

    } catch (error) {

        alert(error.message);

    }
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