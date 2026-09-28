package deepa.restaurant.service;

import deepa.restaurant.entity.Reservation;
import deepa.restaurant.entity.RestaurantTable;
import deepa.restaurant.repository.ReservationRepository;
import deepa.restaurant.repository.RestaurantTableRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RestaurantTableRepository restaurantTableRepository;

    public ReservationService(
            ReservationRepository reservationRepository,
            RestaurantTableRepository restaurantTableRepository) {

        this.reservationRepository = reservationRepository;
        this.restaurantTableRepository = restaurantTableRepository;
    }

    // CREATE RESERVATION
    public Reservation createReservation(
            Reservation reservation,
            Long tableId) {

        RestaurantTable table = restaurantTableRepository.findById(tableId)
                .orElseThrow(() ->
                        new RuntimeException("Restaurant table not found"));

        // Rule 1: Table must be FREE
        if (!"FREE".equalsIgnoreCase(table.getStatus())) {
            throw new RuntimeException(
                    "Table is not available. Current status: "
                            + table.getStatus()
            );
        }

        // Rule 2: Party size cannot exceed table capacity
        if (reservation.getPartySize() > table.getCapacity()) {
            throw new RuntimeException(
                    "Party size exceeds table capacity"
            );
        }

        // Rule 3: End time must be after start time
        if (!reservation.getEndTime().isAfter(
                reservation.getStartTime())) {

            throw new RuntimeException(
                    "End time must be after start time"
            );
        }

        // Rule 4: Check overlapping reservations
        List<Reservation> overlappingReservations =
                reservationRepository
                        .findByRestaurantTableIdAndReservationDateAndStartTimeLessThanAndEndTimeGreaterThan(
                                tableId,
                                reservation.getReservationDate(),
                                reservation.getEndTime(),
                                reservation.getStartTime()
                        );

        if (!overlappingReservations.isEmpty()) {
            throw new RuntimeException(
                    "Table already has an overlapping reservation"
            );
        }

        reservation.setRestaurantTable(table);
        reservation.setStatus("CONFIRMED");

        return reservationRepository.save(reservation);
    }

    // GET ALL RESERVATIONS
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    // GET RESERVATION BY ID
    public Reservation getReservationById(Long id) {

        return reservationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Reservation not found"));
    }

    // UPDATE RESERVATION
    public Reservation updateReservation(
            Long id,
            Reservation updatedReservation) {

        Reservation existingReservation =
                getReservationById(id);

        existingReservation.setCustomerName(
                updatedReservation.getCustomerName());

        existingReservation.setPhone(
                updatedReservation.getPhone());

        existingReservation.setReservationDate(
                updatedReservation.getReservationDate());

        existingReservation.setStartTime(
                updatedReservation.getStartTime());

        existingReservation.setEndTime(
                updatedReservation.getEndTime());

        existingReservation.setPartySize(
                updatedReservation.getPartySize());

        if (updatedReservation.getStatus() != null &&
                !updatedReservation.getStatus().isBlank()) {

            existingReservation.setStatus(
                    updatedReservation.getStatus());
        }

        return reservationRepository.save(existingReservation);
    }

    // DELETE RESERVATION
    public void deleteReservation(Long id) {

        Reservation reservation =
                getReservationById(id);

        RestaurantTable table =
                reservation.getRestaurantTable();

        reservationRepository.delete(reservation);

        // Free the table after cancellation/deletion
        table.setStatus("FREE");
        restaurantTableRepository.save(table);
    }
}