let editingTableId = null;

document.addEventListener("DOMContentLoaded", () => {
    loadTables();

    const tableForm = document.getElementById("tableForm");

    tableForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        await saveTable();
    });
});


async function loadTables() {

    const container = document.getElementById("tablesContainer");

    try {

        container.innerHTML = `
            <tr>
                <td colspan="5" class="loading">
                    Loading tables...
                </td>
            </tr>
        `;

        const tables = await apiRequest("/tables");

        displayTables(tables);
        updateTableStatistics(tables);

    } catch (error) {

        console.error("Failed to load tables:", error);

        container.innerHTML = `
            <tr>
                <td colspan="5" class="loading">
                    Unable to load tables.
                </td>
            </tr>
        `;
    }
}


function displayTables(tables) {

    const container =
        document.getElementById("tablesContainer");

    if (!tables || tables.length === 0) {

        container.innerHTML = `
            <tr>
                <td colspan="5" class="loading">
                    No tables found.
                </td>
            </tr>
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
        }

        if (status === "OCCUPIED") {
            statusClass = "status-occupied";
        }


        return `
            <tr>

                <td>
                    ${table.id}
                </td>

                <td>
                    <strong>
                        ${escapeHtml(table.tableNumber)}
                    </strong>
                </td>

                <td>
                    ${table.capacity} seats
                </td>

                <td>

                    <span class="status-badge ${statusClass}">
                        ${escapeHtml(status)}
                    </span>

                </td>

                <td>

                    <div class="action-buttons">

                        <button
                            class="edit-button"
                            onclick="editTable(${table.id})">
                            Edit
                        </button>

                        <button
                            class="delete-button"
                            onclick="deleteTable(${table.id})">
                            Delete
                        </button>

                    </div>

                </td>

            </tr>
        `;

    }).join("");
}


function updateTableStatistics(tables) {

    const totalTables = tables.length;

    const availableTables = tables.filter(
        table =>
            table.status &&
            table.status.toUpperCase() === "FREE"
    ).length;


    const occupiedTables = tables.filter(
        table =>
            table.status &&
            table.status.toUpperCase() === "OCCUPIED"
    ).length;


    document.getElementById("totalTables").textContent =
        totalTables;

    document.getElementById("availableTables").textContent =
        availableTables;

    document.getElementById("occupiedTables").textContent =
        occupiedTables;
}


function openTableModal() {

    editingTableId = null;

    document.getElementById("modalTitle").textContent =
        "Add Table";

    document.getElementById("tableForm").reset();

    document.getElementById("tableId").value = "";

    document.getElementById("status").value = "FREE";

    document.getElementById("tableModal").classList.add("show");
}


function closeTableModal() {

    document.getElementById("tableModal")
        .classList.remove("show");
}


async function editTable(id) {

    try {

        const table =
            await apiRequest(`/tables/${id}`);

        editingTableId = id;

        document.getElementById("modalTitle").textContent =
            "Edit Table";

        document.getElementById("tableId").value =
            table.id;

        document.getElementById("tableNumber").value =
            table.tableNumber;

        document.getElementById("capacity").value =
            table.capacity;

        document.getElementById("status").value =
            table.status || "FREE";

        document.getElementById("tableModal")
            .classList.add("show");

    } catch (error) {

        alert(error.message);
    }
}


async function saveTable() {

    const tableNumber =
        document.getElementById("tableNumber").value.trim();

    const capacity =
        Number(document.getElementById("capacity").value);

    const status =
        document.getElementById("status").value;


    if (!tableNumber) {

        alert("Table number is required.");
        return;
    }


    if (!capacity || capacity < 1) {

        alert("Capacity must be at least 1.");
        return;
    }


    const tableData = {

        tableNumber: tableNumber,

        capacity: capacity,

        status: status

    };


    try {

        if (editingTableId) {

            await apiRequest(
                `/tables/${editingTableId}`,
                {
                    method: "PUT",
                    body: JSON.stringify(tableData)
                }
            );

            alert("Table updated successfully.");

        } else {

            await apiRequest(
                "/tables",
                {
                    method: "POST",
                    body: JSON.stringify(tableData)
                }
            );

            alert("Table added successfully.");
        }


        closeTableModal();

        await loadTables();

    } catch (error) {

        alert(error.message);
    }
}


async function deleteTable(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this table?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            `/tables/${id}`,
            {
                method: "DELETE"
            }
        );

        alert("Table deleted successfully.");

        await loadTables();

    } catch (error) {

        alert(error.message);
    }
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