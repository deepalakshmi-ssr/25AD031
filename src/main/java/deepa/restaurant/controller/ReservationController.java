package deepa.restaurant.controller;

import deepa.restaurant.entity.Reservation;
import deepa.restaurant.service.ReservationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurant/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(
            ReservationService reservationService) {

        this.reservationService = reservationService;
    }

    // CREATE RESERVATION
    @PostMapping("/table/{tableId}")
    public ResponseEntity<Reservation> createReservation(
            @PathVariable Long tableId,
            @RequestBody Reservation reservation) {

        return ResponseEntity.ok(
                reservationService.createReservation(
                        reservation,
                        tableId
                )
        );
    }

    // GET ALL RESERVATIONS
    @GetMapping
    public ResponseEntity<List<Reservation>> getAllReservations() {

        return ResponseEntity.ok(
                reservationService.getAllReservations()
        );
    }

    // GET RESERVATION BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Reservation> getReservationById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                reservationService.getReservationById(id)
        );
    }

    // UPDATE RESERVATION
    @PutMapping("/{id}")
    public ResponseEntity<Reservation> updateReservation(
            @PathVariable Long id,
            @RequestBody Reservation reservation) {

        return ResponseEntity.ok(
                reservationService.updateReservation(
                        id,
                        reservation
                )
        );
    }

    // DELETE RESERVATION
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservation(
            @PathVariable Long id) {

        reservationService.deleteReservation(id);

        return ResponseEntity.noContent().build();
    }
}